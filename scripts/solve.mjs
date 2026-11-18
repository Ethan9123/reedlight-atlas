// Bounded development search; never used by the shipped game.
import '../game/engine.js';
const E=globalThis.ReedEngine;
const seed=Number(process.argv[2]??731),style=process.argv[3]??'walk',width=Number(process.argv[4]??160);
let beam=[{s:E.create(seed,style),path:[]}];
for(let step=0;step<26;step++){
 const next=[];
 for(const item of beam){const s=item.s;if(s.finished){next.push(item);continue;}
 const actions=s.ap===0?[{type:'next'}]:[{type:'wait'},...(s.focus>0&&(s.quiet<4||s.disturbance[s.pos]>0)?[{type:'focus'}]:[]),...E.NODES.flatMap((_,to)=>E.neighbors(s.pos,to)?[{type:'move',to}]:[]),...E.flock(s,s.pos).filter(id=>s.quiet>=E.requirement(s,s.pos,id)).map(id=>({type:'observe',id}))];
 for(const a of actions){const r=E.act(s,a);if(r.ok)next.push({s:r.state,path:[...item.path,a]});}}
 const seen=new Set();beam=next.sort((a,b)=>rank(b.s)-rank(a.s)).filter(o=>{const k=JSON.stringify([o.s.round,o.s.ap,o.s.focus,o.s.walked,o.s.pos,o.s.quiet,o.s.records,o.s.taken,o.s.disturbance]);if(seen.has(k))return false;seen.add(k);return true;}).slice(0,width);
}
function rank(s){return E.score(s)+s.quiet*.6+s.focus*2+E.personal(s).progress*1.3+new Set(s.records.map(r=>E.BIRDS[r.id].hab)).size*1.8;}
const winner=beam.filter(o=>o.s.finished).sort((a,b)=>E.score(b.s)-E.score(a.s))[0];if(!winner||E.score(winner.s)<45)throw new Error('Target not reached in bounded strategy search');
console.log(JSON.stringify({seed,style,score:E.score(winner.s),rank:E.rank(winner.s),species:new Set(winner.s.records.map(r=>r.id)).size,personal:E.personal(winner.s).done,path:winner.path},null,2));
