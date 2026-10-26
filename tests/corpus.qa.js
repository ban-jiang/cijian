async(page)=>{
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1')));
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 if(await page.locator('#lesson-select option').count()!==40)throw Error('Missing lessons');
 const lessonIds=await page.locator('#lesson-select option').evaluateAll(es=>es.map(e=>e.value));
 for(const id of lessonIds){
  await page.locator('#lesson-select').selectOption(id);
  await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
  const s=await read();
  const ok=await page.evaluate(({id,qs})=>qs.every(q=>{const w=window.CIJIAN_WORDS.find(w=>w.id===q.wordId);return w?.verified&&`U${w.unit}L${w.lesson}`===id}),{id,qs:s.session.questions});
  if(!ok)throw Error('Invalid question in '+id);
  await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
  await page.getByRole('button',{name:'课后测验',exact:true}).click();
 }
 await page.locator('#lesson-select').selectOption('U1L1');
 await page.locator('#include-derived').uncheck();
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 let s=await read();
 if(s.session.questions.length!==28)throw Error('Core-only count');
 const original=s.session.questions[0].wordId;
 await page.getByRole('button',{name:'想不起来',exact:true}).click();
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#include-derived').check();
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 s=await read();
 const extendedCount=await page.evaluate(()=>window.CIJIAN_WORDS.filter(w=>w.verified&&w.unit===1&&w.lesson===1).length);
 if(s.session.questions.length!==extendedCount||extendedCount<=28)throw Error('Extended count');
 await page.getByRole('button',{name:'← 保存退出',exact:true}).click();
 await page.reload();
 s=await read();
 if(!s.events.some(e=>e.wordId===original&&e.correct===false))throw Error('Lost grade on reload');
 if(!s.sessions['lesson:U1L1:meaning']||!s.sessions['lesson:U1L1:meaning:extended'])throw Error('Scope sessions collided');
 await page.getByRole('button',{name:'课后测验',exact:true}).click();
 await page.locator('#lesson-select').selectOption('U10L4');
 await page.locator('#quiz-mode').selectOption('spelling');
 await page.getByRole('button',{name:'开始这课测验 →',exact:true}).click();
 const answer=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('cijian-web-quiz-trial-v1'));return window.CIJIAN_WORDS.find(w=>w.id===s.session.questions[s.session.index].wordId).word});
 await page.getByRole('textbox',{name:'英文拼写',exact:true}).fill(answer);
 await page.getByRole('button',{name:'确认答案 →',exact:true}).click();
 if(!(await read()).session.feedback.correct)throw Error('Spelling failed');
 const size=await page.evaluate(()=>({view:innerWidth,width:document.documentElement.scrollWidth}));
 if(size.width>size.view)throw Error('Mobile overflow');
 console.log('PASS: all 40 lessons, core/extended scope, pending exclusion, saved grades, separate sessions, last-lesson spelling, mobile layout');
}
