import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGrommets,grommetDimensions,grommetErrors} from '../src/grommets';
import {auditMesh} from '../src/geometry';
import {newDesign,makeItem,designSchema} from '../src/model';
import {grommetDefaults} from '../src/grommetSettings';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
function design(top:boolean){const d=newDesign();d.tray.thickness=3.5;const i=makeItem('slot',[100,80]);i.grommet={...grommetDefaults(),enabled:true,bottomLipHeight:1,...(top?{}:{topLipHeight:0})};d.items=[i];return {d,i};}

test('a lipless sleeve stands 0.5 mm proud of the opening rim; lipped gaskets keep their snug grip',()=>{const lipless=design(false),q=grommetDimensions(lipless.d,lipless.i);assert.equal(q.hasTopLip,false);assert.ok(Math.abs(q.grip-(3.5+1.5+.5))<1e-9);const m=generateGrommets(api,lipless.d);auditMesh(m);assert.ok(Math.abs(m.bounds.max[2]-(1+3.5+1.5+.5))<1e-6,'bottom lip + tray + rim + 0.5 proud');
 const lipped=design(true);assert.ok(Math.abs(grommetDimensions(lipped.d,lipped.i).grip-5.2)<1e-9);});

test('proud height is adjustable, saved, and ignored when a manual grip is set',()=>{const {d,i}=design(false);i.grommet!.proud=1;assert.ok(Math.abs(grommetDimensions(d,i).grip-6)<1e-9);assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);i.grommet!.gripHeight=4;assert.equal(grommetDimensions(d,i).grip,4);});

function covers(m:ReturnType<typeof generateGrommets>,x:number,y:number,z:number){y=-y;for(let i=0;i<m.indices.length;i+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[i+k]*3,m.indices[i+k]*3+3)]);if(p.some(v=>Math.abs(v[2]-z)>1e-4))continue;const cross=(a:number[],b:number[],c:number[])=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const c=p.map((v,k)=>cross(v,p[(k+1)%3],[x,y]));if(c.every(v=>v>=-1e-6)||c.every(v=>v<=1e-6))return true;}return false;}

test('T-One default gaskets have a top lip only, printed lip-down on the bed',()=>{const d=tOneTemplate();const slots=d.items.filter(i=>i.grommet?.enabled);assert.equal(slots.length,9);for(const i of slots){const q=grommetDimensions(d,i);assert.equal(q.hasTopLip,true);assert.equal(q.flap.enabled,true);assert.equal(q.hasBottomLip,false);assert.equal(q.topOnBed,true);assert.ok(Math.abs(q.grip-(d.tray.thickness+1.5+.2))<1e-9);}auditMesh(generateGrommets(api,d));});

test('a top-lip-only gasket is flipped: lip footprint on the bed, plain sleeve end on top, flap stays on the bed',()=>{const d=newDesign();d.tray.thickness=3.5;const i=makeItem('slot',[100,80]);i.grommet={...grommetDefaults(),enabled:true,bottomLipHeight:0};d.items=[i];const q=grommetDimensions(d,i);const m=generateGrommets(api,d);auditMesh(m);assert.equal(m.pieces,1);assert.ok(Math.abs(m.bounds.max[2]-q.height)<1e-6);
 const b=m.bounds,cx=(b.min[0]+b.max[0])/2,cy=-(b.min[1]+b.max[1])/2,lipOnly=q.l/2+q.settings.flange/2;assert.equal(covers(m,cx+lipOnly,cy,0),true,'lip overhang prints on the bed');assert.equal(covers(m,cx+lipOnly,cy,q.height),false,'no lip at the top');assert.equal(covers(m,cx+q.l/2-q.settings.wall/2,cy,q.height),true,'sleeve wall at the top');
 i.grommet.flap={enabled:true,thickness:.6,slit:.4,pitch:10};const f=generateGrommets(api,d);auditMesh(f);assert.equal(covers(f,cx+q.boreL/2-.3,cy,0),true,'flap membrane on the bed');i.grommet.flap.thickness=1.5;assert.ok(grommetErrors(d).some(e=>e.includes('top lip thickness')));});
