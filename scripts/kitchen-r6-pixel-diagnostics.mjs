// Read-only display-pixel diagnostics. Not physical illuminance or glare metrology.
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const out='renders/kitchen-r6',regions={hob:[340,380,200,90],hood_wall:[315,270,220,90],prep_surface:[775,495,210,65]},records=[];
for(const option of ['L0','L1','L2','L3'])for(const view of ['kitchen-work','kitchen-work-evening']){
 const img=await loadImage(out+'/'+option+'/'+view+'.png'),c=createCanvas(1280,720),ctx=c.getContext('2d');ctx.drawImage(img,0,0);
 const record={option,view,regions:{}};
 for(const [id,[x,y,w,h]] of Object.entries(regions)){
  const px=ctx.getImageData(x,y,w,h).data;let sum=0,clipped=0;
  for(let i=0;i<px.length;i+=4){sum+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];if(px[i]>=250&&px[i+1]>=250&&px[i+2]>=250)clipped++;}
  record.regions[id]={roi_pixels:[x,y,w,h],mean_encoded_image_luma_0_255:Math.round(sum/(w*h)*100)/100,near_white_fraction:Math.round(clipped/(w*h)*10000)/10000};
 }records.push(record);
}
const evidence={schema:'KitchenR6DisplayPixelDiagnostics/1',method:'Fixed image-coordinate rectangles in exact matched 1280x720 cameras. Weighted display-encoded RGB; no linear/radiometric calibration.',not_lux:true,not_glare_certification:true,records};
fs.writeFileSync('work/kitchen-r6/pixel-diagnostics.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
