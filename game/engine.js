/* Reedlight Atlas — original deterministic rules. No browser or network dependency. */
(function (root) {
'use strict';
const BIRDS = [
 {id:0,hab:'reed',name:['铜喉苇雀','Copperthroat'],subtitle:['一枚藏在苇间的小火种','A small ember among the reeds'],value:4,need:1,shape:'round',color:'#b9613e',accent:'#efc584'},
 {id:1,hab:'reed',name:['月眉苇鹭','Moonbrow'],subtitle:['把月色缝在眉梢','A seam of moonlight above the eye'],value:6,need:2,shape:'heron',color:'#627a68',accent:'#f0dfb1'},
 {id:2,hab:'reed',name:['金线长尾','Goldthread'],subtitle:['尾羽像一道未落的光','A tail like lingering light'],value:7,need:3,shape:'tail',color:'#a78537',accent:'#e6d7aa'},
 {id:3,hab:'reed',name:['露冠小隐','Dewcrown'],subtitle:['只有静下来，才能遇见','Found only when the world is still'],value:9,need:4,shape:'round',color:'#3f665d',accent:'#e2c269'},
 {id:4,hab:'water',name:['青背溪翎','Azureback'],subtitle:['一抹贴着水面的蓝','A brush of blue along the water'],value:4,need:1,shape:'king',color:'#377e8a',accent:'#dda25a'},
 {id:5,hab:'water',name:['银腹浅鹬','Silverbelly'],subtitle:['把涟漪走成一首短诗','Small steps, a poem of ripples'],value:6,need:2,shape:'wader',color:'#718c8e',accent:'#f2ecda'},
 {id:6,hab:'water',name:['霞肩白鹭','Rosemantle'],subtitle:['晚霞停在它的肩上','The sunset rests upon its shoulders'],value:8,need:3,shape:'heron',color:'#eee9d7',accent:'#ca8062'},
 {id:7,hab:'water',name:['弯月燕鸥','Crescentwing'],subtitle:['在天空留下一道括号','A quiet parenthesis in the sky'],value:9,need:4,shape:'tern',color:'#dae4df',accent:'#304f56'},
 {id:8,hab:'grove',name:['栗颊林雀','Chestnutcheek'],subtitle:['林间最轻的一声问候','The lightest greeting in the grove'],value:4,need:1,shape:'round',color:'#9d6349',accent:'#d8c6a0'},
 {id:9,hab:'grove',name:['苔纹啄木','Mossbar'],subtitle:['树干上的慢拍子','A slow rhythm on the tree trunk'],value:6,need:2,shape:'tail',color:'#61745a',accent:'#cf9d6a'},
 {id:10,hab:'grove',name:['绯羽山翎','Vermilion'],subtitle:['落叶也为它让路','Even the leaves make room'],value:7,need:3,shape:'king',color:'#b8513f',accent:'#e7bd76'},
 {id:11,hab:'grove',name:['星斑暮鸮','Starling Owl'],subtitle:['把夜色提前带来一点','Carrying a little of the coming night'],value:9,need:4,shape:'owl',color:'#6a6b62',accent:'#dfc595'}
];
const NODES = [
 {hab:'grove',name:['杉影坡','Cedar shade'],x:19,y:22}, {hab:'reed',name:['风梳苇','Wind reeds'],x:49,y:18}, {hab:'water',name:['镜水湾','Mirror cove'],x:79,y:22},
 {hab:'reed',name:['旧木栈','Old boardwalk'],x:18,y:49}, {hab:'water',name:['浅汀','Shallow pool'],x:50,y:47}, {hab:'grove',name:['苔石林','Moss grove'],x:81,y:49},
 {hab:'water',name:['蓝溪口','Blue inlet'],x:20,y:77}, {hab:'grove',name:['南枝','South bough'],x:50,y:78}, {hab:'reed',name:['暮苇岛','Dusk island'],x:80,y:77}
];
const EVENTS = [
 {name:['晨露初醒','First light'],desc:['水域观察 +1 分','Water sightings +1 point'],hab:'water',bonus:1},
 {name:['林间漏光','Dappled light'],desc:['林地观察 +2 分','Grove sightings +2 points'],hab:'grove',bonus:2},
 {name:['风起苇梢','Reed breeze'],desc:['苇地需要多 1 点安静','Reeds need 1 extra stillness'],hab:'reed',need:1},
 {name:['潮水退去','Falling tide'],desc:['水域需要少 1 点安静','Water needs 1 less stillness'],hab:'water',need:-1},
 {name:['金色时刻','Golden hour'],desc:['苇地观察 +2 分','Reed sightings +2 points'],hab:'reed',bonus:2},
 {name:['归鸟入林','Homeward wings'],desc:['林地观察 +2 分','Grove sightings +2 points'],hab:'grove',bonus:2}
];
const TARGET = 45;
const KITS = [
 {id:'walk',name:['轻步漫游者','Trail wanderer'],item:['软底行靴','Soft-soled boots'],desc:['每轮第一次移动不损失安静。','Your first walk each round preserves stillness.'],goal:['在 4 片不同栖地记录鸟踪','Record birds at 4 different map locations'],max:4,color:'#678768'},
 {id:'lens',name:['稀羽追寻者','Rare-bird seeker'],item:['长焦镜筒','Long-focus lens'],desc:['稀有鸟的基础安静需求降低 1。','Rare birds have 1 less base stillness need.'],goal:['记录 3 种不同稀有鸟','Record 3 different rare species'],max:3,color:'#b68a4d'},
 {id:'sketch',name:['羽色收藏家','Feather collector'],item:['速写手帖','Pocket sketchbook'],desc:['每轮首种新鸟额外 +2 分。','Your first new species each round earns +2.'],goal:['收集 8 种不同鸟类','Collect 8 different bird species'],max:8,color:'#6b8d96'}
];
function hash(n){n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0;}
function neighbors(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<9&&b<9&&Math.abs((a%3)-(b%3))+Math.abs(Math.floor(a/3)-Math.floor(b/3))===1;}
function flock(s,node){const base={reed:0,water:4,grove:8}[NODES[node].hab];const h=hash(s.seed+node*71+s.round*199),first=h%3,second=s.round>=3?((first+1+(h%2))%4):((first+1)%3);let ids=[...new Set([base+first,base+second])];const swap=s.swaps?.[node];if(swap)ids=ids.map(id=>id===swap.out?swap.into:id);return ids.filter(id=>!s.taken.includes(node+':'+id));}
function scoutOption(s,node=s.pos){if(s.swaps?.[node])return null;const birds=flock(s,node);if(!birds.length)return null;const candidates=BIRDS.filter(b=>b.hab===NODES[node].hab&&!birds.includes(b.id)&&!s.taken.includes(node+':'+b.id)).map(b=>b.id);if(!candidates.length)return null;return {out:birds[0],into:candidates[hash(s.seed+node*97+s.round*211)%candidates.length]};}

function weather(s){if(s.legacyWeather)return EVENTS[s.round-1];const middle=[1,2,3,4].sort((a,b)=>hash(s.seed+a*3041)-hash(s.seed+b*3041)||a-b);return EVENTS[[0,...middle,5][s.round-1]];}
function kit(s){return KITS.find(k=>k.id===s.kit)||KITS[0];}
function isNew(s,id){return !s.records.some(r=>r.id===id);}
function requirement(s,node,id){const boost=s.kit==='lens'&&BIRDS[id].need>=3?1:0;return Math.max(1,Math.min(4,BIRDS[id].need+s.disturbance[node]+(weather(s).hab===NODES[node].hab?(weather(s).need||0):0)-boost));}
function chain(s){let count=0,last=null;for(let i=s.records.length-1;i>=0;i--){const r=s.records[i],hab=BIRDS[r.id].hab;if(s.records.findIndex(p=>p.id===r.id)!==i||hab===last)break;count++;last=hab;if(count===3)break;}return count;}
function combo(s,id){if(!isNew(s,id)||!s.records.length||BIRDS[s.records.at(-1).id].hab===BIRDS[id].hab||chain(s)===0)return 0;return chain(s)===1?2:4;}
function breakdown(s,id){if(!isNew(s,id))return {base:1,combo:0,kit:0,total:1};const base=BIRDS[id].value+(weather(s).hab===BIRDS[id].hab?(weather(s).bonus||0):0);const extra=s.kit==='sketch'&&!s.records.some((r,i)=>r.round===s.round&&s.records.findIndex(p=>p.id===r.id)===i)?2:0;const c=combo(s,id);return {base,combo:c,kit:extra,total:base+c+extra};}
function value(s,id){return breakdown(s,id).total;}
function objectives(s){const unique=[...new Set(s.records.map(r=>r.id))],habitats=new Set(unique.map(id=>BIRDS[id].hab));let trio=false;for(let i=2;i<s.records.length;i++)if(new Set(s.records.slice(i-2,i+1).map(r=>BIRDS[r.id].hab)).size===3)trio=true;const rare=unique.filter(id=>BIRDS[id].need>=3).length;return [{id:'habitats',done:habitats.size===3,progress:habitats.size,max:3,points:8},{id:'sequence',done:trio,progress:trio?3:0,max:3,points:6},{id:'rare',done:rare>=2,progress:Math.min(rare,2),max:2,points:8}];}
function personal(s){const k=kit(s),unique=[...new Set(s.records.map(r=>r.id))];const n=k.id==='walk'?new Set(s.records.map(r=>r.node)).size:k.id==='lens'?unique.filter(id=>BIRDS[id].need>=3).length:unique.length;return {progress:Math.min(n,k.max),max:k.max,done:n>=k.max,points:12};}
function score(s){return s.records.reduce((n,r)=>n+r.points,0)+objectives(s).filter(g=>g.done).reduce((n,g)=>n+g.points,0)+(personal(s).done?12:0);}
function rank(s){return [45,75,105].filter(n=>score(s)>=n).length;}
function createSolo(seed=731,style='walk'){return {version:3,mode:'solo',active:0,swaps:Array(9).fill(null),seed:Math.abs(Math.floor(Number.isFinite(Number(seed))?Number(seed):731))%1000000,kit:KITS.some(k=>k.id===style)?style:'walk',focus:2,walked:false,legacyWeather:false,round:1,ap:3,quiet:2,pos:4,records:[],taken:[],disturbance:Array(9).fill(0),finished:false,log:[]};}
function actSingle(s,action){
 const n=JSON.parse(JSON.stringify(s));
 const fail=reason=>({ok:false,reason,state:s});
 if(s.finished)return fail('finished');
 if(action.type==='next'){
  if(s.ap!==0)return fail('actionsLeft');
  if(s.round===6){n.finished=true;n.log.push({type:'finish'});return {ok:true,state:n};}
  n.round++;n.ap=3;n.quiet=Math.min(4,n.quiet+1);n.walked=false;n.taken=[];n.swaps=Array(9).fill(null);n.disturbance=Array(9).fill(0);n.log.push({type:'next',round:n.round});return {ok:true,state:n};
 }
 if(s.ap<=0)return fail('noActions');
 if(action.type==='focus'){
  if(s.focus<=0)return fail('noFocus');
  if(s.quiet===4&&s.disturbance[s.pos]===0)return fail('focusFull');
  n.focus--;n.quiet=Math.min(4,n.quiet+2);n.disturbance[s.pos]=0;n.log.push({type:'focus',round:s.round});return {ok:true,state:n};
 }
 if(action.type==='move'){
  if(!neighbors(s.pos,action.to))return fail('notAdjacent');
  n.pos=action.to;if(!(s.kit==='walk'&&!s.walked))n.quiet=Math.max(0,n.quiet-1);n.walked=true;
 }else if(action.type==='wait'){n.quiet=Math.min(4,n.quiet+2);n.disturbance[s.pos]=Math.max(0,n.disturbance[s.pos]-1);}
 else if(action.type==='scout'){const option=scoutOption(s);if(!option)return fail('noScout');n.swaps[s.pos]=option;}
 else if(action.type==='observe'){
  if(!flock(s,s.pos).includes(action.id))return fail('notPresent');
  if(s.quiet<requirement(s,s.pos,action.id))return fail('tooLoud');
  const points=breakdown(s,action.id);
  n.records.push({id:action.id,node:s.pos,round:s.round,points:points.total,combo:points.combo,kitBonus:points.kit});n.taken.push(s.pos+':'+action.id);n.quiet=Math.max(0,n.quiet-1);n.disturbance[s.pos]=Math.min(2,n.disturbance[s.pos]+1);
 }else return fail('unknownAction');
 n.ap--;n.log.push({...action,round:s.round});return {ok:true,state:n};
}
function valid(s){
 if(!s||s.version!==3||!['solo','duo'].includes(s.mode)||![0,1].includes(s.active)||!KITS.some(k=>k.id===s.kit)||!Number.isInteger(s.focus)||s.focus<0||s.focus>2||typeof s.walked!=='boolean'||typeof s.legacyWeather!=='boolean'||!Number.isInteger(s.seed)||s.seed<0||s.seed>=1000000||!Number.isInteger(s.round)||s.round<1||s.round>6||!Number.isInteger(s.ap)||s.ap<0||s.ap>3||!Number.isInteger(s.quiet)||s.quiet<0||s.quiet>4||!Number.isInteger(s.pos)||s.pos<0||s.pos>8||typeof s.finished!=='boolean')return false;
 if(!Array.isArray(s.records)||s.records.length>18||!s.records.every(r=>Number.isInteger(r.id)&&r.id>=0&&r.id<12&&Number.isInteger(r.node)&&r.node>=0&&r.node<9&&Number.isInteger(r.round)&&r.round>=1&&r.round<=6&&Number.isInteger(r.points)&&r.points>=1&&r.points<=17&&(r.combo===undefined||[0,2,4].includes(r.combo))&&(r.kitBonus===undefined||[0,2].includes(r.kitBonus))))return false;
 const shared=Array.isArray(s.disturbance)&&s.disturbance.length===9&&s.disturbance.every(n=>Number.isInteger(n)&&n>=0&&n<=2)&&Array.isArray(s.taken)&&s.taken.length<=(s.mode==='duo'?6:3)&&s.taken.every(t=>typeof t==='string'&&/^[0-8]:(?:[0-9]|1[01])$/.test(t))&&Array.isArray(s.log)&&s.log.length<=(s.mode==='duo'?46:26)&&Array.isArray(s.swaps)&&s.swaps.length===9&&s.swaps.every((v,i)=>v===null||(Number.isInteger(v?.out)&&Number.isInteger(v?.into)&&v.out!==v.into&&BIRDS[v.out]?.hab===NODES[i].hab&&BIRDS[v.into]?.hab===NODES[i].hab));
 if(!shared)return false;
 if(s.mode==='solo')return s.active===0;
 return Array.isArray(s.players)&&s.players.length===2&&s.players.every((p,i)=>p&&PLAYER_FIELDS.every(k=>Object.hasOwn(p,k))&&valid({...playerView(s,i),log:[],taken:[]}))&&PLAYER_FIELDS.every(k=>JSON.stringify(s[k])===JSON.stringify(s.players[s.active][k]));
}
const PLAYER_FIELDS=['kit','focus','walked','quiet','pos','records','ap'];
function extractPlayer(s){return Object.fromEntries(PLAYER_FIELDS.map(k=>[k,s[k]]));}
function syncPlayer(s){if(s.mode==='duo')for(const key of PLAYER_FIELDS)s[key]=s.players[s.active][key];return s;}
function playerView(s,index=s.active||0){return s.mode==='duo'?{...s,...s.players[index],mode:'solo',active:0,players:undefined}:s;}
function scores(s){return s.mode==='duo'?s.players.map((_,i)=>score(playerView(s,i))):[score(s)];}
function create(seed=731,style='walk',mode='solo',secondStyle='lens'){const s=createSolo(seed,style);if(mode==='duo'){s.mode='duo';s.players=[extractPlayer(s),extractPlayer(createSolo(seed,secondStyle))];}return s;}
function act(s,action){
 if(s.mode!=='duo')return actSingle(s,action);
 if(action.type==='next'&&s.players.some(p=>p.ap>0))return {ok:false,reason:'actionsLeft',state:s};
 const actor=s.active,r=actSingle(s,action);if(!r.ok)return r;const n=r.state;
 if(action.type==='next'){
  if(!n.finished){n.players=n.players.map(p=>({...p,ap:3,quiet:Math.min(4,p.quiet+1),walked:false}));n.active=(n.round-1)%2;}
 }else{
  n.players[actor]=extractPlayer(n);n.log.at(-1).player=actor;
  if(action.type!=='focus'&&n.players[1-actor].ap>0)n.active=1-actor;
 }
 return {ok:true,state:syncPlayer(n)};
}
function upgrade(s){
 if(!s||![1,2,3].includes(s.version))return null;
 let n={...s};
 if(s.version===1)n={...n,kit:'walk',focus:2,walked:s.log?.some(a=>a.type==='move'&&a.round===s.round)??false,legacyWeather:true};
 if(s.version<3)n={...n,version:3,mode:'solo',active:0,swaps:Array(9).fill(null)};
 return valid(n)?n:null;
}
root.ReedEngine={BIRDS,NODES,EVENTS,KITS,TARGET,hash,neighbors,flock,scoutOption,weather,kit,isNew,requirement,breakdown,value,chain,combo,objectives,personal,score,scores,rank,create,act,valid,upgrade,playerView};
})(globalThis);
