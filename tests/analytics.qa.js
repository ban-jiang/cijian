async(page)=>{
 const base='http://127.0.0.1:5182';
 await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.locator('#analytics-enabled').check();
 await page.waitForResponse(r=>r.url().endsWith('/api/event')&&r.status()===200).catch(()=>{});
 const noAuth=await page.request.get(base+'/api/stats');if(noAuth.status()!==401)throw Error('Stats leaked to anonymous');
 const anonymous=await page.request.get(base+'/admin');if(anonymous.status()!==401)throw Error('Admin not protected');
 // Test-only second device demonstrates attribution and server-side deduplication without being excluded as this browser.
 for(const kind of ['visit','visit','active','complete','complete']){
  const r=await page.request.post(base+'/api/event',{headers:{origin:base},data:{deviceId:'qa-other-device-12345678',kind,source:'bilibili',sessionId:'qa-other-session-12345678'}});
  if(!r.ok())throw Error('Collection failed '+r.status());
 }
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#include-derived').uncheck();
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 await page.getByRole('button',{name:'想不起来',exact:true}).click();
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.goto(base+'/admin');
 await page.getByRole('link',{name:'使用作者的 ChatGPT 账号登录 →',exact:true}).click();
 await page.locator('#visitors').filter({hasText:'1'}).waitFor();
 if(await page.locator('#completed').textContent()!=='1'||await page.locator('#active').textContent()!=='1'||await page.locator('#quizzes').textContent()!=='1')throw Error('Dashboard deduplication failed');
 if(await page.locator('#retention').textContent()!=='—')throw Error('Unmature retention shown as percentage');
 const response=await page.request.get(base+'/api/stats');const stats=await response.json();if(stats.sources[0].source!=='bilibili')throw Error('Source lost');
 const download=page.waitForEvent('download');await page.locator('#csv').click();await download;
 const size=await page.evaluate(()=>({view:innerWidth,width:document.documentElement.scrollWidth}));if(size.width>size.view)throw Error('Admin mobile overflow');
 await page.getByRole('link',{name:'返回测验 ↗',exact:true}).click();
 await page.getByRole('button',{name:'设置',exact:true}).click();
 if(await page.locator('#analytics-enabled').isChecked())throw Error('Admin browser not excluded');
}
