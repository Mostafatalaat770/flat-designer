/** Original procedural visual swatches. No supplier images or physical material claims. */
import fs from 'node:fs';import {createCanvas} from '@napi-rs/canvas';import {dir,profiles} from './build-whole-home-m3-group3.mjs';
fs.mkdirSync(dir+'/textures',{recursive:true});fs.mkdirSync('dist/m3g3assets',{recursive:true});
for(const [key,p]of Object.entries(profiles))for(const kind of ['wall','feature','floor']){
 const w=768,h=384,c=createCanvas(w,h),x=c.getContext('2d');x.fillStyle=kind==='feature'?p.stone:kind==='floor'?p.floor:p.wall;x.fillRect(0,0,w,h);
 let seed=kind.length*197+key.charCodeAt(0);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<120;i++){const y=random()*h,amp=2+random()*10;x.strokeStyle=kind==='feature'?`rgba(245,236,210,${.015+random()*.055})`:`rgba(100,96,78,${.003+random()*.009})`;x.lineWidth=kind==='feature'?1+random()*8:1;x.beginPath();x.moveTo(0,y);for(let t=0;t<=w;t+=12)x.lineTo(t,y+Math.sin(t*.007+i)*amp+Math.sin(t*.013+i*2)*amp*.28);x.stroke();}
 for(let i=0;i<15000;i++){x.fillStyle=`rgba(${random()>.5?'255,255,250':'72,68,58'},${kind==='feature'?.01:.008})`;x.fillRect(random()*w,random()*h,1,1);}
 // Tiny tonal joints communicate composition only; not a tile setting-out or waterproof joint design.
 if(kind==='floor'){x.strokeStyle='rgba(98,93,82,.12)';x.lineWidth=1;x.strokeRect(.5,.5,w-1,h-1);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.stroke();}
 const bytes=c.toBuffer('image/png'),file=key+'-'+kind+'.png';fs.writeFileSync(dir+'/textures/'+file,bytes);fs.writeFileSync('dist/m3g3assets/'+file,bytes);
}console.log('6 original generic material textures / not products');
