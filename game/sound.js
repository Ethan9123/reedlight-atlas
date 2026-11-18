/* Original synthesized cues; no recorded samples, music, or asset requests. */
(function(root){
'use strict';let ctx=null,enabled=false,master=null;
function prepare(){if(!ctx){const C=root.AudioContext||root.webkitAudioContext;if(!C)return false;ctx=new C();master=ctx.createGain();master.gain.value=.13;master.connect(ctx.destination);}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true;}
function tone(freq,end,start,duration,type='sine',gain=.4){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.015);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.02);}
function play(kind,id=0){if(!enabled||!prepare())return;const t=ctx.currentTime+.01;if(kind==='bird'){const f=950+(id%5)*210;tone(f,f*1.45,t,.18);tone(f*1.2,f*.9,t+.16,.22);tone(f*1.35,f*1.5,t+.43,.13);}else if(kind==='move'){tone(155,100,t,.12,'triangle',.3);tone(220,160,t+.1,.09,'triangle',.15);}else if(kind==='wait'){tone(420,560,t,.6,'sine',.18);tone(620,800,t+.2,.45,'sine',.13);}else if(kind==='focus'){tone(330,660,t,.55,'sine',.2);tone(495,990,t+.15,.6,'sine',.15);}else if(kind==='combo'||kind==='goal'){const notes=kind==='goal'?[523,659,784,1047]:[660,880,1100];notes.forEach((f,i)=>tone(f,f,t+i*.11,.35,'sine',.2));}else if(kind==='end'){[0,4,7,12].forEach((n,i)=>tone(261.63*2**(n/12),261.63*2**(n/12),t+i*.16,.6,'sine',.25));}else{tone(660,880,t,.23,'sine',.2);tone(880,990,t+.14,.25,'sine',.15);}}
function toggle(){enabled=!enabled;if(enabled){if(!prepare()){enabled=false;return false;}play('bird',0);}return enabled;}
document.addEventListener('visibilitychange',()=>{if(ctx&&document.hidden)ctx.suspend().catch(()=>{});});
root.ReedSound={toggle,play,isEnabled:()=>enabled};
})(globalThis);
