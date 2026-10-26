async (page) => {
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1')));
 const leave=async()=>{await page.getByRole('button',{name:'← 保存退出',exact:true}).click();await page.getByRole('button',{name:'保存并回到今日',exact:true}).click();await page.getByRole('button',{name:'结束',exact:true}).click();};
 await page.getByRole('button',{name:'今日',exact:true}).click();
 await page.getByRole('button',{name:'结束',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U5L2');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const wordId=(await state()).session.questions[0].wordId;
 await page.getByRole('button',{name:'想不起来',exact:true}).click();
 await leave();
 await page.getByRole('button',{name:'薄弱词本',exact:true}).click();
 const word=await page.evaluate(id=>window.CIJIAN_WORDS.find(w=>w.id===id).word,wordId);
 await page.getByText(word,{exact:true}).waitFor();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U1L1');
 await page.locator('#quiz-mode').selectOption('spelling');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const spellingId=(await state()).session.questions[0].wordId;
 const answer=await page.evaluate(id=>window.CIJIAN_WORDS.find(w=>w.id===id).word,spellingId);
 await page.getByRole('textbox',{name:'英文拼写',exact:true}).fill(answer);
 await page.getByRole('button',{name:'确定记得',exact:true}).click();
 await page.getByRole('button',{name:'确认答案 →',exact:true}).click();
 const result=(await state()).events.filter(e=>e.type==='grade'&&e.wordId===spellingId&&e.dimension==='spelling').at(-1);
 if(!result?.correct||result.confidence!=='sure')throw Error('Spelling result was not saved correctly');
 await leave();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 console.log('PASS: lesson selection, newly tested word enters weak book, spelling input survives confidence selection, spelling grade saved.');
}
