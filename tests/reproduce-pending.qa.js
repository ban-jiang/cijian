async (page) => {
 await page.locator('#lesson-select').selectOption('U1L1');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U1L2');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 await page.getByRole('status').filter({hasText:'上次还有未完成测验'}).waitFor();
 console.log('REPRODUCED: unfinished lesson globally blocks every other lesson.');
}
