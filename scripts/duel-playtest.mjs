// Deterministic developer fixture for replaying a real shared-board game through the UI.
import '../game/engine.js';
import {writeFileSync} from 'node:fs';
const E=globalThis.ReedEngine;
let s=E.create(731,'walk','duo','lens');const path=[];
const prefix=[{type:'observe',id:5},{type:'scout'},{type:'wait'},{type:'focus'},{type:'observe',id:7},{type:'move',to:1},{type:'move',to:5},{type:'next'}];
function apply(a){const actor=s.active,r=E.act(s,a);if(!r.ok||!E.valid(r.state))throw Error('Invalid fixture action '+JSON.stringify(a));s=r.state;path.push({action:a,actor,round:s.round,active:s.active,ap:s.ap,quiet:s.quiet,pos:s.pos,focus:s.focus,scores:E.scores(s),finished:s.finished});}
for(const a of prefix)apply(a);
while(!s.finished){
 if(s.ap===0){apply({type:'next'});continue;}
 const options=[{type:'wait'},...E.NODES.flatMap((_,to)=>E.neighbors(s.pos,to)?[{type:'move',to}]:[]),...E.flock(s,s.pos).map(id=>({type:'observe',id})),{type:'focus'},{type:'scout'}];
 const ranked=options.map(a=>({a,r:E.act(s,a)})).filter(x=>x.r.ok).map(x=>({...x,v:utility(s,x.r.state,x.a)})).sort((a,b)=>b.v-a.v);
 apply(ranked[0].a);if(path.length>46)throw Error('Too many actions');
}
function utility(before,after,a){const v=E.playerView(after,before.active),old=E.playerView(before),gain=E.score(v)-E.score(old),newBirds=E.flock(v,v.pos).filter(id=>E.isNew(v,id));
 const bestReady=Math.max(0,...newBirds.filter(id=>v.quiet>=E.requirement(v,v.pos,id)).map(id=>E.value(v,id)));
 const oldReady=Math.max(0,...E.flock(old,old.pos).filter(id=>E.isNew(old,id)&&old.quiet>=E.requirement(old,old.pos,id)).map(id=>E.value(old,id)));
 if(a.type==='observe')return gain*10+E.personal(v).progress;
 if(a.type==='focus')return bestReady>oldReady?bestReady*8:0;
 if(a.type==='wait')return bestReady*(before.ap>1?5:1)+(v.quiet-old.quiet)*1.5;
 if(a.type==='scout')return bestReady*(before.ap>1?4:0)-3;
 return bestReady*(before.ap>1?4:1)+newBirds.length*2+(!old.records.some(r=>r.node===v.pos)?2:0);
}
const report={seed:731,kits:['walk','lens'],scores:E.scores(s),species:s.players.map(p=>new Set(p.records.map(r=>r.id)).size),path};
writeFileSync('docs/duel-ui-path.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scores:report.scores,species:report.species,remaining:path.slice(8).map(x=>x.action),expectations:path.slice(8).map(x=>[x.round,x.active,x.ap,x.quiet,x.pos,...x.scores])}));
