import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGrommets,grommetErrors} from '../src/grommets';
import {auditMesh} from '../src/geometry';
import {newDesign,designSchema} from '../src/model';
import {wireClipDefaults,clipStripSize,wireClipLayout} from '../src/wireClips';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
function covers(m:ReturnType<typeof generateGrommets>,x:number,y:number,z:number){y=-y;for(let i=0;i<m.indices.length;i+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[i+k]*3,m.indices[i+k]*3+3)]);if(p.some(v=>Math.abs(v[2]-z)>1e-4))continue;const c=p.map((a,k)=>{const b=p[(k+1)%3];return (b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);});if(c.every(v=>v>=-1e-6)||c.every(v=>v<=1e-6))return true;}return false;}
function clipsOnly(){const d=newDesign();d.items=[];d.wireClips={...wireClipDefaults(),enabled:true};return d;}

test('six default strip sizes export on their own as watertight separate strips, saved with the design',()=>{const d=clipsOnly();assert.deepEqual(d.wireClips!.strips.map(s=>s.diameter),[2,3,4,5,6,8]);assert.deepEqual(grommetErrors(d),[]);const m=generateGrommets(api,d);auditMesh(m);assert.equal(m.pieces,6);assert.ok(Math.abs(m.bounds.max[2]-6)<1e-6,'printed on its side: height = clip length');assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);});

test('clip profile: snug bore, snap opening facing away from the glue base, and V cut-grooves leaving a thin web',()=>{const d=clipsOnly();d.wireClips!.strips=[{diameter:4,count:3}];const s=d.wireClips!,m=generateGrommets(api,d),[p]=wireClipLayout(d,0),z=clipStripSize(s,4,3),top=s.length;
 const glueY=p.y+z.height,cx=(k:number)=>p.x+1+z.R+k*z.pitch,cy=glueY-s.base-z.r;
 assert.ok(Math.abs(z.length-(3*z.pitch-1.6+2))<1e-9);assert.ok(Math.abs(z.opening-2.8)<1e-9);
 for(let k=0;k<3;k++){assert.equal(covers(m,cx(k),cy,top),false,'bore clear');assert.equal(covers(m,cx(k)+z.r+s.wall/2,cy,top),true,'ring wall');assert.equal(covers(m,cx(k),cy-z.r-s.wall/2,top),false,'snap opening away from base');assert.equal(covers(m,cx(k),glueY-s.base/2,top),true,'glue base under the clip');assert.equal(covers(m,cx(k)+z.opening/2+.3,cy-z.r-s.wall/2,top),true,'opening narrower than the wire');}
 const gx=cx(0)+z.R+.8;assert.equal(covers(m,gx,glueY-s.web/2,top),true,'web left under the groove');assert.equal(covers(m,gx,glueY-(s.web+s.base)/2-.05,top),false,'groove cut into the base');});

test('invalid clip settings are reported',()=>{const d=clipsOnly();d.wireClips!.opening=.95;d.wireClips!.strips=[{diameter:1,count:2}];assert.ok(grommetErrors(d).some(e=>e.includes('narrower than the wire')));d.wireClips={...wireClipDefaults(),enabled:true,strips:[{diameter:8,count:80}]};assert.ok(grommetErrors(d).some(e=>e.includes('exceed the printer bed')));d.wireClips={...wireClipDefaults(),enabled:true,web:1.5};assert.ok(grommetErrors(d).some(e=>e.includes('web')));});

test('T-One default: gaskets, screw feet and clip strips export together on one bed',()=>{const d=tOneTemplate();d.wireClips={...wireClipDefaults(),enabled:true};assert.deepEqual(grommetErrors(d),[]);const m=generateGrommets(api,d);auditMesh(m);assert.equal(m.pieces,9+26+6);assert.ok(-m.bounds.min[1]<=d.printer.y-d.printer.margin+1e-6);});
