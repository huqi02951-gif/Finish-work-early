import { NativeDiveScroll } from './first-stage/NativeDiveScroll.js';
import { CHAPTERS } from './StoryChapters.js';
import { diveDepth } from './first-stage/DiveNavigation.js';
import { setupRecorder } from './first-stage/QARecorder.js';
import { FirstStageDirector } from './first-stage/FirstStageDirector.js';
import { DoorGesture } from './first-stage/AircraftDoor.js';
import { SequenceClock, TIMING, sampleSequence } from './first-stage/FreefallSequence.js';
(()=>{
'use strict';
const $=id=>document.getElementById(id), clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,v)=>{let u=clamp((v-a)/(b-a));return u*u*(3-2*u)},n=(v,d=3)=>Number(v).toFixed(d), root=document.documentElement;
const el={film:$('film'),hatch:$('hatch'),anchor:$('hatch-anchor'),sky:$('sky'),sea:$('underwater'),frame:$('cabin'),hands:$('hands'),flash:$('impact-flash'),splash:$('splash'),streaks:$('motion-lines'),object:$('world-object'),shell:$('shell'),holo:$('holo'),holoContents:$('holo-contents'),portal:$('portal'),caption:$('flight-caption'),flightIndex:$('flight-index'),flightLine:$('flight-line'),flightSub:$('flight-sub'),title:$('title-screen'),copy:$('chapter-copy'),kicker:$('chapter-kicker'),chapterTitle:$('chapter-title'),chapterCn:$('chapter-cn'),chapterDesc:$('chapter-desc'),data:$('data-caption'),dataLabel:$('data-label'),dataName:$('data-name'),credits:$('credits'),sound:$('sound'),soundLabel:$('sound-label'),pause:$('pause'),pauseLabel:$('pause-label'),readout:$('readout'),readoutLabel:$('readout-label'),readoutUnit:$('readout-unit'),speed:$('speed'),mission:$('mission'),missionDot:$('mission-dot'),guide:$('guide-text'),progressLabel:$('progress-label'),progressPct:$('progress-pct'),track:$('track'),replay:$('replay'),touch:$('tap-continue'),announcer:$('announcer'),particles:$('particles')};
let phase='waiting',running=true,soundEnabled=true,elapsed=0,underProgress=0,lookX=0,lookY=0,targetX=0,targetY=0,chapterIndex=-1,lastFrame=0,elapsedImpact=false,curWidth=innerWidth,curHeight=innerHeight,audio=null;
const CURVE={...TIMING, settle:TIMING.settle};
const clock = new SequenceClock(), gesture = new DoorGesture(), diveScroll=new NativeDiveScroll();
let director=null, deepTime=0, sceneFailed=false;
function sceneFailure(message){sceneFailed=true;el.film.classList.add('scene-unavailable');el.film.classList.remove('webgl-ready');$('scene-status').textContent=message;$('scene-status').hidden=false;el.hatch.disabled=true;}
try {if(new URLSearchParams(location.search).get('renderer')==='disabled'&&new URLSearchParams(location.search).has('qa'))throw new Error('QA: renderer deliberately disabled');director=new FirstStageDirector({host:$('scene'),hatch:el.hatch,onFailure:sceneFailure});} catch(error){console.error(error);sceneFailure('此浏览器无法启动 WebGL。可直接继续水下故事。');}
function css(name,value){root.style.setProperty('--'+name,String(value))}function phaseSet(x){if(phase!==x){phase=x;el.film.dataset.phase=x;if(x==='underwater'||x==='credits'){diveScroll.enable();diveScroll.pause(!running);}else diveScroll.disable();el.announcer.textContent=x==='underwater'?'已抵达海底。向下滚动滚轮或在屏幕上向上滑动，探索 APEX 技能。':x==='credits'?'旅程结束，欢迎重看。':''}}
function resize(){curWidth=innerWidth;curHeight=innerHeight;diveScroll.resize();}
function begin(){if(phase!=='waiting'||!director?.ready)return;director.commitManual();clock.start();running=true;clock.paused=false;el.pauseLabel.textContent='PAUSE';el.pause.firstChild.textContent='Ⅱ ';phaseSet('opening');elapsed=0;el.hatch.setAttribute('aria-disabled','true');el.guide.innerHTML='THE JUMP HAS BEGUN<br><small>镜头即将自动下潜</small>';el.soundLabel.textContent=soundEnabled?'SOUND ON':'SOUND OFF';if(soundEnabled){startAudio();audio?.ctx.resume().catch(()=>{});}playClack()}
function skipToUnderwater(){diveScroll.disable();clock.seek(CURVE.settle);elapsed=CURVE.settle;underProgress=0;running=true;clock.paused=false;el.pauseLabel.textContent='PAUSE';el.pause.firstChild.textContent='Ⅱ ';phaseSet('underwater');diveScroll.enable();diveScroll.pause(false);changeChapter(0);$('scene-status').hidden=true;if(soundEnabled){startAudio();audio?.ctx.resume().catch(()=>{});}}
function restart(){
 diveScroll.disable();clock.reset();director?.reset();gesture.cancel();running=true;deepTime=0;lookX=lookY=targetX=targetY=0;
 phaseSet('waiting');elapsed=underProgress=0;chapterIndex=-1;elapsedImpact=false;
 el.hatch.removeAttribute('aria-disabled');el.hatch.disabled=!director?.ready;el.anchor.style.opacity='1';
 el.pauseLabel.textContent='PAUSE';el.pause.firstChild.textContent='Ⅱ ';el.touch.hidden=true;
 el.copy.style.opacity=el.data.style.opacity=el.caption.style.opacity='0';
 el.credits.style.pointerEvents='none';css('holo-opacity',0);css('portal-opacity',0);css('sea-opacity',0);css('sky-opacity',1);
 el.guide.innerHTML='YOUR FIRST MOVE<br><small>点击把手 / 向右拖动开门</small>';
 if(sceneFailed)$('scene-status').hidden=false;
 if(soundEnabled&&audio)audio.ctx.resume().catch(()=>{});
}
function stageOf(p){let idx=0;for(let i=1;i<CHAPTERS.length;i++)if(p>=CHAPTERS[i].start)idx=i;return idx}
function renderHolo(ch){el.holoContents.classList.remove('holo-pulse');void el.holoContents.offsetWidth;el.holoContents.classList.add('holo-pulse');const bars=(ch.visual==='finance'||ch.visual==='skills')?'<div class="holo-graph">'+[26,58,45,90,62,76,39,71,94,48,66].map(h=>'<i style="--h:'+h+'%"></i>').join('')+'</div>':'';el.holoContents.innerHTML='<div class="holo-head">APEX SYSTEM // LIVE STORY DEMO</div><div class="holo-title">'+ch.label+'</div>'+ch.holo.map(x=>'<div class="holo-row"><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('')+bars+'<div class="holo-foot">ILLUSTRATIVE DATA · NOT A LIVE BANKING SYSTEM</div>'}
function changeChapter(idx){if(idx===chapterIndex)return;chapterIndex=idx;const ch=CHAPTERS[idx];el.kicker.textContent=idx>0&&idx<7?String(idx).padStart(2,'0')+' / 06 · '+['','外部查询','受益所有人识别','财报转换','股权穿透','技能协作','行内部署'][idx]:ch.kicker;el.film.dataset.side=idx%2?'right':'left';document.querySelectorAll('[data-skill]').forEach(button=>button.setAttribute('aria-current',Number(button.dataset.skill)===idx?'step':'false'));el.chapterTitle.textContent=ch.title;el.chapterCn.textContent=ch.cn;el.chapterDesc.textContent=ch.desc;el.dataName.textContent=ch.label;el.dataLabel.textContent='APEX MILESTONE / '+String(idx).padStart(2,'0');el.mission.textContent=ch.id;director?.pulse(TIMING.settle+deepTime);if(ch.holo.length)renderHolo(ch);el.chapterTitle.style.transform='translateY(16px)';requestAnimationFrame(()=>{el.chapterTitle.style.transition='transform .9s cubic-bezier(.16,1,.3,1)';el.chapterTitle.style.transform='translateY(0)'})}
function camera(t){
 const state=sampleSequence(t);
 const underwaterView=t>=TIMING.impact;
 el.readoutLabel.textContent=underwaterView?'DEPTH':'ALTITUDE';el.readoutUnit.textContent='M';
 el.readout.textContent=String(Math.round(underwaterView?state.depth:state.y)).padStart(3,'0');
 el.speed.textContent='↓ '+state.speed.toFixed(1);
 el.progressPct.textContent=String(Math.round(t/TIMING.settle*100)).padStart(2,'0')+'%';
 el.track.style.width=(t/TIMING.settle*100)+'%';el.progressLabel.textContent='THE DESCENT';
 let line='',sub='',status='AWAITING RELEASE',guide='点击把手 / 向右拖动开门';
 if(t>0&&t<2.35){status='HATCH RELEASED';guide='舱门正在打开';}
 else if(t>=2.35&&t<9.4){status='FREEFALL';line='把好奇，交给辽阔。';sub='TAKE THE LEAP';guide='自动坠落中 · 轻移鼠标环顾';}
 else if(t>=9.4&&t<11.8){status=t<TIMING.impact?'SURFACE APPROACH':'OCEAN ENTRY';guide=t<TIMING.impact?'即将穿越水面':'正在穿越水面';}
 else if(t>=11.8){status='SIGNAL AWAKENING';line='沉入深蓝，听见生长。';sub='A DIFFERENT KIND OF SENSE';guide='你已成为小海螺';}
 el.mission.textContent=status;
 el.guide.innerHTML=(t===0?'YOUR FIRST MOVE':'CONTINUOUS DESCENT')+'<br><small>'+guide+'</small>';
 el.flightIndex.textContent=sub;el.flightLine.textContent=line;el.flightSub.textContent='';
 el.caption.style.opacity=t<2.35?0:t<9.4?sm(2.8,3.6,t)*(1-sm(6.5,7.4,t)):sm(12.4,13.4,t)*(1-sm(16,17.5,t));
 if(t>=TIMING.impact&&!elapsedImpact){elapsedImpact=true;playSplash()}
 if(t>=TIMING.settle){phaseSet('underwater');el.caption.style.opacity=0;el.touch.hidden=false;changeChapter(0);}
}
function underwater(dt){const previousDepth=diveDepth(underProgress);underProgress=diveScroll.read();
 const p=underProgress, idx=stageOf(p),ch=CHAPTERS[idx],next=CHAPTERS[idx+1],midpoint=next?next.start:1;
 if(idx===7&&p>=.975){el.film.dataset.milestone='7';el.film.dataset.diveProgress=p.toFixed(4);phaseSet('credits');el.touch.hidden=true;el.readoutLabel.textContent='DEPTH';el.readout.textContent='320';el.mission.textContent='THE PEOPLE';el.progressPct.textContent='100%';el.track.style.width='100%';el.progressLabel.textContent='JOURNEY COMPLETE';el.guide.innerHTML='THE STORY CONTINUES<br><small>小海螺，继续生长</small>';return}
 phaseSet('underwater');changeChapter(idx);
 const fadeIn=idx===0?1:.3+.7*sm(ch.start,ch.start+.025,p),fadeOut=next?1-.7*sm(midpoint-.03,midpoint,p):1;const fade=fadeIn*fadeOut;el.film.dataset.milestone=String(idx);el.film.dataset.diveProgress=p.toFixed(4);
 el.copy.style.opacity=n(fade*.97);el.data.style.opacity=n(ch.visual==='conch'||ch.visual==='portal'?0:fade*.88);el.data.style.transform='translateY('+n((1-fade)*12)+'px)';
 css('holo-opacity',n(ch.holo.length?fade*.93:0));css('holo-scale',n(.88+.08*fade));css('portal-opacity',n(ch.visual==='portal'?fade*.8:0));css('portal-scale',n(.65+.6*fade));
 css('sea-opacity','1');css('sky-opacity','0');css('cabin-opacity','0');css('hands-opacity','0');css('veil',n(.13+.48*p));css('light',n(.44-.27*p));css('sea-scale',n(1.12+.45*p));css('sea-y',n(-5-130*p)+'px');css('sea-tilt',n(Math.sin(p*7)*.38)+'deg');el.anchor.style.opacity='0';el.caption.style.opacity='0';
 const depth=Math.round(diveDepth(p));el.readout.textContent=String(depth).padStart(3,'0');el.readoutLabel.textContent='DEPTH';el.readoutUnit.textContent='M';el.speed.textContent='↓ '+n(dt>0?Math.abs(diveDepth(p)-previousDepth)/dt:0,1);el.progressPct.textContent=String(Math.round(p*100)).padStart(2,'0')+'%';el.track.style.width=n(p*100,1)+'%';el.progressLabel.textContent='STORY PROGRESS';el.mission.textContent=ch.id;
 el.guide.innerHTML='FOLLOW THE CURRENT<br><small>'+(curWidth<640?'手指向上滑动':'滚轮向下滚动')+' · 向深处，遇见更多</small>';
 }
function followPointer(e){if(e.pointerType!=='mouse')return;const nx=clamp(e.clientX/curWidth),ny=clamp(e.clientY/curHeight);targetX=(nx-.5)*55;targetY=(ny-.5)*32;if(director)director.pointer.set((nx-.5)*2,(.5-ny)*2);}
function keys(e){
 if(e.key==='Escape'&&phase!=='waiting'){togglePause();return;}
 // Arrows, space and page keys keep their native document scrolling behavior.
}
function togglePause(){
 running=!running;clock.paused=!running;diveScroll.pause(!running);el.pauseLabel.textContent=running?'PAUSE':'RESUME';el.pause.firstChild.textContent=running?'Ⅱ ':'▶ ';
 if(audio?.ctx)audio.ctx[running&&soundEnabled?'resume':'suspend']().catch(()=>{});
}
function toggleSound(){
 soundEnabled=!soundEnabled;el.soundLabel.textContent=soundEnabled?'SOUND ON':'SOUND OFF';
 if(soundEnabled)startAudio();
 if(audio?.ctx)audio.ctx[soundEnabled&&running?'resume':'suspend']().catch(()=>{});
}
function startAudio(){if(audio)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=new AC(),buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const windFilter=ac.createBiquadFilter();windFilter.type='bandpass';windFilter.frequency.value=570;windFilter.Q.value=.7;const wGain=ac.createGain();wGain.gain.value=0;src.connect(windFilter).connect(wGain).connect(ac.destination);src.start();const sub=ac.createOscillator();sub.type='sine';sub.frequency.value=54;const subGain=ac.createGain();subGain.gain.value=0;sub.connect(subGain).connect(ac.destination);sub.start();audio={ctx:ac,windGain:wGain,subGain,windFilter};}catch(e){audio=null}}
function tone(freq,duration,volume=.12){if(!audio||!soundEnabled)return;try{const ctx=audio.ctx,osc=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;osc.type='sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(freq*.7,now+duration);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(g).connect(ctx.destination);osc.start(now);osc.stop(now+duration+.03)}catch(e){}}
function playClack(){tone(230,.29,.11);setTimeout(()=>tone(90,.55,.06),120)}function playSplash(){tone(75,.95,.25);tone(330,.6,.07)}function updateAudio(){if(!audio||!soundEnabled||audio.ctx.state!=='running')return;if(!running){audio.windGain.gain.setTargetAtTime(0,audio.ctx.currentTime,.03);audio.subGain.gain.setTargetAtTime(0,audio.ctx.currentTime,.03);return;}
 const s=sampleSequence(elapsed),ct=audio.ctx.currentTime;
 audio.windGain.gain.setTargetAtTime((.008+s.speed/58*.1)*(1-s.water),ct,.08);
 audio.windFilter.frequency.setTargetAtTime(650+1700*s.speed/58,ct,.1);
 audio.subGain.gain.setTargetAtTime(s.water*.035,ct,.2);
}
function animate(ts){
 if(!lastFrame)lastFrame=ts;const rawDt=Math.max(0,(ts-lastFrame)/1000);lastFrame=ts;
 const dt=Math.min(rawDt,.05),active=running&&!document.hidden;
 if(director?.ready&&!sceneFailed)$('scene-status').hidden=true;
 if(active){
   const easeLook=1-Math.exp(-dt*3);lookX=lerp(lookX,targetX,easeLook);lookY=lerp(lookY,targetY,easeLook);
   css('move-x',n(lookX)+'px');css('move-y',n(lookY)+'px');
   if(clock.started&&elapsed<TIMING.settle){elapsed=clock.tick(rawDt,true);phaseSet(sampleSequence(elapsed).phase);camera(elapsed);}
   else if(phase==='waiting')camera(0);
   if(phase==='underwater'||phase==='credits'){deepTime+=dt;underwater(dt);}
 }
 director?.update({time:elapsed,dt:rawDt,progress:underProgress,active,deepTime});
 el.film.dataset.audioState=audio?.ctx.state||'not-started';el.film.dataset.soundEnabled=String(soundEnabled);el.caption.setAttribute('aria-hidden',String(Number(el.caption.style.opacity)<.01));el.film.dataset.paused=String(!running);const under=phase==='underwater';el.data.setAttribute('aria-hidden',String(!under));el.copy.inert=!under;el.copy.setAttribute('aria-hidden',String(!under));
 el.credits.inert=phase!=='credits';el.credits.setAttribute('aria-hidden',String(phase!=='credits'));
 $('skip-intro').hidden=phase==='underwater'||phase==='credits';
 if(qaSlider&&!qaSlider.matches(':active'))qaSlider.value=elapsed;if(qaSlider)$('qa-time').textContent=elapsed.toFixed(2)+' s';
 updateAudio();requestAnimationFrame(animate);
}
let qaSlider=null;
function doorTime(progress){let lo=0,hi=TIMING.doorOpen;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(sampleSequence(mid).door<progress)lo=mid;else hi=mid;}return (lo+hi)/2;}
function setupQA(){
 if(!new URLSearchParams(location.search).has('qa'))return;
 root.classList.add('qa-mode');
 const panel=document.createElement('aside');panel.id='qa-panel';panel.setAttribute('aria-label','镜头验收工具');
 panel.innerHTML='<label>镜头时间 <input aria-label="镜头时间" type="range" min="0" max="19" step="0.01" value="0"></label><output id="qa-time">0.00 s</output><div>'+[['机舱',0],['开门 25%',doorTime(.25)],['开门 50%',doorTime(.5)],['开门 100%',TIMING.doorOpen],['跃出',3.5],['自由落体',6.6],['近海',10.55],['水前',10.78],['水线',10.8],['水后',10.82],['穿水',10.94],['水下',13.6],['抵达',19]].map(([label,t])=>'<button type="button" data-seek="'+t+'">'+label+'</button>').join('')+'</div><button type="button" id="qa-reset">重置并播放</button><button type="button" id="qa-credits">片尾验收</button><button type="button" id="qa-alignment" aria-pressed="false">手部对齐图</button>';
 const milestones=document.createElement('div');milestones.innerHTML=CHAPTERS.slice(0,7).map((ch,i)=>'<button type="button" data-milestone="'+i+'">技能 '+i+'</button>').join('');panel.append(milestones);
 document.body.append(panel);qaSlider=panel.querySelector('input');setupRecorder(panel,()=>director?.ready?director.renderer.domElement:null,()=>{restart();begin();});
 function seek(t){diveScroll.disable();director?.reset();el.anchor.style.opacity='1';clock.seek(t);clock.paused=true;running=false;elapsed=t;underProgress=deepTime=0;phaseSet(sampleSequence(t).phase);camera(t);if(t===19){diveScroll.enable();diveScroll.pause(true);underwater(0);}el.pauseLabel.textContent='RESUME';el.pause.firstChild.textContent='▶ ';$('qa-time').textContent=t.toFixed(2)+' s';}
 qaSlider.addEventListener('input',()=>seek(Number(qaSlider.value)));
 panel.querySelectorAll('[data-seek]').forEach(button=>button.addEventListener('click',()=>seek(Number(button.dataset.seek))));
 panel.querySelectorAll('[data-milestone]').forEach(button=>button.addEventListener('click',()=>{seek(19);diveScroll.goTo(CHAPTERS[Number(button.dataset.milestone)].start+.045,false);underwater(0);}));
 $('qa-reset').addEventListener('click',restart);
 $('qa-alignment').addEventListener('click',e=>{const enabled=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(enabled));director?.setCoordinateGuide(enabled);});
 const hide=document.createElement('button');hide.textContent='隐藏工具 (H)';hide.type='button';panel.append(hide);hide.onclick=()=>panel.hidden=true;addEventListener('keydown',e=>{if(e.code==='KeyH')panel.hidden=!panel.hidden});
 $('qa-credits').addEventListener('click',()=>{skipToUnderwater();diveScroll.goTo(.99,false);underwater(.02);running=false;clock.paused=true;diveScroll.pause(true);el.pauseLabel.textContent='RESUME';el.pause.firstChild.textContent='▶ '});
}
function init(){
 resize();addEventListener('resize',resize);
 el.hatch.addEventListener('pointerdown',e=>{if(phase!=='waiting'||!director?.ready)return;gesture.start(e.clientX,e.clientY);el.hatch.setPointerCapture(e.pointerId);});
 el.hatch.addEventListener('pointermove',e=>{if(gesture.origin&&phase==='waiting')director.setManual(gesture.move(e.clientX,e.clientY));});
 el.hatch.addEventListener('pointerup',e=>{if(phase!=='waiting')return;if(gesture.end(e.clientX,e.clientY))begin();else director?.cancelManual();});
 el.hatch.addEventListener('pointercancel',()=>{gesture.cancel();director?.cancelManual();});
 el.hatch.addEventListener('lostpointercapture',()=>{if(gesture.origin){gesture.cancel();director?.cancelManual();}});
 el.hatch.addEventListener('click',e=>{if(e.detail===0&&phase==='waiting')begin();});
 document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>{if(!diveScroll.enabled||!running)return;diveScroll.goTo(CHAPTERS[Number(button.dataset.skill)].start+.045);}));
 el.replay.addEventListener('click',restart);el.pause.addEventListener('click',togglePause);el.sound.addEventListener('click',toggleSound);
 $('skip-intro').addEventListener('click',skipToUnderwater);
 el.touch.addEventListener('click',()=>{if(diveScroll.enabled&&running)diveScroll.goTo(Math.min(1,underProgress+.045));});
 addEventListener('pointermove',followPointer,{passive:true});
 addEventListener('keydown',keys);
 document.addEventListener('visibilitychange',()=>{lastFrame=0;if(audio){if(document.hidden)audio.ctx.suspend().catch(()=>{});else if(soundEnabled&&running)audio.ctx.resume().catch(()=>{});}});
 addEventListener('pagehide',event=>{if(!event.persisted)director?.dispose()},{once:true});
 setupQA();requestAnimationFrame(animate);
}
init();
})();
