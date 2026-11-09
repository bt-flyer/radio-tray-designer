import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {catalog} from '../src/catalog';
import {newDesign,makeItem,validateDesign,designSchema,transform} from '../src/model';
import {generateGeometry,binarySTL} from '../src/geometry';
import {componentModel} from '../src/componentModels';
const api=await Module();api.setup();
test('servo header has three pins at 2.54 mm pitch and an editable designed flange',()=>{
 const c=catalog.find(c=>c.id==='servo3')!,g=componentModel(c),pins=g.children.filter(o=>o.name==='Servo header pin');assert.equal(c.category,'connector');assert.equal(pins.length,3);assert.deepEqual(pins.map(p=>p.position.x),[-2.54,0,2.54]);assert.deepEqual(c.holes.map(h=>h.d),[1.5,1.5]);assert.equal(c.cutout!.printedFlange,true);assert.ok(c.cutout!.flangeL!>c.cutout!.l!+10);
});
test('rotated servo panel flange is watertight, connected and exports without metal pins',()=>{
 const d=newDesign(),c=catalog.find(c=>c.id==='servo3')!,i=makeItem('component',[155,87.5],c);i.rotation=37;d.items=[i];const m=generateGeometry(api,d);assert.equal(m.pieces,1);assert.equal(m.bounds.max[2],6);assert.equal(validateDesign(d).filter(i=>i.level==='error').length,0);binarySTL(m);
 // A vertical probe through the centre must find no top/bottom face: opening stays clear.
 const point=transform([0,0],i);for(let n=0;n<m.indices.length;n+=3){const ps=[0,1,2].map(k=>Array.from(m.positions.slice(m.indices[n+k]*3,m.indices[n+k]*3+3)));if(!ps.every(p=>Math.abs(p[2]-ps[0][2])<1e-5))continue;const cross=(a:number[],b:number[])=>(b[0]-a[0])*(-point[1]-a[1])-(b[1]-a[1])*(point[0]-a[0]);const signs=ps.map((p,k)=>cross(p,ps[(k+1)%3]));assert.ok(!(signs.every(v=>v>1e-6)||signs.every(v=>v< -1e-6)),'centre must remain open');}
 assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);
});
test('male servo connector has a tight 0.1 mm-per-side opening and upgrades without moving screws',async()=>{const {integrateMeasurements}=await import('../src/measured');const c=catalog.find(c=>c.id==='servo3')!;assert.equal(c.body.l,10.75);assert.equal(c.body.w,4);assert.equal(c.cutout!.l,10.95);assert.equal(c.cutout!.w,4.2);const d=newDesign(),i=makeItem('component',[114,154.43],c);i.rotation=37;delete i.component!.servoFitRevision;i.component!.body.l=7.62;i.component!.body.w=2.54;i.component!.cutout!.l=8.22;i.component!.cutout!.w=3.14;const holes=structuredClone(i.component!.holes);d.items=[i];integrateMeasurements(d);assert.deepEqual(i.component!.holes,holes);assert.deepEqual([i.x,i.y,i.rotation],[114,154.43,37]);assert.equal(i.component!.cutout!.l,10.95);assert.equal(i.component!.cutout!.w,4.2);i.component!.cutout!.w=4.3;integrateMeasurements(d);assert.equal(i.component!.cutout!.w,4.3);});
