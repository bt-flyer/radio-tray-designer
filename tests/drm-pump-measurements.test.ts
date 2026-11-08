import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {catalog} from '../src/catalog';
import {newDesign,makeItem,clone,transform,designSchema,printedHoleDiameter} from '../src/model';
import {integrateMeasurements} from '../src/measured';
import {generateGeometry,binarySTL} from '../src/geometry';
const api=await Module();api.setup();
test('November 8 DRM and pump offsets agree with their case edges and rotate correctly',()=>{
 const drm=catalog.find(c=>c.id==='drm')!,pump=catalog.find(c=>c.id==='kp600')!;
 assert.equal(drm.body.w!/2+drm.holes[1].y,10);assert.equal(drm.body.w!/2-drm.holes[0].y,10);assert.equal(drm.holes[1].x-drm.holes[0].x,58);
 assert.equal(pump.holes[0].x+pump.body.l!/2,15);assert.equal(pump.body.l!/2-pump.holes[0].x,33.5);assert.equal(pump.holes[1].y-pump.holes[0].y,32);
 for(const c of [drm,pump])for(const rotation of [0,90,180,37]){const d=newDesign(),i=makeItem('component',[150,85],c);i.rotation=rotation;d.items=[i];const h=i.component!.holes.map(h=>transform([h.x,h.y],i)),expected=c.id==='drm'?Math.hypot(58,13.5):32;assert.ok(Math.abs(Math.hypot(h[0][0]-h[1][0],h[0][1]-h[1][1])-expected)<1e-8);assert.equal(printedHoleDiameter(d,c.holes[0].d),1.5);const m=generateGeometry(api,d);assert.equal(m.pieces,1);binarySTL(m);assert.deepEqual(generateGeometry(api,designSchema.parse(JSON.parse(JSON.stringify(d)))),m);}
});
test('old snapshots upgrade once without moving placements or losing later manual measurements',()=>{
 for(const id of ['drm','kp600']){const d=newDesign(),i=makeItem('component',[38,92],catalog.find(c=>c.id===id)!);i.rotation=180;const c=i.component!;delete c.drmPumpMeasurementRevision;c.body=id==='drm'?{l:58,w:38.4,h:17.1}:{l:65,w:32,h:36};c.holes=id==='drm'?[{x:-32,y:0,d:3},{x:32,y:0,d:3}]:[{x:-22.5,y:-24,d:3},{x:-22.5,y:24,d:3}];d.items=[i];integrateMeasurements(d);assert.deepEqual(i.component!.holes,catalog.find(c=>c.id===id)!.holes);assert.deepEqual([i.x,i.y,i.rotation],[38,92,180]);if(id==='kp600')assert.equal(i.holder.enabled,false);i.component!.holes[0].x=123;i.component!.body.l=99;const before=clone(d);integrateMeasurements(d);assert.deepEqual(d,before);}
});
