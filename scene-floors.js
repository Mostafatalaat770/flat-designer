function sceneFloorPaint(kind,g,W,Hh,s,R){
  if(kind==='parquet'){
    const B=W/2,N=4;
    for(let by=0;by<2;by++)for(let bx=0;bx<2;bx++)for(let j=0;j<N;j++){
      const vertical=(bx+by)%2===0,x=bx*B+(vertical?j*B/N:0),y=by*B+(vertical?0:j*B/N),pw=vertical?B/N:B,ph=vertical?B:B/N;
      g.fillStyle=rgbK(s.base,.88+R()*.22);g.fillRect(x,y,pw,ph);
      g.strokeStyle=rgbK(s.base,.65);g.lineWidth=2;g.strokeRect(x,y,pw,ph);
      g.strokeStyle=rgbK(s.base,.78);g.globalAlpha=.28;g.lineWidth=1;
      for(let q=0;q<7;q++){
        g.beginPath();const off=(q+.5)*(vertical?pw:ph)/7;
        if(vertical){g.moveTo(x+off,y);for(let a=0;a<=ph;a+=16)g.lineTo(x+off+Math.sin(a*.05+q)*2,y+a);}
        else{g.moveTo(x,y+off);for(let a=0;a<=pw;a+=16)g.lineTo(x+a,y+off+Math.sin(a*.05+q)*2);}
        g.stroke();
      }
      g.globalAlpha=1;
    }
    return true;
  }
  if(kind==='travertine'){
    for(let y=0;y<Hh;y++){
      g.fillStyle=rgbK(s.base,.94+.055*Math.sin(y*.032)+R()*.03);g.fillRect(0,y,W,1);
    }
    for(let k=0;k<3000;k++){
      g.fillStyle=`rgba(83,64,39,${R()*.10})`;g.fillRect(R()*W,R()*Hh,1+R()*3,1);
    }
    return true;
  }
  return false;
}
function sceneFloorMaterial(texture,s){
  return new THREE.MeshPhysicalMaterial({map:texture,bumpMap:texture,bumpScale:.007,roughness:Math.max(.40,s.rough),
    clearcoat:.08,clearcoatRoughness:.6,envMap:envTex,envMapIntensity:.3});
}
