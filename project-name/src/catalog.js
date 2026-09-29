export const HEROES = [
 {id:'warrior',name:'Warrior',weapon:'Heavy axe',trait:'POWER',detail:'Crushing axes · 28 damage',key:'1'},
 {id:'valkyrie',name:'Valkyrie',weapon:'Swift spear',trait:'BALANCE',detail:'Quick spears · 21 damage',key:'2'},
 {id:'wizard',name:'Wizard',weapon:'Arcane blast',trait:'SPLASH',detail:'Explosive magic · 35 damage',key:'3'},
 {id:'elf',name:'Elf',weapon:'Rapid arrows',trait:'SPEED',detail:'Fastest movement · rapid fire',key:'4'},
];
export const ENEMIES=[['ghost','Ghost','Relentless pursuer'],['grunt','Grunt','Armored bruiser'],['demon','Demon','Ranged fireballs'],['sorcerer','Sorcerer','Phases out of reach']];
export const ART=['warrior','valkyrie','wizard','elf','ghost','grunt','demon','sorcerer','generator','food','treasure','key','torch','wall','floor'];
export const artUrl=name=>`${import.meta.env.BASE_URL}art/${name}.png`;
export function normalized(x,y){const n=Math.max(1,Math.hypot(x,y));return {x:x/n,y:y/n};}
