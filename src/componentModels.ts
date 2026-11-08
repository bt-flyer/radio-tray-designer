import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type {ComponentDef} from './model';

// Appearance only: local layout Y is reflected here to match the exported tray.
// Dimensions and mounting positions come from the saved component definition.
export function componentModel(c:ComponentDef):THREE.Group {
 const g=new THREE.Group();g.name=c.name;g.userData={referenceOnly:true,appearance:'Estimated from product photographs; ports are not clearance specifications'};
 const l=c.body.l??44,w=c.body.w??28,h=c.body.h??12,bx=c.bodyOffset?.x??0,by=c.bodyOffset?.y??0;let onBody=true;
 const colors={black:0x252a30,silver:0x969fa7,gold:0xcaa24b,red:0xb72d32,yellow:0xe9b72e,green:0x23744f};
 function mesh(geometry:THREE.BufferGeometry,color:number,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.55,metalness:color===colors.silver||color===colors.gold?.55:.12}));m.position.set(x+(onBody?bx:0),-y-(onBody?by:0),z);g.add(m);return m;}
 function box(a:number,b:number,d:number,color:number,x=0,y=0,z=d/2,round=.5){return mesh(new RoundedBoxGeometry(a,b,d,2,Math.min(round,a/4,b/4,d/4)),color,x,y,z);}
 function cylinder(r:number,d:number,color:number,x:number,y:number,z:number,axis:'x'|'z'='z'){const m=mesh(new THREE.CylinderGeometry(r,r,d,20),color,x,y,z);m.rotation.z=axis==='x'?Math.PI/2:0;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 function label(text:string,x:number,y:number,z:number,a:number,b:number,bg='#20262c',fg='#e9ecef'){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 40px sans-serif';ctx.fillText(text,256,64,490);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(a,b),new THREE.MeshBasicMaterial({map:tex}));m.position.set(x+bx,-y-by,z);g.add(m);
 }
 function pins(x:number,y:number,count:number,z=h*.7){box(Math.min(l*.8,count*2.54+2),5,3,colors.black,x,y,z);for(let n=0;n<count;n++)cylinder(.45,1.8,colors.gold,x+(n-(count-1)/2)*2.54,y,z+2.3);}
 function screen(){box(l*.82,w*.76,.6,colors.black,0,0,h-.3);box(l*.73,w*.64,.2,0x254457,0,0,h+.05);label('KINGTECH  G4',0,-w*.17,h+.18,l*.6,w*.13,'#254457');label('READY   0 RPM',0,w*.08,h+.18,l*.6,w*.16,'#254457','#83dcce');}
 if(c.id==='kp600'){
  const body=cylinder(16,65,colors.black,0,0,20,'x');body.name='kp600-dummy-body';
  const ring=new THREE.Shape();ring.absarc(0,0,17,0,Math.PI*2,false);const inner=new THREE.Path();inner.absarc(0,0,16.1,0,Math.PI*2,true);ring.holes.push(inner);
  const band=mesh(new THREE.ExtrudeGeometry(ring,{depth:12,bevelEnabled:false,curveSegments:48}),colors.silver,-28.5,0,20);band.rotation.y=Math.PI/2;
  onBody=false;
  for(const t of c.tabs??[])box(t.l,t.w,2,colors.silver,t.x,t.y,1);
  for(const sign of [-1,1])box(12,2,20,colors.silver,-22.5,sign*16,10);
  for(const p of c.holes)cylinder((p.d??3)/2,.1,0x07090b,p.x,p.y,2.06);
  g.userData.referenceOnly=true;return g;
 }
 const bodyColor=c.id==='sp1'?colors.red:c.id==='drm'?colors.silver:c.id==='telemetry'?0x354e56:colors.black;
 box(l,w,h,bodyColor,0,0,h/2,Math.min(1.5,h/8));
 // Case seam and measured mounting ears, with actual hardware hole sizes.
 if(h>3)box(l+.04,w+.04,.3,0x11171b,0,0,Math.min(2,h*.2),.1);
 onBody=false;
 for(const t of c.tabs??[])box(t.l,t.w,1.8,bodyColor,t.x,t.y,.9);
 if(c.id==='sp1')for(const p of c.holes)cylinder((c.mountBossDiameter??8)/2,3,colors.red,p.x,p.y,1.5);
 for(const p of c.holes){const r=(p.d??3)/2;const ring=new THREE.Shape();ring.absarc(0,0,r+1.1,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,r,0,Math.PI*2,true);ring.holes.push(hole);mesh(new THREE.ExtrudeGeometry(ring,{depth:.5,bevelEnabled:false,curveSegments:20}),colors.silver,p.x,p.y,1.85);cylinder(r,.08,0x07090b,p.x,p.y,2.4);}
 onBody=true;
 switch(c.id){
 case 'rb35s':
  label('FrSky  RB-35S',0,-w*.07,h+.15,l*.5,w*.16);label('DUAL POWER / TRIPLE RECEIVER',0,w*.11,h+.15,l*.66,w*.08);
  for(const y of [-w*.34,w*.34])for(let n=0;n<12;n++)box(4.8,6,2.5,colors.black,(n-5.5)*6.6,y,h+.8);
  for(const y of [-w*.34,w*.34])for(let n=0;n<24;n++)cylinder(.38,.8,colors.gold,(n-11.5)*3.3,y,h+2.3);
  for(const x of [-l*.3,l*.3])box(11,6,2.4,colors.yellow,x,0,h+1);break;
 case 'sp1':
  label('FrSky SP-1',-l*.12,0,h+.15,l*.58,w*.24,'#b72d32');
  for(const y of [-6,6]){cylinder(3,3,colors.silver,l/2+1.5,y,18,'x');cylinder(2.25,7,colors.gold,l/2+6,y,18,'x');}
  for(let n=0;n<5;n++)box(.7,w*.7,.5,0x8b2128,-l*.35+n*3,0,h+.2);break;
 case 'gsu':screen();box(3,12,5,colors.black,l/2+1,0,h/2);break;
 case 'drm':
  box(l*.57,8,2.5,colors.black,l*.08,-w*.28,h+1);
  for(const y of [-w*.16,w*.1])box(9,8,3,colors.green,-l*.29,y,h+1.2);
  cylinder(1.5,.3,colors.silver,0,0,h+.2);for(let n=0;n<5;n++){const m=box(10,.65,.2,0x30363c,l*.31,w*.22+n*1.3,h+.1);m.rotation.z=.65;}label('KingTech',l*.1,w*.1,h+.25,l*.35,w*.12,'#969fa7','#24292e');break;
 case 'pgc':
  label('FrSky  PGC',0,0,h+.15,l*.53,w*.18);
  for(const y of [-w*.37,w*.37])pins(0,y,10,h+.6);
  box(10,5,3,colors.yellow,-l*.3,0,h+1);cylinder(1,1,0x55d388,l*.32,0,h+.5);break;
 case 'tone':
  label('Navigation light',0,-w*.28,h+.12,l*.84,w*.14);label('controller',0,-w*.11,h+.12,l*.6,w*.14);label('T-ONE',-l*.1,w*.29,h+.12,l*.6,w*.22);
  cylinder(1.4,.8,0xb51422,l*.28,w*.1,h+.4);label('STATE',l*.28,-w*.015,h+.12,l*.2,w*.07);break;
 case 'gps':
  box(l*.63,w*.73,.5,0xc6c2a7,0,0,h-.15);box(l*.46,w*.54,.3,0xdfd8bc,0,0,h+.2);cylinder(.7,.4,0x4fdd80,l*.36,w*.24,h+.2);label('GPS ADV',0,-w*.36,h+.15,l*.65,w*.12);break;
 case 'airspeed':
  label('FrSky ASS-70',0,0,h+.12,l*.78,w*.2);for(const y of [-4,4]){cylinder(2.5,3,colors.black,l/2+1.5,y,h*.6,'x');cylinder(1.5,6,colors.silver,l/2+6,y,h*.6,'x');}break;
 case 'nfc':
  for(let n=0;n<3;n++){const arc=new THREE.TorusGeometry(3+n*1.8,.23,6,32,Math.PI*1.4);const m=mesh(arc,colors.silver,-l*.22,0,h+.12);m.rotation.z=.7;}
  label('NFC',l*.23,0,h+.15,l*.35,w*.3);box(3,6,3,0xe9e8de,l/2+1,0,h/2);break;
 case 'telemetry':
  label('TELEMETRY',0,0,h+.12,l*.8,w*.18,'#354e56');box(3,9,4,0xd8d7cb,l/2+1,0,h*.55);box(3,9,4,0xd8d7cb,-l/2-1,0,h*.55);break;
 case 'servo3':
  for(const x of [-2.54,0,2.54]){const pin=box(.64,.64,6,colors.gold,x,0,h+3,.04);pin.name='Servo header pin';}
  break;
 case 'xt30':case 'xt60':{
  // Replace the generic housing with a yellow keyed shell and two socket mouths.
  const first=g.children[0] as THREE.Mesh;first.material=new THREE.MeshStandardMaterial({color:colors.yellow,roughness:.55});
  const r=w*.29;for(const x of [-l*.23,l*.23]){cylinder(r,.35,colors.gold,x,0,h+.15);cylinder(r*.68,.08,0x191b1d,x,0,h+.37);}break;
 }
 default:label(c.name,0,0,h+.1,l*.85,w*.2);break;
 }
 return g;
}
