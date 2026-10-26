async (page) => {
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1')));
  const before=await state();
  const grades=before.events.filter(e=>e.type==='grade').length;
  await page.reload();
  await page.getByRole('heading',{name:'随时停，也能接着来。',exact:true}).waitFor();
  await page.getByRole('button',{name:'继续测验 →',exact:true}).click();
  await page.getByRole('heading',{name:'occur',exact:true}).waitFor();
  if(!(await page.getByRole('status').textContent()).includes('选对了'))throw Error('Feedback not restored');
  if((await state()).events.filter(e=>e.type==='grade').length!==grades)throw Error('Duplicate grade after reload');
  await page.getByRole('button',{name:'下一题 →',exact:true}).click();
  await page.getByRole('button',{name:'暂停',exact:true}).click();
  const time1=(await state()).events.filter(e=>e.type==='time').reduce((s,e)=>s+e.seconds,0);
  await page.waitForTimeout(1300);
  const time2=(await state()).events.filter(e=>e.type==='time').reduce((s,e)=>s+e.seconds,0);
  if(time1!==time2)throw Error('Timer continued during pause');
  await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();
  await page.getByText('上次的测验还在',{exact:true}).waitFor();
  await page.getByRole('button',{name:'继续 →',exact:true}).click();
  if((await state()).session.index!==1)throw Error('Wrong resumed question');
  const layout=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth);
  if(!layout)throw Error('Mobile horizontal overflow');
  await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
  await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();
  await page.getByRole('button',{name:'薄弱词本',exact:true}).click();
  await page.getByText('occur',{exact:true}).waitFor();
  console.log('PASS: guessed-correct weakness, persisted feedback, resumable quiz, no duplicate grades, paused timer, mobile layout.');
}
