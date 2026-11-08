import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {tOneTemplate} from '../src/templates';
import snapshot from '../src/templates/t-one.tray.json';
import {validateDesign} from '../src/model';
import {generateGeometry,auditMesh} from '../src/geometry';
test('T-One template preserves the supplied aircraft layout and opens independent copies',()=>{
 const a=tOneTemplate(),b=tOneTemplate();assert.notEqual(a.id,b.id);assert.equal(a.name,'T-One radio tray');assert.equal(a.items.length,16);assert.equal(a.items.filter(i=>i.kind==='slot').length,4);assert.deepEqual([a.tray.length,a.tray.wide,a.tray.narrow],[313,175,165]);
 const rb=a.items.find(i=>i.component?.id==='rb35s')!;assert.deepEqual([rb.x,rb.y,rb.rotation],[154.3,63.82499999999999,0]);const tone=a.items.find(i=>i.component?.id==='tone')!;assert.equal(tone.rotation,180);assert.equal(tone.component!.body.l,52.5);
 const normalize=(d:ReturnType<typeof tOneTemplate>|typeof snapshot)=>({...d,id:'template',updatedAt:'snapshot',items:d.items.map(i=>({...i,id:'object'}))});assert.deepEqual(normalize(a),normalize(snapshot));assert.equal(a.tray.thickness,2.5);assert.ok(a.items.some(i=>i.component?.id==='kp600'));assert.ok(a.items.some(i=>i.component?.id==='nfc'));assert.ok(a.items.some(i=>i.component?.id==='servo3'));
 assert.ok(a.items.every(i=>!b.items.some(j=>j.id===i.id)));rb.component!.body.l=500;assert.equal(tOneTemplate().items.find(i=>i.component?.id==='rb35s')!.component!.body.l,100);
 assert.equal(validateDesign(b).filter(i=>i.level==='error').length,0);
});
test('T-One built-in layout generates a connected printable solid',async()=>{
 const m=await Module();m.setup();const mesh=generateGeometry(m,tOneTemplate());assert.ok(mesh.volume>0);assert.equal(mesh.pieces,1);assert.ok(mesh.triangles>100);auditMesh(mesh);
});
