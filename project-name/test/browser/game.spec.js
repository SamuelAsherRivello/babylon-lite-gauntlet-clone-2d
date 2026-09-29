import {test,expect} from '@playwright/test';
const URL=process.env.GAME_URL||'http://127.0.0.1:5187/babylon-lite-gauntlet-clone-2d/';
async function ready(page){await page.goto(URL);await page.waitForFunction(()=>window.embervault?.status()==='connected',null,{timeout:45000});await expect(page.locator('#overlay')).toBeHidden();}
async function state(page){return page.evaluate(()=>({g:embervault.snapshot(),id:embervault.self()}));}
test('two real browsers share duplicate classes, movement, pause and reconnect',async({browser})=>{
 const a=await browser.newContext(),b=await browser.newContext(),p=await a.newPage(),q=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));q.on('pageerror',e=>errors.push(e.message));
 try{await ready(p);await ready(q);for(const name of ['Warrior','Valkyrie','Wizard','Elf']){await p.getByRole('button',{name:`Choose ${name}`,exact:true}).click();await expect(p.getByRole('button',{name:`Choose ${name}`,exact:true})).toHaveAttribute('aria-pressed','true');}await p.getByRole('button',{name:'Choose Wizard',exact:true}).click();await q.getByRole('button',{name:'Choose Wizard',exact:true}).click();
 await expect.poll(async()=>(await state(p)).g.players.filter(x=>x.hero==='wizard').length).toBe(2);
 let {g,id}=await state(p);expect(new Set(g.players.map(p=>p.color)).size).toBe(g.players.length);const x=g.players.find(p=>p.id===id).x;
 await p.keyboard.down('a');await p.waitForTimeout(450);await p.keyboard.up('a');await expect.poll(async()=>(await state(q)).g.players.find(x=>x.id===id).x).toBeLessThan(x-.4);
 await p.keyboard.down('w');await p.keyboard.press('p');await expect(p.locator('#overlay-title')).toHaveText('Taking a breath');await p.waitForTimeout(400);const paused=(await state(p)).g.players.find(p=>p.id===id).y;await p.waitForTimeout(400);expect((await state(p)).g.players.find(p=>p.id===id).y).toBeCloseTo(paused,2);await p.keyboard.up('w');await p.getByRole('button',{name:'Resume expedition',exact:true}).click();
 await p.screenshot({path:'project-name/documentation/screenshot.png',fullPage:true});await q.close();await expect.poll(async()=>(await state(p)).g.players.length).toBe(1);
 const old=id;await p.reload();await p.waitForFunction(()=>window.embervault?.status()==='connected');expect((await state(p)).id).not.toBe(old);expect(errors).toEqual([]);
 }finally{await a.close();await b.close();}
});
test('narrow touch layout, simultaneous move/attack, cancellation and GPU recovery message',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),page=await context.newPage();try{await ready(page);await page.getByRole('button',{name:'Choose Elf',exact:true}).click();
 const cdp=await context.newCDPSession(page),j=await page.locator('#joystick').boundingBox(),a=await page.locator('#attack').boundingBox();
 const touchPoints=[{x:j.x+j.width/2+20,y:j.y+j.height/2,id:1},{x:a.x+a.width/2,y:a.y+a.height/2,id:2}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints});await page.waitForTimeout(150);expect(await page.evaluate(()=>embervault.input().x)).toBeGreaterThan(.3);expect(await page.evaluate(()=>embervault.input().attack)).toBe(true);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect(await page.evaluate(()=>embervault.input().x)).toBe(0);expect(await page.evaluate(()=>embervault.input().attack)).toBe(false);
 await page.screenshot({path:'project-name/documentation/mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const b of await page.locator('[data-hero]').all()){const r=await b.boundingBox();expect(r.y+r.height).toBeLessThanOrEqual(844);}
 }finally{await context.close();}
 const noGPU=await browser.newContext();await noGPU.addInitScript(()=>Object.defineProperty(navigator,'gpu',{value:undefined}));const p=await noGPU.newPage();await p.goto(URL);await expect(p.locator('#overlay-title')).toHaveText('A graphics device is needed');await expect(p.locator('#overlay-text')).toContainText('WebGPU');await noGPU.close();
});
test('complete dungeon using real keyboard inputs and observe automatic replay',async({browser})=>{
 test.skip(process.env.SKIP_FULL_LOOP==='1','Full loop already verified separately');
 const context=await browser.newContext(),other=await browser.newContext(),page=await context.newPage(),ally=await other.newPage();try{await ready(page);await ready(ally);await page.getByRole('button',{name:'Choose Wizard',exact:true}).click();await ally.getByRole('button',{name:'Choose Wizard',exact:true}).click();await ally.keyboard.down(' ');const first=(await state(page)).g.round;let held=new Set();const started=Date.now();let outcome='playing';
 while(Date.now()-started<290000){
  const decision=await page.evaluate(()=>{
   const g=embervault.snapshot(),p=g.players.find(p=>p.id===embervault.self());if(g.status!=='playing')return {status:g.status};const dist=t=>Math.hypot(p.x-t.x,p.y-t.y),wall=(x,y)=>g.map[Math.floor(y)]?.[Math.floor(x)]!=='.';
   const visible=t=>{let d=dist(t);for(let n=.25;n<d;n+=.25)if(wall(p.x+(t.x-p.x)*n/d,p.y+(t.y-p.y)*n/d))return false;return true;};
   let target=g.generators.filter(g=>g.hp>0).sort((a,b)=>dist(a)-dist(b))[0]||g.items.filter(t=>t.kind==='key').sort((a,b)=>dist(a)-dist(b))[0]||g.exit;
   if(p.hp<65){const food=g.items.filter(t=>t.kind==='food').sort((a,b)=>dist(a)-dist(b))[0];if(food)target=food;}
   if(target.id?.startsWith('nest')&&dist(target)<4&&visible(target))return {keys:[' '],status:g.status};
   let dx=target.x-p.x,dy=target.y-p.y;
   if(!visible(target)){
    const sx=Math.floor(p.x),sy=Math.floor(p.y),q=[{x:sx,y:sy,f:null}],seen=new Set([sy*19+sx]),end=Math.floor(target.y)*19+Math.floor(target.x);
    for(let i=0;i<q.length;i++){const n=q[i];if(n.y*19+n.x===end&&n.f){dx=n.f.x+.5-p.x;dy=n.f.y+.5-p.y;break;}for(const [x,y]of [[n.x,n.y-1],[n.x+1,n.y],[n.x,n.y+1],[n.x-1,n.y]]){if(wall(x+.5,y+.5)||seen.has(y*19+x))continue;seen.add(y*19+x);q.push({x,y,f:n.f||{x,y}});}}
   }
   const keys=[' '];if(Math.abs(dx)>.15)keys.push(dx<0?'a':'d');if(Math.abs(dy)>.15)keys.push(dy<0?'w':'s');return {keys,status:g.status};
  });
  outcome=decision.status;if(outcome!=='playing')break;const next=new Set(decision.keys);for(const k of held)if(!next.has(k))await page.keyboard.up(k);for(const k of next)if(!held.has(k))await page.keyboard.down(k);held=next;await page.waitForTimeout(100);
 }
 for(const k of held)await page.keyboard.up(k);await page.screenshot({path:'project-name/documentation/full-loop.png',fullPage:true});expect(outcome).toBe('victory');await expect(page.locator('#overlay-title')).toHaveText('The vault is conquered');await expect(ally.locator('#overlay-title')).toHaveText('The vault is conquered');await expect.poll(async()=>(await state(page)).g.round,{timeout:15000}).toBe(first+1);await expect(page.locator('#overlay')).toBeHidden();await expect(ally.locator('#overlay')).toBeHidden();
 }finally{await context.close();await other.close();}
});
test('party defeat is visible and recovers into a fresh expedition',async({browser})=>{
 test.skip(process.env.SKIP_FULL_LOOP==='1','Full loop already verified separately');const context=await browser.newContext(),page=await context.newPage();try{await ready(page);const first=(await state(page)).g.round;await expect(page.locator('#overlay-title')).toHaveText('The party has fallen',{timeout:110000});await page.screenshot({path:'project-name/documentation/defeat.png',fullPage:true});await expect.poll(async()=>(await state(page)).g.round,{timeout:15000}).toBe(first+1);await expect(page.locator('#overlay')).toBeHidden();}finally{await context.close();}
});


