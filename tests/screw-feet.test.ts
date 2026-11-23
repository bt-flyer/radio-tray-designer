import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGrommets,grommetErrors,screwFeet,screwFeetLayout,grommetLayout,screwFeetDefaults} from '../src/grommets';
import {auditMesh} from '../src/geometry';
import {designSchema,newDesign,makeItem} from '../src/model';
import {catalog} from '../src/catalog';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
const kp=catalog.find(c=>c.id==='kp600')!;
function covers(m:ReturnType<typeof generateGrommets>,x:number,y:number,z:number){y=-y;for(let i=0;i<m.indices.length;i+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[i+k]*3,m.indices[i+k]*3+3)]);if(p.some(v=>Math.abs(v[2]-z)>1e-4))continue;const cross=(a:number[],b:number[],c:number[])=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const c=p.map((v,k)=>cross(v,p[(k+1)%3],[x,y]));if(c.every(v=>v>=-1e-6)||c.every(v=>v<=1e-6))return true;}return false;}

test('screw feet are off by default and exclude aircraft mounting holes',()=>{const d=newDesign();d.items=[makeItem('component',[100,80],kp),makeItem('hole',[10,10])];assert.equal(screwFeet(d).length,0);d.screwFeet={...screwFeetDefaults(),enabled:true};assert.equal(screwFeet(d).length,2);assert.deepEqual(screwFeet(d).map(f=>[f.screw,Math.round(f.bore*10)/10,f.depth]),[[3,2.4,3],[3,2.4,3]]);assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);});

test('feet-only export: closed end on the bed, threaded bore opens upward, chamfered outer edge',()=>{const d=newDesign();d.items=[makeItem('component',[100,80],kp)];d.screwFeet={...screwFeetDefaults(),enabled:true};assert.deepEqual(grommetErrors(d),[]);const m=generateGrommets(api,d);auditMesh(m);assert.equal(m.pieces,2);assert.ok(Math.abs(m.bounds.max[2]-4)<1e-6);
 const [f]=screwFeetLayout(d,grommetLayout(d));assert.equal(covers(m,f.x,f.y,0),true,'closed bottom');assert.equal(covers(m,f.x,f.y,4),false,'bore open at top');assert.equal(covers(m,f.x+3,f.y,4),true,'wall at top');assert.equal(covers(m,f.x+3.8,f.y,0),false,'bed edge chamfered');
 const r=4,bore=1.2,expected=Math.PI*(r*r*4-bore*bore*3);assert.ok(Math.abs(m.volume/2-expected)<expected*.03,'volume ≈ cylinder minus bore');});

test('T-One default exports grommets plus one foot per component screw, all on the bed',()=>{const d=tOneTemplate();d.screwFeet={...screwFeetDefaults(),enabled:true};const holes=d.items.filter(i=>i.kind==='component').reduce((n,i)=>n+i.component!.holes.filter(h=>h.d!==null).length,0);assert.equal(screwFeet(d).length,holes);assert.deepEqual(grommetErrors(d),[]);const m=generateGrommets(api,d);auditMesh(m);assert.equal(m.pieces,d.items.filter(i=>i.grommet?.enabled).length+holes);assert.ok(m.bounds.max[0]<=d.printer.x-d.printer.margin+1e-6);assert.ok(-m.bounds.min[1]<=d.printer.y-d.printer.margin+1e-6);});

test('invalid foot settings are reported before export',()=>{const d=newDesign();d.items=[makeItem('component',[100,80],kp)];d.screwFeet={...screwFeetDefaults(),enabled:true,cap:5};assert.ok(grommetErrors(d).some(e=>e.includes('closed end')));d.screwFeet={...screwFeetDefaults(),enabled:true,diameter:3};assert.ok(grommetErrors(d).some(e=>e.includes('wall')));d.screwFeet={...screwFeetDefaults(),enabled:true};d.items=[];assert.ok(grommetErrors(d).length>0);});
