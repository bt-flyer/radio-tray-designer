import type {ManifoldToplevel,Manifold} from 'manifold-3d';
import {type Design,type Item,slotRim} from './model';
import {grommetDefaults} from './grommetSettings';
import {roundedRect,auditMesh,type MeshResult} from './geometry';
export function grommetDimensions(d:Design,i:Item){
 const s={...grommetDefaults(),...i.grommet},rim=slotRim(i),l=Math.max(i.l,i.w)-2*s.clearance,w=Math.min(i.l,i.w)-2*s.clearance;
 return {settings:s,l,w,boreL:l-2*s.wall,boreW:w-2*s.wall,outerL:l+2*s.flange,outerW:w+2*s.flange,grip:d.tray.thickness+(rim.enabled?rim.height:0)+s.axialClearance,height:d.tray.thickness+(rim.enabled?rim.height:0)+s.axialClearance+2*s.lipHeight};
}
export function grommetErrors(d:Design):string[]{const errors:string[]=[];const slots=d.items.filter(i=>i.kind==='slot'&&i.grommet?.enabled);if(!slots.length)return ['Enable a TPU grommet on at least one cable opening.'];for(const i of slots){const q=grommetDimensions(d,i);if(q.boreW<1||q.boreL<1)errors.push(`${i.label}: wall and clearance leave less than 1 mm of cable opening.`);if(q.settings.flange<q.settings.retention)errors.push(`${i.label}: top lip must be at least as wide as the retaining lip.`);const r=slotRim(i);if(r.enabled&&q.settings.flange<=r.wall+q.settings.clearance)errors.push(`${i.label}: top lip must extend beyond the cable rim (${(r.wall+q.settings.clearance).toFixed(1)} mm).`);if(q.height>d.printer.z)errors.push(`${i.label}: grommet exceeds printer height.`);}return errors;}
export function grommetLayout(d:Design){
 const errors=grommetErrors(d);if(errors.length)throw new Error(errors.join(' '));const placed:{item:Item;x:number;y:number;rotation:number}[]=[];const margin=d.printer.margin,bedX=d.printer.x-2*margin,bedY=d.printer.y-2*margin;let x=0,y=0,rowH=0;
 for(const item of d.items.filter(i=>i.kind==='slot'&&i.grommet?.enabled)){const q=grommetDimensions(d,item);let width=q.outerL,height=q.outerW,rotation=0;if(width>bedX&&height<=bedX){[width,height]=[height,width];rotation=90;}if(width>bedX||height>bedY)throw new Error(`${item.label}: grommet does not fit the usable printer bed.`);if(x+width>bedX){x=0;y+=rowH+5;rowH=0;}if(y+height>bedY)throw new Error('The grommet set exceeds the usable printer bed. Export fewer openings at a time.');placed.push({item,x:margin+x+width/2,y:margin+y+height/2,rotation});x+=width+5;rowH=Math.max(rowH,height);}
 return placed;
}
export function generateGrommets(api:ManifoldToplevel,d:Design):MeshResult{
 const placed=grommetLayout(d),owned:{delete():void}[]=[],own=<T extends {delete():void}>(v:T):T=>{owned.push(v);return v;};const {Manifold:M,CrossSection:C}=api;const pieces:Manifold[]=[];
 try{for(const p of placed){const q=grommetDimensions(d,p.item),s=q.settings;const section=(l:number,w:number)=>own(new C(roundedRect(l,w,Math.min(l,w)/2)));const bore=section(q.boreL,q.boreW);
 const ring=(l:number,w:number,height:number,z:number)=>own(own(own(section(l,w).subtract(bore)).extrude(height)).translate([0,0,z]));
 // Bottom lip prints on the bed; the continuous neck spans tray + optional rim.
 const bottom=ring(q.l+2*s.retention,q.w+2*s.retention,s.lipHeight,0),neck=ring(q.l,q.w,q.grip+.1,s.lipHeight-.05),top=ring(q.outerL,q.outerW,s.lipHeight,s.lipHeight+q.grip);
 let part=own(M.union([bottom,neck,top]));const connected=part.decompose();connected.forEach(own);if(connected.length!==1)throw new Error('Grommet is disconnected. Adjust its dimensions.');part=own(own(part.rotate([0,0,p.rotation])).translate([p.x,p.y,0]));pieces.push(part);}
 const result=own(M.union(pieces));if(result.status()!=='NoError')throw new Error(`Grommet generation failed: ${result.status()}`);const mesh=result.getMesh(),positions=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let k=0;k<positions.length/3;k++)for(let a=0;a<3;a++)positions[k*3+a]=mesh.vertProperties[k*mesh.numProp+a]*(a===1?-1:1);const indices=new Uint32Array(mesh.triVerts);for(let k=0;k<indices.length;k+=3)[indices[k+1],indices[k+2]]=[indices[k+2],indices[k+1]];const b=result.boundingBox(),out={positions,indices,volume:result.volume(),triangles:result.numTri(),pieces:pieces.length,bounds:{min:[b.min[0],-b.max[1],b.min[2]],max:[b.max[0],-b.min[1],b.max[2]]}};auditMesh(out);return out;
 }finally{for(let k=owned.length-1;k>=0;k--)owned[k].delete();}
}
