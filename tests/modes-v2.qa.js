async (page) => {
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1')));
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U2L1');
 await page.locator('#quiz-mode').selectOption('spelling');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const q=(await state()).session.questions[0];
 const word=await page.evaluate(id=>window.CIJIAN_WORDS.find(w=>w.id===id).word,q.wordId);
 await page.getByRole('textbox',{name:'英文拼写',exact:true}).fill(word);
 if(!await page.getByRole('button',{name:'确认答案 →',exact:true}).isEnabled())throw Error('Spelling still requires confidence');
 await page.getByRole('button',{name:'确认答案 →',exact:true}).click();
 await page.getByRole('status').filter({hasText:'答对了。'}).waitFor();
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U4L3');
 await page.locator('#quiz-mode').selectOption('mixed');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const s=(await state()).session;
 if(s.slot!=='lesson:U4L3:mixed'||new Set(s.questions.map(q=>q.dimension)).size!==2)throw Error('Mixed mode did not start correctly');
 if(await page.getByText('这次有多确定？',{exact:true}).count())throw Error('Confidence UI remains');
 if(!await page.getByRole('button',{name:'☆ 收藏',exact:true}).count())throw Error('Favorite missing');
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 console.log('PASS: spelling submits without confidence, mixed lesson starts, switching modes retains other sessions.');
}
