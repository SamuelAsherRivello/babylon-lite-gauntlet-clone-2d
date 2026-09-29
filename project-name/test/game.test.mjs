import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {HEROES,ENEMIES,ART,normalized} from '../src/catalog.js';
test('every class and enemy has an original complete transparent sprite',()=>{
 assert.equal(new Set(HEROES.map(h=>h.id)).size,4);assert.equal(new Set(ENEMIES.map(e=>e[0])).size,4);
 for(const name of ART){const b=readFileSync(new URL(`../public/art/${name}.png`,import.meta.url));assert.equal(b.readUInt32BE(16),128);assert.equal(b.readUInt32BE(20),128);assert.equal(b[25],6,'RGBA '+name);assert.equal(b.subarray(-8,-4).toString(),'IEND');}
 assert.ok(existsSync(new URL('../art-source/embervault-sprites.blend',import.meta.url)));
});
test('combined keyboard and touch movement never gives a diagonal speed advantage',()=>{
 for(const [x,y]of [[0,0],[1,1],[-2,2],[.2,.3]]){const p=normalized(x,y);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(Math.hypot(p.x,p.y)<=1.000001);}
});
test('release pin, renderer and production subpath are explicit',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url)));assert.equal(pkg.dependencies['@babylonjs/lite'],'1.25.0');assert.match(pkg.dependencies['@rmc/multiplayer-client'],/releases\/download\/v0\.4\.0\//);
 assert.match(readFileSync(new URL('../../vite.config.js',import.meta.url),'utf8'),/base: "\/babylon-lite-gauntlet-clone-2d\/"/);
});
