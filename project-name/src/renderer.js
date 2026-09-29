import {createEngine,createDynamicTexture,updateDynamicTexture,createGridSpriteAtlas,createSprite2DLayer,addSprite2D,updateSprite2D,createSpriteRenderer,registerSpriteRenderer,renderFrame,resizeEngine,disposeSpriteRenderer,disposeSpriteAtlas,disposeEngine,enableDeviceLostSpriteRecovery} from '@babylonjs/lite';
import {ART,artUrl} from './catalog.js';
const W=540,H=960,T=40;
export async function createRenderer(canvas,onFailure){
 if(!navigator.gpu)throw Error('WebGPU is unavailable. Open this game in current Chrome or Edge with hardware acceleration enabled.');
 const images=Object.fromEntries(await Promise.all(ART.map(async name=>{const im=new Image();im.src=artUrl(name);await im.decode();return [name,im];})));
 const engine=await createEngine(canvas,{maxDevicePixelRatio:1.5,msaaSamples:1});
 const surface=document.createElement('canvas');surface.width=W;surface.height=H;const c=surface.getContext('2d');
 const texture=createDynamicTexture(engine,W,H,{minFilter:'linear',magFilter:'linear'}),atlas=createGridSpriteAtlas(texture,{cellWidthPx:W,cellHeightPx:H});
 const layer=createSprite2DLayer(atlas,{capacity:1}),sprite=addSprite2D(layer,{positionPx:[canvas.width/2,canvas.height/2],sizePx:[canvas.width,canvas.height],frame:0});
 const renderer=createSpriteRenderer(engine,{layers:[layer]});registerSpriteRenderer(renderer);
 const recovery=enableDeviceLostSpriteRecovery(engine,{onLost:()=>onFailure(Error('Graphics device interrupted. Reload to restore WebGPU and rejoin.'))});
 let camera={x:9.5*T-W/2,y:29*T-H},disposed=false,last=0;
 const positions=new Map();
 const drawArt=(kind,x,y,size=64,alpha=1)=>{c.globalAlpha=alpha;c.drawImage(images[kind],x-size/2,y-size*.65,size,size);c.globalAlpha=1;};
 const glow=(x,y,r,color)=>{const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
 function draw(game,id,now){
  if(disposed)return;const delta=last?Math.min(50,now-last):16.67;last=now;
  c.fillStyle='#111714';c.fillRect(0,0,W,H);
  if(game){
   const me=game.players.find(p=>p.id===id),focus=me||game.players[0];
   if(focus){const tx=Math.max(0,Math.min(19*T-W,focus.x*T-W/2)),ty=Math.max(0,Math.min(29*T-H,focus.y*T-H*.58));camera.x+=(tx-camera.x)*.12;camera.y+=(ty-camera.y)*.12;}
   c.save();c.translate(-camera.x,-camera.y);
   for(let y=0;y<29;y++)for(let x=0;x<19;x++){
    const px=x*T,py=y*T,n=(x*17+y*37)%7;
    if(game.map[y][x]==='#'){
     c.fillStyle='#111715';c.fillRect(px,py,T,T);c.fillStyle=['#44483c','#3e4439','#414639'][n%3];c.fillRect(px+1,py+1,T-2,T-6);
     c.fillStyle='#58604d';c.fillRect(px+2,py+2,T-4,3);c.fillStyle='#2d352c';c.fillRect(px+2,py+T-10,T-4,4);
     c.strokeStyle='#252e26';c.lineWidth=2;c.beginPath();c.moveTo(px+(y%2?12:27),py+5);c.lineTo(px+(y%2?12:27),py+T-9);c.stroke();
     if(y<28&&game.map[y+1][x]==='.') {c.fillStyle='#090e0b88';c.fillRect(px,py+T,T,8);}
    }else{
     c.fillStyle=['#293127','#2b3228','#2c332a','#283027','#2e352a','#293228','#2c342b'][n];c.fillRect(px,py,T,T);
     c.strokeStyle='#3b433333';c.lineWidth=1;c.strokeRect(px+2,py+2,T-4,T-4);c.fillStyle='#65744720';c.fillRect(px+6+n*3,py+8+n*2,2,2);
     if(n===3){c.strokeStyle='#171f1844';c.beginPath();c.moveTo(px+7,py+2);c.lineTo(px+13,py+12);c.lineTo(px+10,py+17);c.stroke();}
    }
   }
   // Distinct authored chambers and the warm entrance runner.
   c.fillStyle='#7b49352a';c.fillRect(7*T,22*T,5*T,6*T);c.strokeStyle='#aa83443a';c.lineWidth=2;c.strokeRect(7*T+5,22*T+5,5*T-10,6*T-10);
   for(const [x,y]of [[2,26],[16,26],[1,20],[17,20],[6,14],[12,14],[1,7],[17,7],[7,2],[11,2]]){glow((x+.5)*T,(y+.5)*T,95,'#ffb64b26');drawArt('torch',(x+.5)*T,(y+.5)*T,52);}
   const unlocked=game.keys===2&&game.generators.every(g=>g.hp<=0),ex=game.exit.x*T,ey=game.exit.y*T;
   glow(ex,ey,90,unlocked?'#91ed8e44':'#d4ad6522');c.strokeStyle=unlocked?'#91ed8e':'#786343';c.lineWidth=4;c.strokeRect(ex-27,ey-30,54,57);c.fillStyle='#0e1a17';c.fillRect(ex-23,ey-27,46,50);
   c.font='bold 10px sans-serif';c.textAlign='center';c.fillStyle=unlocked?'#91ed8e':'#c3ac82';c.fillText(unlocked?'EXIT OPEN':'SEALED',ex,ey+40);
   for(const item of game.items){const x=item.x*T,y=item.y*T;if(item.kind==='key')glow(x,y,32,'#ffe08322');drawArt(item.kind,x,y+Math.sin(now/400+item.x)*2,54);}
   for(const g of game.generators){if(g.hp<=0){c.strokeStyle='#60565a';c.lineWidth=3;c.beginPath();c.arc(g.x*T,g.y*T,16,0,Math.PI*2);c.stroke();continue;}glow(g.x*T,g.y*T,70,'#ac57eb25');drawArt('generator',g.x*T,g.y*T,75);c.fillStyle='#111';c.fillRect(g.x*T-20,g.y*T+23,40,4);c.fillStyle='#ba75d3';c.fillRect(g.x*T-20,g.y*T+23,40*g.hp/100,4);}
   const actors=[...game.enemies.map(e=>({...e,enemy:true})),...game.players].sort((a,b)=>a.y-b.y);
   const present=new Set(actors.map(a=>a.id));for(const key of positions.keys())if(!present.has(key))positions.delete(key);
   for(const a of actors){let pos=positions.get(a.id);if(!pos||Math.hypot(pos.x-a.x,pos.y-a.y)>4){pos={x:a.x,y:a.y};positions.set(a.id,pos);}const moving=Math.hypot(pos.x-a.x,pos.y-a.y)>.015;pos.x+=(a.x-pos.x)*.35;pos.y+=(a.y-pos.y)*.35;
    const x=pos.x*T,y=pos.y*T,bob=moving?Math.sin(now/85)*1.6:Math.sin(now/700+a.x)*.7;
    c.fillStyle='#050b0855';c.beginPath();c.ellipse(x,y+10,18,8,0,0,Math.PI*2);c.fill();
    if(!a.enemy){c.strokeStyle=a.color;c.lineWidth=a.id===id?3:2;c.beginPath();c.ellipse(x,y+9,21,10,0,0,Math.PI*2);c.stroke();if(a.shield>0)glow(x,y,32,a.color+'35');}
    drawArt(a.enemy?a.kind:a.hero,x,y+bob,68,a.hp<=0?.35:a.phase?.24:1);
    if(!a.enemy){c.fillStyle=a.color;c.fillRect(x-18,y-30,36,14);c.fillStyle='#102019';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText(`P${a.number}${a.id===id?' · YOU':''}`,x,y-20);c.fillStyle='#0b1210';c.fillRect(x-18,y+23,36,4);c.fillStyle=a.hp<30?'#f08067':a.color;c.fillRect(x-18,y+23,36*a.hp/100,4);
     if(a.hp<=0){c.fillStyle='#f8dfaa';c.font='bold 11px sans-serif';c.fillText(a.revive>0?`REVIVING ${Math.round(a.revive/2.5*100)}%`:'DOWNED',x,y+39);}
    }
   }
   for(const s of game.shots){const x=s.x*T,y=s.y*T;c.strokeStyle=s.hostile?'#ff7754':s.kind==='wizard'?'#9bceff':'#f7d78b';c.lineWidth=s.kind==='elf'?2:4;c.beginPath();c.moveTo(x-s.dx*1.3,y-s.dy*1.3);c.lineTo(x,y);c.stroke();glow(x,y,12,s.hostile?'#ff572744':'#d5ecff44');}
   c.restore();
   const vignette=c.createRadialGradient(W/2,H/2,140,W/2,H/2,600);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#050c0960');c.fillStyle=vignette;c.fillRect(0,0,W,H);
   c.fillStyle='#0a120cb0';c.fillRect(16,16,151,29);c.fillStyle='#c4cfaa';c.textAlign='left';c.font='11px sans-serif';c.fillText('EMBERVAULT / DEPTH 01',25,35);
   // Small complete-level map helps players find keys and the exit beyond the camera.
   c.save();c.translate(W-73,17);c.fillStyle='#08100de0';c.fillRect(-5,-5,66,94);
   for(let y=0;y<29;y++)for(let x=0;x<19;x++){c.fillStyle=game.map[y][x]==='#'?'#53604b':'#1d2d23';c.fillRect(x*3,y*3,3,3);}
   for(const g of game.generators.filter(g=>g.hp>0)){c.fillStyle='#cc8be9';c.fillRect(g.x*3-2,g.y*3-2,4,4);}for(const i of game.items.filter(i=>i.kind==='key')){c.fillStyle='#ffda74';c.fillRect(i.x*3-1,i.y*3-1,3,3);}for(const p of game.players){c.fillStyle=p.color;c.fillRect(p.x*3-2,p.y*3-2,4,4);}c.restore();
  }
  updateDynamicTexture(engine,texture,surface,{invertY:false});resizeEngine(engine);updateSprite2D(sprite,{positionPx:[canvas.width/2,canvas.height/2],sizePx:[canvas.width,canvas.height]});renderFrame(engine,delta);
 }
 return {draw,screenToWorld(x,y){return {x:(x*W+camera.x)/T,y:(y*H+camera.y)/T};},dispose(){if(disposed)return;disposed=true;recovery.disable();disposeSpriteRenderer(renderer);disposeSpriteAtlas(atlas);disposeEngine(engine);}};
}
