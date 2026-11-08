import {rimProfile} from './rimProfile';
import {labelOutline} from './labels';
import type { Manifold, ManifoldToplevel } from 'manifold-3d';
import { type Design,type Item,type Point,roundedOutline,rawOutline,selfIntersect,signedArea,bodyOffset,bodySize,holderBodySize,holderOffset,wallSpans,printedHoleDiameter,slotRim,trayRim,maxRimHeight } from './model';
export type MeshResult={positions:Float32Array;indices:Uint32Array;volume:number;triangles:number;pieces:number;bounds:{min:number[];max:number[]}};
export function roundedRect(l:number,w:number,r:number):Point[]{r=Math.min(r,l/2,w/2);if(r<=0)return [[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]];const p:Point[]=[];const centers=[[l/2-r,w/2-r],[-l/2+r,w/2-r],[-l/2+r,-w/2+r],[l/2-r,-w/2+r]];for(let k=0;k<4;k++)for(let j=0;j<=12;j++){const a=(k*Math.PI/2)+j/12*Math.PI/2;p.push([centers[k][0]+r*Math.cos(a),centers[k][1]+r*Math.sin(a)]);}return p;}
export function strapCuts(i:Item):{l:number;w:number;x:number;y:number}[]{const [l,w]=bodySize(i),h=i.holder;if(!h.strap.enabled)return [];const [bx,by]=bodyOffset(i),gap=h.clearance+h.wall+1+h.strap.width/2;return h.strap.axis==='x'?[-1,1].map(sign=>({l:h.strap.width,w:Math.max(6,w*.65),x:bx+sign*(l/2+gap),y:by})):[-1,1].map(sign=>({l:Math.max(6,l*.65),w:h.strap.width,x:bx,y:by+sign*(w/2+gap)}));}
export function generateGeometry(api:ManifoldToplevel,d:Design):MeshResult{
 const raw=rawOutline(d);if(selfIntersect(raw)||Math.abs(signedArea(raw))<1)throw new Error('Fix the tray outline before generating a solid.');
 const owned:{delete():void}[]=[];const own=<T extends {delete():void}>(v:T):T=>{owned.push(v);return v;};const {Manifold:M,CrossSection}=api;
 const extrude=(p:Point[],height:number)=>own(own(new CrossSection(p)).extrude(height));
 const box=(l:number,w:number,h:number,x:number,y:number,z:number)=>own(own(M.cube([l,w,h])).translate([x-l/2,y-w/2,z]));
 const place=(m:Manifold,i:Item)=>own(own(m.rotate([0,0,i.rotation])).translate([i.x,i.y,0]));
 const t=d.tray.thickness, solids:Manifold[]=[extrude(roundedOutline(d),t)],cuts:Manifold[]=[];
 const maxH=t+Math.max(5,trayRim(d).enabled?maxRimHeight(d):0,...d.items.map(i=>Math.max(i.text?.height??0,i.holder.height,i.component?.cutout?.flangeThickness??0,i.kind==='slot'?slotRim(i).height:0)))+2;
 const slot=(l:number,w:number,r:number,x=0,y=0)=>own(extrude(roundedRect(l,w,r),maxH).translate([x,y,-1]));
 try{
 const edge=trayRim(d);if(edge.enabled){const section=own(new CrossSection(roundedOutline(d))),inner=own(section.offset(-edge.wall,'Round',2,64)),ring=own(section.subtract(inner));if(edge.sideHeights){const height=rimProfile(d),rim=own(own(ring.extrude(1)).refineToLength(3));solids.push(own(rim.warp(v=>{v[2]=t-.05+v[2]*(height(v[0],v[1])+.05);})));}else solids.push(own(own(ring.extrude(edge.height+.05)).translate([0,0,t-.05])));}
 for(const i of d.items){
  if(i.kind==='label'){const text=i.text,outline=labelOutline(text);if(!text?.value.trim()||!outline.contours.length)throw new Error('Enter label text before exporting.');const section=own(new CrossSection(outline.contours,'EvenOdd'));solids.push(place(own(own(section.extrude(text.height+.05)).translate([0,0,t-.05])),i));continue;}
  if(i.kind==='hole'){cuts.push(place(own(own(M.cylinder(maxH,printedHoleDiameter(d,i.diameter,false)!/2,printedHoleDiameter(d,i.diameter,false)!/2,64)).translate([0,0,-1])),i));continue;}
  if(i.kind==='slot'){const rim=slotRim(i);if(rim.enabled)solids.push(place(own(extrude(roundedRect(i.l+2*rim.wall,i.w+2*rim.wall,Math.min(i.l,i.w)/2+rim.wall),rim.height+.05).translate([0,0,t-.05])),i));cuts.push(place(slot(i.l,i.w,Math.min(i.l,i.w)/2),i));continue;}
  const c=i.component;if(!c)continue;
  if(c.category==='connector'&&c.cutout?.printedFlange&&c.cutout.flangeL&&c.cutout.flangeW){solids.push(place(own(extrude(roundedRect(c.cutout.flangeL,c.cutout.flangeW,2),(c.cutout.flangeThickness??3)+.05).translate([0,0,t-.05])),i));}
  if(c.category==='connector'&&c.cutout?.l&&c.cutout.w)cuts.push(place(slot(c.cutout.l,c.cutout.w,c.cutout.r),i));
  for(const hole of c.holes){if(hole.d===null)continue;const radius=printedHoleDiameter(d,hole.d+i.holder.holeAllowance)!/2;cuts.push(place(own(own(M.cylinder(maxH,radius,radius,64)).translate([hole.x,hole.y,-1])),i));}
  if((c.category==='electronics'||c.category==='uat')&&i.holder.enabled&&c.body.l&&c.body.w){
   const [bx,by]=holderOffset(i),[hl,hw]=holderBodySize(i),h=i.holder,innerL=hl+2*h.clearance,innerW=hw+2*h.clearance;
   for(const side of ['north','south','east','west'] as const){const s=h.sides[side];if(!s.enabled)continue;const horiz=side==='north'||side==='south',length=horiz?innerL+2*h.wall:innerW+2*h.wall;
    const spans=wallSpans(i,side);
    for(const [a,b] of spans){if(b-a<=.001)continue;const x=horiz?(a+b)/2:(side==='west'?-1:1)*(innerL/2+h.wall/2),y=horiz?(side==='north'?-1:1)*(innerW/2+h.wall/2):(a+b)/2;
     solids.push(place(box(horiz?b-a:h.wall,horiz?h.wall:b-a,h.height+.05,x+bx,y+by,t-.05),i));
    }
   }
  }
  for(const s of strapCuts(i))cuts.push(place(slot(s.l,s.w,Math.min(s.l,s.w)/2,s.x,s.y),i));
 }
 let result=own(M.union(solids));if(cuts.length)result=own(result.subtract(own(M.union(cuts))));
 // Remove sub-micron slivers at rounded concave shoulders before Float32 STL conversion.
 if(raw.length>4)result=own(result.simplify(.001));
 if(result.status()!=='NoError')throw new Error(`Solid generation failed: ${result.status()}`);
 const volume=result.volume();if(!Number.isFinite(volume)||volume<=0)throw new Error('The design has no printable volume.');
 const parts=result.decompose();parts.forEach(own);const mesh=result.getMesh();const positions=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let k=0;k<positions.length/3;k++)for(let j=0;j<3;j++)positions[k*3+j]=mesh.vertProperties[k*mesh.numProp+j]*(j===1?-1:1);
 // Layout uses screen coordinates (+Y down). Printer/Three space is right-handed (+Z up).
 // Reflect Y and reverse triangle winding together so the top face remains outward.
 let indices:Uint32Array=new Uint32Array(mesh.triVerts);for(let k=0;k<indices.length;k+=3){const b=indices[k+1];indices[k+1]=indices[k+2];indices[k+2]=b;}
 indices=removeCollapsedTriangles(positions,indices);
 const meshBounds=result.boundingBox();const output={positions,indices,volume,triangles:indices.length/3,pieces:parts.length,bounds:{min:[meshBounds.min[0],-meshBounds.max[1],meshBounds.min[2]],max:[meshBounds.max[0],-meshBounds.min[1],meshBounds.max[2]]}};auditMesh(output);return output;
 }finally{for(let i=owned.length-1;i>=0;i--)owned[i].delete();}
}
export function binarySTL(m:MeshResult):ArrayBuffer{auditMesh(m);const b=new ArrayBuffer(84+m.indices.length/3*50),v=new DataView(b);const header=new TextEncoder().encode('Trayworks | millimetres | printable geometry only');new Uint8Array(b,0,header.length).set(header);v.setUint32(80,m.indices.length/3,true);
 for(let j=0;j<m.indices.length;j+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[j+k]*3,m.indices[j+k]*3+3)]);const u=p[1].map((x,k)=>x-p[0][k]),w=p[2].map((x,k)=>x-p[0][k]);let normal=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];const len=Math.hypot(...normal);normal=normal.map(x=>len?x/len:0);const off=84+j/3*50;[...normal,...p.flat()].forEach((x,k)=>v.setFloat32(off+k*4,x,true));v.setUint16(off+48,0,true);}
 return b;}

