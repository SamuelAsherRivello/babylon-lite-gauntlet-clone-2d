import './style.css';
import versionText from '../../version.txt?raw';
import {MultiplayerClient} from '@rmc/multiplayer-client';
import {HEROES,ENEMIES,artUrl,normalized} from './catalog.js';
import {createRenderer} from './renderer.js';
const $=s=>document.querySelector(s),version=versionText.trim().replace('version=','');
const repo='https://github.com/SamuelAsherRivello/babylon-lite-gauntlet-clone-2d';
$('#ui_layer').innerHTML=`
 <header class="masthead"><a class="brand corner_top_left" href="${import.meta.env.BASE_URL}"><span class="sigil">◆</span><span>GAUNTLET<small>THE EMBERVAULT</small></span></a><div class="mast-right corner_top_right"><span class="edition">A COOPERATIVE DUNGEON EXPEDITION</span><a href="${repo}" target="_blank" rel="noopener">Source ↗</a></div></header>
 <main class="layout">
  <aside class="left-panel"><div class="eyebrow">ONE VAULT. FOUR HEROES.</div><h1>Stronger<br>together.</h1><p class="intro">The torches are lit.<br>The dungeon is waiting.</p>
   <section class="panel"><div class="section-head"><h2>Your party</h2><span id="occupancy">0 / 4</span></div><div id="party"></div><button id="invite" class="wide subtle">Copy invite link <span>↗</span></button><p id="invite-note" class="tiny">Friends join this expedition automatically.</p></section>
   <section class="howto"><h2>THE EXPEDITION</h2><ol><li><span>01</span><div>Break the generators<small>Stop the endless reinforcements.</small></div></li><li><span>02</span><div>Find both vault keys<small>Explore the chambers. Stay together.</small></div></li><li><span>03</span><div>Reach the northern gate<small>One escape wins for the whole party.</small></div></li></ol></section>
   <div class="revive-note"><span>✦</span> Stand near a fallen ally<br>to bring them back.</div>
  </aside>
  <section class="game-column" aria-label="Game">
   <div class="game-top"><div><span class="live-dot"></span><span id="connection" role="status">CONNECTING</span></div><span>1–4 PLAYERS <b>CO-OP</b></span></div>
   <div class="objective-bar"><span><b id="nests">0/4</b> GENERATORS</span><span><b id="keys">0/2</b> KEYS</span><span class="gold"><b id="score">0000</b> GOLD</span></div>
   <div id="content_layer" class="viewport"><canvas id="game" aria-label="Top-down cooperative dungeon. Move with WASD or arrows; hold Space to attack." tabindex="0"></canvas>
    <div id="overlay" class="overlay"><span class="overlay-rune">◆</span><h2 id="overlay-title">Opening the vault…</h2><p id="overlay-text">Joining your expedition.</p><button id="retry" hidden>Try again</button></div>
    <div id="touch-controls"><div id="joystick" aria-label="Touch movement joystick"><span id="stick"></span></div><button id="attack" aria-label="Hold to attack">⚔<small>ATTACK</small></button></div>
   </div>
   <div class="health-row"><span id="identity">YOUR HERO</span><div class="health-track"><div id="health-fill"></div></div><b id="health">— / 100</b></div>
   <div class="hero-label"><span>CHOOSE YOUR HERO</span><span>SWITCH ANYTIME · 1–4</span></div>
   <div class="hero-grid">${HEROES.map(h=>`<button class="hero-card" data-hero="${h.id}" aria-label="Choose ${h.name}" aria-pressed="false"><kbd>${h.key}</kbd><img src="${artUrl(h.id)}" alt=""><strong>${h.name}</strong><small>${h.weapon}</small><span class="hero-trait">${h.trait}</span></button>`).join('')}</div>
  </section>
  <aside class="right-panel"><div class="chapter"><span>CHAPTER I</span><h2>The<br>Embervault</h2><div class="chapter-line"></div><p>Ancient stone. Restless guardians.<br>One way out.</p></div>
   <section class="panel bestiary"><div class="section-head"><h2>Know your enemy</h2><span>IV</span></div>${ENEMIES.map(([id,name,desc])=>`<div class="enemy-entry"><img src="${artUrl(id)}" alt=""><div><strong>${name}</strong><small>${desc}</small></div></div>`).join('')}</section>
   <section class="controls panel"><h2>THE CONTROLS</h2><p><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows</span><b>Move</b></p><p><span><kbd>SPACE</kbd> / hold click</span><b>Attack</b></p><p><span><kbd>1</kbd> – <kbd>4</kbd></span><b>Switch hero</b></p><p><span><kbd>P</kbd> / <kbd>ESC</kbd></span><b>Local pause</b></p><small>Space auto-aims at the nearest visible threat. Hold click to aim manually.</small></section>
   <div class="field-note"><span>FIELD NOTE</span><p>Heroes may share a class.<br>Your color and number are always yours.</p></div>
  </aside>
 </main>
 <footer><div class="settings corner_bottom_left"><button id="pause">Ⅱ Pause</button><button id="sound" aria-pressed="false">Sound off</button><button id="fullscreen">⛶ Fullscreen</button></div><span id="event" aria-live="polite">Break the generators. Find the keys. Escape together.</span><span class="corner_bottom_right">WEBGPU <i>·</i> <b id="version">v${version}</b></span></footer>`;
