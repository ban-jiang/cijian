import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const source=path.resolve(process.argv[2]||path.join(root,'../词表交接'));
const read=name=>JSON.parse(fs.readFileSync(path.join(source,name+'.json'),'utf8'));
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'web/data.js'),'utf8'),ctx);
const original=ctx.window.CIJIAN_WORDS.filter(w=>w.kind==='core'&&w.page<=125);
assert.equal(original.length,887);
const variants=read('spelling-variants').map(v=>[v.british,v.american]);
variants.push(['enrol','enroll'],['instal','install'],['enrolment','enrollment'],['symmetric','symmetrical']);
const normalise=w=>{
 const printedWord=w.word;
 let word=printedWord.split('/')[0];
 word=word.replace('enrol(l)ment','enrolment').replace('enrol(l)','enrol').replace('instal(l)','instal').replace('symmetric(al)','symmetrical');
 return {...w,word,...(word!==printedWord?{printedWord}:{}),...(variants.find(g=>g.includes(word))?{acceptedSpellings:variants.find(g=>g.includes(word))}:{})};
};
const core=[...original,...read('remaining-words')].map(normalise);
const rawDerived=read('derived-words');
// Preserve the richer second entry and its original identity. No existing public progress uses either ID.
const derived=rawDerived.filter(w=>w.id!=='p145-suburban').map(normalise).map(w=>
 ['p103-imprisonment','p140-alignment'].includes(w.id)?{...w,verified:false,reviewNote:'交接疑点中要求回看原页，暂不出题'}:w);
const words=[...core,...derived];
const ids=new Set(words.map(w=>w.id));
assert.equal(ids.size,words.length);
for(const w of words){assert.ok(w.word&&w.meaning&&Number.isInteger(w.page));assert.ok(w.unit>=1&&w.unit<=10&&w.lesson>=1&&w.lesson<=4);if(w.kind==='derived')assert.ok(ids.has(w.parentId),w.id);}
const lessons=read('lessons').map(l=>{
 const c=core.filter(w=>w.unit===l.unit&&w.lesson===l.lesson),d=derived.filter(w=>w.unit===l.unit&&w.lesson===l.lesson);
 assert.equal(c.length,l.coreCount,l.id);
 return {...l,coreCount:c.length,derivedCount:d.length,testableDerivedCount:d.filter(w=>w.verified).length};
});
assert.equal(lessons.length,40);
const report={core:core.length,derived:derived.length,rawDerived:rawDerived.length,testableDerived:derived.filter(w=>w.verified).length,pending:derived.filter(w=>!w.verified).length,total:words.length,lessons:40,sourcePdfPages:'10–292',excludedRange:'PDF 293 页起基础词表及索引不在本次交接范围',duplicateResolution:{removed:'p145-suburban',retained:'p146-suburban'},uncertainItems:read('uncertain-items'),verification:'校验了结构、课程计数、父词关联和拼写格式；未逐页独立复核所有扫描页。verified 沿用交接标记，并保守隔离两条明确疑点。'};
fs.writeFileSync(path.join(root,'web/data.js'),'window.CIJIAN_WORDS='+JSON.stringify(words)+';\nwindow.CIJIAN_VARIANTS='+JSON.stringify(variants)+';\nwindow.CIJIAN_CORPUS='+JSON.stringify(report)+';\n');
fs.mkdirSync(path.join(root,'data'),{recursive:true});
fs.writeFileSync(path.join(root,'data/import-audit.json'),JSON.stringify({...report,lessons},null,2)+'\n');
console.log(JSON.stringify({...report,uncertainItems:undefined},null,2));
