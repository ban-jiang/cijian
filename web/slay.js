export function trimSlain(session,slain){
 if(!session||session.includeSlain||session.slot==='slain')return session;
 const before=session.questions.slice(0,session.index),rest=session.questions.slice(session.index);
 const removed=!!slain[rest[0]?.wordId];
 return {...session,questions:[...before,...rest.filter(q=>!slain[q.wordId])],...(removed?{feedback:null,selection:'',answer:'',confidence:null,usedHint:false}:{})};
}
export function slayWarning(id,favorites,events,today){
 const warnings=[];
 if(favorites.includes(id))warnings.push('这个词已收藏，斩掉后也会退出收藏词练习。收藏标记仍保留。');
 if(events.some(e=>e.type==='grade'&&e.wordId===id&&!e.correct&&Date.parse(e.at)>=Date.parse(today+'T00:00:00+08:00')-7*86400000))warnings.push('这个词最近7天答错过。');
 return warnings.join(' ');
}