const session=new MultiplayerClient(import.meta.env.VITE_SERVER_URL||'https://rmc-colyseus-multiplayer-server.vercel.app','gauntlet-2d');
let renderer,paused=false,gpuError='',raf=0,keys=new Set(),pointerAttack=false,touchAttack=false,aim=null,stick={x:0,y:0},joystickPointer=null,attackPointer=null,sound=false,audioContext,previousRound=null,previousEvent='',lastSound=0;
function tone(frequency=400,duration=.05){if(!sound)return;try{audioContext??=new AudioContext();if(audioContext.state==='suspended')void audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='triangle';osc.frequency.value=frequency;gain.gain.setValueAtTime(.045,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration);}catch{}}
function resetInput(){keys.clear();pointerAttack=false;touchAttack=false;aim=null;stick={x:0,y:0};joystickPointer=null;attackPointer=null;$('#stick').style.transform='translate(0,0)';$('#attack').classList.remove('pressed');session.send('input',{x:0,y:0,ax:0,ay:0,attack:false});}
function setPaused(value){paused=value;resetInput();$('#pause').textContent=paused?'▶ Resume':'Ⅱ Pause';renderUI();}
function input(){if(paused||gpuError)return {x:0,y:0,ax:0,ay:0,attack:false};const move=normalized((keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+stick.x,(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+stick.y);const me=session.state.gameState?.players.find(p=>p.id===session.state.sessionId);let ax=0,ay=0;if(pointerAttack&&aim&&me){const n=Math.hypot(aim.x-me.x,aim.y-me.y)||1;ax=(aim.x-me.x)/n;ay=(aim.y-me.y)/n;}return {...move,ax,ay,attack:keys.has(' ')||pointerAttack||touchAttack};}
const inputTimer=setInterval(()=>{const action=input();session.send('input',action);if(action.attack&&performance.now()-lastSound>220){tone(160+Math.random()*80,.045);lastSound=performance.now();}},50);
function renderUI(){
 const s=session.state,g=s.gameState,me=g?.players.find(p=>p.id===s.sessionId);
 $('#connection').textContent=s.status==='connected'?`ONLINE · ${s.players.length}/4`:s.status.toUpperCase();$('.live-dot').classList.toggle('online',s.status==='connected');$('#occupancy').textContent=`${s.players.length} / 4`;
 $('#party').innerHTML=Array.from({length:4},(_,i)=>{const p=g?.players.find(p=>p.number===i+1);return p?`<div class="party-slot" style="--player:${p.color}"><span class="player-number">${p.number}</span><img src="${artUrl(p.hero)}" alt=""><div><strong>Player ${p.number}${p.id===s.sessionId?' <em>YOU</em>':''}</strong><small>${p.hero} · ${Math.ceil(p.hp)} HP</small></div><span class="party-ready">${p.hp>0?'●':'✚'}</span></div>`:`<div class="party-slot empty"><span class="player-number">${i+1}</span><div><strong>Open seat</strong><small>Waiting for an adventurer</small></div></div>`;}).join('');
 for(const button of document.querySelectorAll('[data-hero]')){button.setAttribute('aria-pressed',String(button.dataset.hero===me?.hero));button.disabled=s.status!=='connected';}
 if(g){$('#nests').textContent=`${g.generators.filter(n=>n.hp<=0).length}/4`;$('#keys').textContent=`${g.keys}/2`;$('#score').textContent=String(g.treasure).padStart(4,'0');$('#event').textContent=g.event;
  if(previousEvent&&g.event!==previousEvent)tone(660,.15);previousEvent=g.event;if(previousRound!==null&&previousRound!==g.round)resetInput();previousRound=g.round;
 }
 $('#health').textContent=me?`${Math.ceil(me.hp)} / 100`:'— / 100';$('#health-fill').style.width=`${me?.hp||0}%`;$('#health-fill').style.background=me?.color||'#d4ad65';$('#identity').textContent=me?`P${me.number} · ${me.hero.toUpperCase()}`:'YOUR HERO';$('#identity').style.color=me?.color||'';
 const overlay=$('#overlay');let title='',text='',retry=false;
 if(gpuError){title='A graphics device is needed';text=gpuError;retry=true;}
 else if(s.status!=='connected'){title=s.status==='full'?'The party is full':s.status==='reconnecting'?'Rejoining the expedition…':'Opening the vault…';text=s.status==='full'?'Four adventurers are already inside. Retry when a seat opens.':s.error||'Connecting to the shared dungeon. You will join automatically.';retry=s.status==='full'||s.status==='offline';}
 else if(paused){title='Taking a breath';text='Your controls are paused. The shared dungeon continues. Resume to protect your hero.';retry=true;}
 else if(g?.status!=='playing'){title=g?.status==='victory'?'The vault is conquered':'The party has fallen';text=`${g?.status==='victory'?'You escaped together.':'Gather your courage.'} A new expedition begins in ${Math.ceil(g?.restartIn||0)}s.`;}
 else if(me?.hp<=0){title='A hero has fallen';text='An ally can revive you by standing nearby for 2.5 seconds.';}
 overlay.hidden=!title;$('#overlay-title').textContent=title;$('#overlay-text').textContent=text;$('#retry').hidden=!retry;$('#retry').textContent=gpuError?'Reload game':paused?'Resume expedition':'Try again';
}
const unsubscribe=session.subscribe(renderUI);
for(const button of document.querySelectorAll('[data-hero]'))button.addEventListener('click',()=>{session.send('select',button.dataset.hero);tone(500,.08);button.blur();});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(e.repeat&&['p','escape'].includes(k))return;if(k==='p'||k==='escape'){setPaused(!paused);return;}const h=HEROES.find(h=>h.key===k);if(h){session.send('select',h.id);return;}keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput();});
const canvas=$('#game');const updateAim=e=>{if(!renderer)return;const r=canvas.getBoundingClientRect();aim=renderer.screenToWorld((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointerAttack=true;updateAim(e);});canvas.addEventListener('pointermove',updateAim);canvas.addEventListener('pointerup',()=>{pointerAttack=false;aim=null;});canvas.addEventListener('pointercancel',resetInput);canvas.addEventListener('lostpointercapture',()=>{pointerAttack=false;aim=null;});
const joystick=$('#joystick');const moveStick=e=>{const r=joystick.getBoundingClientRect();stick=normalized((e.clientX-r.left-r.width/2)/32,(e.clientY-r.top-r.height/2)/32);$('#stick').style.transform=`translate(${stick.x*26}px,${stick.y*26}px)`;};
joystick.addEventListener('pointerdown',e=>{e.preventDefault();if(joystickPointer!==null)return;joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveStick(e);});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)moveStick(e);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(type,e=>{if(e.pointerId!==joystickPointer)return;joystickPointer=null;stick={x:0,y:0};$('#stick').style.transform='translate(0,0)';});
$('#attack').addEventListener('pointerdown',e=>{e.preventDefault();attackPointer=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);touchAttack=true;e.currentTarget.classList.add('pressed');});for(const type of ['pointerup','pointercancel','lostpointercapture'])$('#attack').addEventListener(type,e=>{if(e.pointerId!==attackPointer)return;attackPointer=null;touchAttack=false;e.currentTarget.classList.remove('pressed');});
$('#pause').onclick=()=>setPaused(!paused);$('#retry').onclick=()=>{if(gpuError)location.reload();else if(paused)setPaused(false);else void session.connect();};
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));tone();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#event').textContent='Fullscreen is unavailable in this browser.';}};
$('#invite').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#invite-note').textContent='Link copied. Send it to your party.';}catch{$('#invite-note').textContent=location.href;}};
function failure(error){gpuError=error.message||'WebGPU initialization failed. Try current Chrome or Edge and reload.';resetInput();renderUI();}
try{renderer=await createRenderer(canvas,failure);const loop=now=>{try{renderer.draw(session.state.gameState,session.state.sessionId,now);raf=requestAnimationFrame(loop);}catch(e){failure(e);}};raf=requestAnimationFrame(loop);void session.connect();}catch(e){failure(e);}
window.addEventListener('pagehide',()=>{clearInterval(inputTimer);cancelAnimationFrame(raf);resetInput();unsubscribe();session.disconnect();renderer?.dispose();},{once:true});
// Read-only diagnostics support runtime verification without adding cheat controls.
Object.defineProperty(window,'embervault',{value:Object.freeze({snapshot:()=>JSON.parse(JSON.stringify(session.state.gameState)),status:()=>session.state.status,self:()=>session.state.sessionId,input:()=>input(),gpu:()=>!!renderer})});
