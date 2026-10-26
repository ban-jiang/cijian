async (page) => {
 const store=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1')));
 await page.reload();
 if(await page.getByRole('button',{name:'保存并回到今日',exact:true}).count())await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 const lessonIds=await page.locator('#lesson-select option').evaluateAll(nodes=>nodes.map(n=>n.value));
 for(const id of lessonIds){
  await page.locator('#lesson-select').selectOption(id);
  await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
  await page.locator('.question').waitFor();
  if((await store()).session.slot!=='lesson:'+id+':meaning')throw Error('Wrong lesson '+id);
  if(await page.getByText('这次有多确定？',{exact:true}).count())throw Error('Confidence controls remain');
  await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
  await page.getByRole('button',{name:'课后测验',exact:true}).click();
 }
 await page.locator('#lesson-select').selectOption('U1L1');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const first=(await store()).session.questions[(await store()).session.index];
 const firstWord=await page.evaluate(id=>window.CIJIAN_WORDS.find(w=>w.id===id),first.wordId);
 const favorite=page.getByRole('button',{name:/☆ 收藏|★ 已收藏/});
 if(await favorite.getAttribute('aria-pressed')==='true')await favorite.click();
 await page.getByRole('button',{name:'☆ 收藏',exact:true}).click();
 await page.locator('.option').filter({has:page.locator('b').filter({hasText:firstWord.meaning})}).first().click();
 await page.getByRole('status').filter({hasText:'答对了。'}).waitFor();
 const last=(await store()).events.filter(e=>e.type==='grade').at(-1);
 if(!last.correct||last.wordId!==first.wordId)throw Error('Direct grading failed');
 await page.getByRole('button',{name:'下一题 →',exact:true}).click();
 const second=(await store()).session.questions[(await store()).session.index];
 await page.getByRole('button',{name:'想不起来',exact:true}).click();
 await page.getByRole('status').filter({hasText:'这个词，先留在薄弱词本。'}).waitFor();
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.getByRole('button',{name:'薄弱词本',exact:true}).click();
 const secondWord=await page.evaluate(id=>window.CIJIAN_WORDS.find(w=>w.id===id).word,second.wordId);
 await page.getByText(secondWord,{exact:true}).waitFor();
 if(await page.locator('.weak-card').filter({has:page.getByText(firstWord.word,{exact:true})}).count())throw Error('Correctly answered favorite was auto marked weak');
 await page.getByRole('button',{name:/^收藏 \d+$/}).click();
 await page.getByText(firstWord.word,{exact:true}).waitFor();
 await page.reload();
 if(await page.getByRole('button',{name:'保存并回到今日',exact:true}).count())await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();
 await page.getByRole('button',{name:'薄弱词本',exact:true}).click();
 await page.getByRole('button',{name:/^收藏 \d+$/}).click();
 await page.getByText(firstWord.word,{exact:true}).waitFor();
 console.log('PASS: all 18 lesson meaning tests open despite pending sessions; confidence controls removed; direct grading; only wrong answers auto-weak; manual favorite survives reload.');
}