/** Check the exact Float32 coordinates that STL will carry, rather than only the CSG topology. */
export function auditMesh(m:MeshResult):void{
 const keys=Array.from({length:m.positions.length/3},(_,i)=>`${m.positions[i*3]},${m.positions[i*3+1]},${m.positions[i*3+2]}`);
 const vertices=new Map<string,number>();const ids=keys.map(k=>{let id=vertices.get(k);if(id===undefined){id=vertices.size;vertices.set(k,id);}return id;});
 const edges=new Map<string,{count:number;direction:number}>();
 for(let t=0;t<m.indices.length;t+=3){const a=ids[m.indices[t]],b=ids[m.indices[t+1]],c=ids[m.indices[t+2]];if(a===b||b===c||a===c)throw new Error('STL contains a collapsed triangle. Adjust nearby openings or wall dimensions.');for(const [x,y] of [[a,b],[b,c],[c,a]]){const key=x<y?`${x}:${y}`:`${y}:${x}`;const e=edges.get(key)??{count:0,direction:0};e.count++;e.direction+=x<y?1:-1;edges.set(key,e);}}
 if([...edges.values()].some(e=>e.count!==2||e.direction!==0))throw new Error('The STL surface is not watertight. Adjust touching or nearly coincident walls and openings.');
}

/** Drop only faces whose vertices become identical in the actual STL coordinates.
 * The full watertight/orientation audit still runs afterwards; holes are never hidden.
 */
export function removeCollapsedTriangles(positions:Float32Array,indices:Uint32Array):Uint32Array{
 const same=(a:number,b:number)=>positions[a*3]===positions[b*3]&&positions[a*3+1]===positions[b*3+1]&&positions[a*3+2]===positions[b*3+2];
 const kept:number[]=[];for(let k=0;k<indices.length;k+=3){const a=indices[k],b=indices[k+1],c=indices[k+2];if(!same(a,b)&&!same(b,c)&&!same(c,a))kept.push(a,b,c);}return new Uint32Array(kept);
}
