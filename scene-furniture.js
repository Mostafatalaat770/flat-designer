/* Distinct furniture silhouettes share the editable layout's exact footprints. */
const STYLE_FURNITURE_TYPES=new Set(['sofa','armchair','bed','chair','coffeetable','sidetable','roundtable','table','wardrobe','cabinet','shoecab','nightstand','tvstand','floorlamp','rug']);
function makeStyleFurniture(f){
  const t=currentDecor();if(t.id==='custom'||!STYLE_FURNITURE_TYPES.has(f.type))return null;
  const g=new THREE.Group(),w=M(f.w),d=M(f.d),c=f.color,wm=woodM(t.wood),dk=woodM(t.woodDark),fab=fabric(c),z0=-d/2;
  if(f.type==='sofa'||f.type==='armchair'){
    const one=f.type==='armchair',n=one?1:2,a=Math.min(.16,w*.18),seatW=w-a*2,seatD=d-.22;
    if(t.id==='warm'){
      g.add(rbox(w-.08,.16,d-.08,fabric(darker(c,.78)),0,.055,0,.06));
      g.add(rbox(w,.62,.18,fab,0,.18,z0+.09,.085));
      for(const s of [-1,1])g.add(rbox(a,.47,d,fab,s*(w/2-a/2),.18,0,.085));
      for(let i=0;i<n;i++){
        const x=-seatW/2+seatW/n*(i+.5);
        cushion(g,seatW/n-.012,.20,seatD,c,x,.23,.09);
        cushion(g,seatW/n-.035,.43,.17,c,x,.43,z0+.21,-.06);
      }
    }else if(t.id==='japandi'){
      legs(g,w-.03,d-.03,.19,wm,.045,.024);
      g.add(rbox(w,.075,d,wm,0,.18,0,.016));
      for(const s of [-1,1]){
        g.add(rod([s*(w/2-.03),.2,z0+.025],[s*(w/2-.03),.66,z0+.025],.018,wm));
        g.add(rod([s*(w/2-.03),.2,d/2-.025],[s*(w/2-.03),.58,d/2-.025],.018,wm));
        g.add(rod([s*(w/2-.03),.64,z0+.02],[s*(w/2-.03),.58,d/2-.02],.024,wm));
      }
      const slats=Math.max(4,Math.floor(w/.105));
      for(let i=0;i<slats;i++)g.add(box(.04,.50,.023,wm,-w/2+.06+(w-.12)*i/(slats-1),.25,z0+.015));
      for(let i=0;i<n;i++){
        const x=-seatW/2+seatW/n*(i+.5);
        cushion(g,seatW/n-.018,.17,seatD,c,x,.25,.08);
        cushion(g,seatW/n-.035,.35,.17,c,x,.41,z0+.19,-.06);
      }
    }else{
      legs(g,w-.06,d-.06,.16,wm,.04,.023);
      g.add(rbox(w,.13,d,wm,0,.15,0,.035));
      canePanel(g,w-.045,one?.65:.5,0,.29,z0+.018,t.wood);
      for(const s of [-1,1]){
        const side=new THREE.Group();canePanel(side,d-.04,.32,0,.28,0,t.wood);side.rotation.y=Math.PI/2;side.position.x=s*(w/2-.015);g.add(side);
      }
      for(let i=0;i<n;i++){
        const x=-seatW/2+seatW/n*(i+.5);
        cushion(g,seatW/n-.018,.19,seatD,c,x,.28,.075);
        cushion(g,seatW/n-.025,.40,.17,c,x,.46,z0+.18,-.07);
      }
      g.add(rbox(Math.min(.25,w*.28),.025,d*.64,fabric(t.accent),w/2-a/2,.62,.01,.012));
    }
    if(!one){
      cushion(g,.32,.33,.12,t.accent,-w*.28,.45,z0+.30,-.08);
      cushion(g,.31,.30,.12,t.id==='boho'?'#4f7770':'#eee8dd',w*.28,.44,z0+.30,-.08);
    }
    g.userData.modelForm=t.id==='warm'?'rounded-upholstery':t.id==='japandi'?'exposed-oak-frame':'woven-cane-frame';
  }else if(f.type==='bed'){
    const bh=t.id==='japandi'?.18:.28,hh=w<1.4?.82:t.id==='japandi'?.85:1.18;
    if(t.id==='warm'){
      g.add(rbox(w,bh,d-.04,fab,0,.04,.02,.075));
      const count=Math.max(4,Math.round(w/.20));
      for(let i=0;i<count;i++)g.add(rbox(w/count-.009,hh,.09,fabric(darker(c,.90)),-w/2+(i+.5)*w/count,0,z0+.045,.032));
    }else{
      g.add(rbox(w,bh,d,wm,0,.055,0,.012));
      if(t.id==='japandi'){
        g.add(box(w,.055,.035,wm,0,hh-.055,z0+.025));
        for(let x=-w/2+.025;x<w/2;x+=.095)g.add(box(.035,hh,.035,wm,x,0,z0+.025));
      }else{
        canePanel(g,w,hh-.20,0,.18,z0+.018,t.wood);
        const pts=[];for(let k=0;k<=32;k++){const a=Math.PI-k*Math.PI/32;pts.push([Math.cos(a)*w*.48,hh-.10+Math.sin(a)*.12,z0+.015]);}
        g.add(tube(pts,.018,wm));
      }
    }
    const y=bh+.055;
    g.add(rbox(w-.07,.21,d-.16,sceneSurface('linen','#faf8f2'),0,y,.06,.07));
    cushion(g,w-.035,.19,d*.66,c,0,y+.115,d*.17);
    cushion(g,w-.02,.035,.28,'#eee7d9',0,y+.30,-d*.16);
    const n=w>1.4?2:1,pw=(w-.20)/n;
    for(let i=0;i<n;i++)cushion(g,pw-.035,.15,.39,'#f5f0e7',-w/2+.10+(i+.5)*pw,y+.24,z0+.35,-.035);
    cushion(g,w-.06,.018,.43,t.accent,0,y+.30,d*.30);
    g.userData.modelForm=t.id==='warm'?'channel-headboard':t.id==='japandi'?'low-slat-platform':'arched-cane-headboard';
  }else if(f.type==='chair'){
    const h=.46;legs(g,w-.015,d-.015,h-.05,wm,.025,.018);
    if(t.id==='warm'){
      cushion(g,w,.065,d-.03,c,0,h-.055,.015);
      g.add(rbox(w,.38,.045,fab,0,h-.02,z0+.025,.04));
    }else if(t.id==='japandi'){
      g.add(rbox(w,.03,d,wm,0,h-.035,0,.015));
      cushion(g,w-.045,.035,d-.055,'#e3ddce',0,h-.005,.02);
      for(const s of [-1,1])g.add(rod([s*(w/2-.025),.35,z0+.022],[s*(w/2-.025),.85,z0+.022],.014,wm));
      g.add(rbox(w,.12,.027,wm,0,.73,z0+.018,.025));
    }else{
      cushion(g,w-.025,.055,d-.02,c,0,h-.04,.01);
      canePanel(g,w-.015,.37,0,h,z0+.013,t.wood);
    }
    g.userData.modelForm=t.id+'-dining-chair';
  }else if(['table','roundtable','coffeetable','sidetable'].includes(f.type)){
    const round=f.type==='roundtable',dining=f.type==='table'||(round&&Math.min(w,d)>.95),small=f.type==='sidetable',h=dining?.75:small||round?.52:.38;
    if(t.id==='warm'){
      ellipseTop(g,w,d,.045,sceneSurface('stone','#e4d9c7'),h-.045);
      if(dining){
        for(const x of [-w*.26,w*.26]){
          ellipseTop(g,Math.min(.20,w*.2),d*.58,h-.05,wm,0,x);
        }
      }else{
        ellipseTop(g,w*.34,d*.43,h-.05,wm);
        for(let k=0;k<24;k++){const a=k*Math.PI/12;g.add(rod([Math.cos(a)*w*.175,0,Math.sin(a)*d*.225],[Math.cos(a)*w*.175,h-.05,Math.sin(a)*d*.225],.008,dk,.008,6));}
      }
    }else if(t.id==='japandi'){
      ellipseTop(g,w,d,.045,woodM(c),h-.045);
      legs(g,w*.83,d*.82,h-.055,wm,.02,.028);
      if(dining)g.add(box(w*.75,.065,.04,wm,0,h-.13,0));
    }else{
      caneDrum(g,w*.64,d*.64,h-.045,0,t.wood);
      ellipseTop(g,w,d,.04,woodM(c),h-.04);
      ellipseTop(g,w*.70,d*.70,.018,wm,0);
    }
    tabletopObjects(g,w,d,h,t);g.userData.modelForm=t.id+'-'+(dining?'dining-table':'occasional-table');
  }else if(['wardrobe','cabinet','shoecab','tvstand','nightstand'].includes(f.type)){
    const h=f.type==='wardrobe'?2.20:f.type==='shoecab'?1.02:f.type==='cabinet'?.9:f.type==='nightstand'?.52:.50;
    if(f.type==='nightstand'&&t.id==='warm'){
      ellipseTop(g,w,d,.035,sceneSurface('stone','#e0d5c2'),h-.035);
      for(let k=0;k<28;k++){const a=k*Math.PI/14;g.add(rod([Math.cos(a)*(w/2-.015),.02,Math.sin(a)*(d/2-.015)],[Math.cos(a)*(w/2-.015),h-.04,Math.sin(a)*(d/2-.015)],.013,wm,.013,7));}
      ellipseTop(g,w-.035,d-.035,.03,wm,.01);
    }else{
      const base=t.id==='japandi'?.12:.08;
      g.add(rbox(w,h-base,d,woodM(c),0,base,0,t.id==='warm'?.018:.007));
      legs(g,w-.05,d-.05,base,dk,.035,.015);
      const n=Math.max(1,Math.round(w/.55)),pw=(w-.025)/n;
      for(let i=0;i<n;i++){
        const x=-w/2+.0125+(i+.5)*pw,fh=h-base-.02,y=base+.01,z=d/2-.005;
        if(t.id==='boho'){
          g.add(box(pw-.012,fh,.016,woodM(darker(c,.85)),x,y,z));
          canePanel(g,pw-.035,fh-.035,x,y+.018,z+.014,t.wood);
          g.add(blob(.015,.015,.016,wm,x,y+fh*.52,z+.036,12));
        }else{
          g.add(rbox(pw-.007,fh,.016,woodM(c),x,y,z,.003));
          if(t.id==='warm')for(let q=-pw/2+.025;q<pw/2-.01;q+=.045)g.add(box(.016,fh-.012,.008,wm,x+q,y+.006,z+.014));
          if(t.id==='warm')pull(g,Math.min(.18,pw*.48),false,x,y+fh*.64,z+.013);
          else g.add(box(pw-.035,.006,.006,dk,x,y+fh-.012,z+.01));
        }
      }
    }
    if(f.type==='tvstand')tabletopObjects(g,w,d,h,t);
    if(f.type==='nightstand'){
      const lx=w*.22;g.add(cyl(.07,.08,.055,ceramic(),lx,h,0));
      g.add(cyl(.065,.07,.12,sceneSurface('stone',t.pot),lx,h+.04,0));
      const shade=mat('#f6eedb',{roughness:.85,emissive:'#ffd8a0',emissiveIntensity:.18});
      g.add(cyl(.09,.13,.14,shade,lx,h+.15,0));
    }
    g.userData.modelForm=t.id+'-casework';
  }else if(f.type==='floorlamp'){
    const radius=Math.min(w,d)*.42,m=mat(t.metal,{metalness:.75,roughness:.34});
    ellipseTop(g,w*.6,d*.6,.035,m);
    g.add(cyl(.012,.014,1.40,m,0,.03,0));
    if(t.id==='japandi'){
      g.add(blob(radius,.25,radius,mat('#f4ecd9',{roughness:1,emissive:'#ffe5b5',emissiveIntensity:.2}),0,1.43,0));
      for(let y=1.25;y<1.65;y+=.06)g.add(ring(radius*.84,.004,wm,0,y,0));
    }else if(t.id==='boho'){
      caneDrum(g,w*.85,d*.85,.27,1.26,t.wood);
    }else g.add(cyl(radius*.7,radius,.25,mat('#ede3cf',{roughness:.85}),0,1.27,0));
    g.userData.modelForm=t.id+'-lamp';
  }else if(f.type==='rug'){
    const material=sceneSurface(t.id==='warm'?'wool':'linen',c),r=rbox(w,.012,d,material,0,.006,0,t.id==='warm'?.15:.01);r.castShadow=false;g.add(r);
    const border=.065;
    if(t.id==='japandi')for(const z of [-d/2+border,d/2-border])g.add(box(w-.10,.001,.035,fabric('#b0ae9e'),0,.019,z));
    if(t.id==='boho'){
      for(const z of [-d/2+.10,-d/2+.16,d/2-.16,d/2-.10])g.add(box(w-.10,.001,.028,fabric('#ead7af'),0,.019,z));
      for(let x=-w/2+.06;x<w/2-.03;x+=.06)for(const s of [-1,1])g.add(box(.012,.006,.045,fabric('#d5c19c'),x,.008,s*(d/2-.0225)));
    }
    g.userData.modelForm=t.id==='warm'?'rounded-wool-rug':t.id==='japandi'?'linen-border-rug':'fringed-woven-rug';
  }
  batchSceneMeshes(g);
  g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;
  g.userData.fid=f.id;g.userData.sceneStyle=t.id;
  g.traverse(o=>{o.userData.fid=f.id;});
  return g;
}
