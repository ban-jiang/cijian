import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spellingMatches,fold,defaults} from '../web/engine.js';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../web/data.js',import.meta.url),'utf8'),ctx);
const words=ctx.window.CIJIAN_WORDS,report=ctx.window.CIJIAN_CORPUS;
test('corpus has 40 lessons, unique IDs and resolvable parent links',()=>{
 assert.equal(words.length,3337);assert.equal(report.core,2179);assert.equal(report.testableDerived,872);assert.equal(report.pending,286);
 assert.equal(new Set(words.map(w=>w.id)).size,words.length);
 assert.equal(new Set(words.map(w=>`${w.unit}/${w.lesson}`)).size,40);
 const ids=new Set(words.filter(w=>w.kind==='core').map(w=>w.id));
 for(const w of words.filter(w=>w.kind==='derived'))assert.ok(ids.has(w.parentId),w.id);
 assert.equal(words.filter(w=>w.word==='suburban').length,1);
});
test('all printed suffix notations become spellable words and accepted variants',()=>{
 for(const w of words.filter(w=>w.verified)){
  assert.match(w.word,/^[a-z]+(?:[- '][a-z]+)*$/i,w.id);
  for(const variant of w.acceptedSpellings||[])assert.ok(spellingMatches(variant,w.word,w.acceptedSpellings),w.id);
 }
 assert.ok(spellingMatches('recognize','recognise',['recognise','recognize']));
 assert.ok(spellingMatches('enrollment','enrolment',['enrolment','enrollment']));
 assert.ok(!spellingMatches('recognization','recognise',['recognise','recognize']));
});
test('legacy portray progress stays at 673 core words and does not silently learn derived words',()=>{
 const states=fold(words,[],{...defaults,baselinePage:98,baselineWord:'portray'});
 assert.equal(states.filter(s=>s.eligible).length,673);
 assert.equal(states.filter(s=>s.eligible&&s.word.kind==='derived').length,0);
});
test('pending records never become eligible; learning an extension does not learn its parent',()=>{
 const ids=words.filter(w=>!w.verified).map(w=>w.id);
 const derived=words.find(w=>w.id==='p10-ambitious');
 const states=fold(words,[{id:'learn',at:'2026-10-26T04:00:00Z',type:'learn',wordIds:[...ids,derived.id]}],defaults);
 assert.equal(states.filter(s=>s.eligible).length,1);
 assert.equal(states.find(s=>s.word.id===derived.parentId).eligible,false);
});
