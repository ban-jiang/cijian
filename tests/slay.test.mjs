import {test} from 'node:test';
import assert from 'node:assert/strict';
import {trimSlain,slayWarning} from '../web/slay.js';
const s={slot:'lesson:U1L1:meaning',index:1,questions:[{wordId:'a'},{wordId:'b'},{wordId:'c'},{wordId:'b'}],feedback:{correct:true},selection:'b'};
test('slay removes current and future repeats, keeping completed questions/history',()=>{const t=trimSlain(s,{a:'now',b:'now'});assert.deepEqual(t.questions,[{wordId:'a'},{wordId:'c'}]);assert.equal(t.index,1);assert.equal(t.feedback,null);assert.equal(s.questions.length,4);});
test('only explicit inclusion or a dedicated sampling session keeps slain words',()=>{assert.equal(trimSlain({...s,includeSlain:true},{b:'now'}).questions.length,4);assert.equal(trimSlain({...s,slot:'slain'},{b:'now'}).questions.length,4);});
test('removing a later word preserves the current answer',()=>{assert.deepEqual(trimSlain(s,{c:'now'}).feedback,s.feedback);});
test('last question can be slain without an invalid index',()=>{const t=trimSlain({...s,index:3},{b:'now'});assert.equal(t.index,t.questions.length);});
test('favorites and recent mistakes get a warning; old errors do not',()=>{assert.ok(slayWarning('b',['b'],[],'2026-10-26').includes('收藏'));assert.ok(slayWarning('b',[],[{type:'grade',wordId:'b',correct:false,at:'2026-10-25T00:00:00Z'}],'2026-10-26').includes('7天'));assert.equal(slayWarning('b',[],[{type:'grade',wordId:'b',correct:false,at:'2026-09-25T00:00:00Z'}],'2026-10-26'),'');});
