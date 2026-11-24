import type {CrossSection,ManifoldToplevel,Manifold} from 'manifold-3d';
import {type Design,type Point,circle} from './model';
export type WireClips=NonNullable<Design['wireClips']>;
/** Snap-in TPU wire clip strips: a flat glue base with a row of C clips, cut to length at V-grooves. */
export function wireClipDefaults():WireClips{return {enabled:false,strips:[2,3,4,5,6,8].map(diameter=>({diameter,count:12})),wall:1.2,base:1.2,length:6,opening:.7,web:.4};}
export function wireClipSettings(d:Design):WireClips{return {...wireClipDefaults(),...d.wireClips};}
const gap=1.6,endMargin=1;
/** Profile dimensions for one strip. X runs along the strip, Y up from the glue face. */
export function clipStripSize(s:WireClips,diameter:number,count:number){const r=diameter/2,R=r+s.wall,pitch=2*R+gap;return {r,R,pitch,length:count*pitch-gap+2*endMargin,height:s.base+2*r+s.wall,opening:Math.max(1,diameter*s.opening)};}
export function wireClipErrors(d:Design):string[]{const s=wireClipSettings(d);if(!s.enabled)return [];const errors:string[]=[];if(!s.strips.length)errors.push('Wire clips: add at least one strip size.');if(s.web>=s.base)errors.push('Wire clips: the cut web must be thinner than the base.');const bed=d.printer.x-2*d.printer.margin;
 for(const strip of s.strips){const z=clipStripSize(s,strip.diameter,strip.count);if(z.opening>=strip.diameter)errors.push(`Wire clips Ø${strip.diameter}: the snap opening must be narrower than the wire.`);if(z.length>bed)errors.push(`Wire clips Ø${strip.diameter}: ${strip.count} positions (${z.length.toFixed(0)} mm) exceed the printer bed; use fewer positions.`);}
 if(s.length>d.printer.z)errors.push('Wire clips exceed printer height.');return errors;}
const rect=(x0:number,y0:number,x1:number,y1:number):Point[]=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
/** Strip profile: base + C rings, minus wire bores, snap openings (facing away from the base) and V cut-grooves. */
export function clipStripProfile(api:ManifoldToplevel,s:WireClips,diameter:number,count:number,own:<T extends {delete():void}>(v:T)=>T):CrossSection{const {CrossSection:C}=api,z=clipStripSize(s,diameter,count),solid:Point[][]=[rect(0,0,z.length,s.base)],holes:Point[][]=[];
 for(let k=0;k<count;k++){const cx=endMargin+z.R+k*z.pitch,cy=s.base+z.r;solid.push(circle(z.R,[cx,cy],72));holes.push(circle(z.r,[cx,cy],72),rect(cx-z.opening/2,cy,cx+z.opening/2,z.height+1));
  if(k<count-1){const gx=cx+z.R+gap/2,half=Math.min(gap/2-.15,(s.base-s.web)*.6);holes.push([[gx-half,s.base+.01],[gx,s.web],[gx+half,s.base+.01]]);}}
 return own(own(C.union(solid.map(p=>own(new C(p))))).subtract(own(C.union(holes.map(p=>own(new C(p)))))));}
/** Strips laid flat on their side, one per row, below whatever is already on the bed. */
export function wireClipLayout(d:Design,top:number){const s=wireClipSettings(d);if(!s.enabled)return [];const margin=d.printer.margin,bedY=d.printer.y-2*margin;let y=top;return s.strips.map(strip=>{const z=clipStripSize(s,strip.diameter,strip.count),at={...strip,x:margin,y:margin+y,size:z};y+=z.height+4;if(y-4>bedY)throw new Error('The wire clip strips do not fit on the printer bed with the other TPU parts. Export them separately.');return at;});}
export function wireClipSolids(api:ManifoldToplevel,d:Design,top:number,own:<T extends {delete():void}>(v:T)=>T):Manifold[]{const s=wireClipSettings(d);
 // Layout Y is screen-down; the shared mesh conversion flips Y, so build each profile mirrored to keep its glue face toward lower layout Y.
 return wireClipLayout(d,top).map(p=>own(own(own(clipStripProfile(api,s,p.diameter,p.count,own).extrude(s.length)).mirror([0,1,0])).translate([p.x,p.y+p.size.height,0])));}
