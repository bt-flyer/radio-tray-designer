import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {tOneTemplate} from '../src/templates';
import snapshot from '../src/templates/t-one.tray.json';
import {validateDesign} from '../src/model';
import {generateGeometry,auditMesh} from '../src/geometry';
test('T-One template preserves the supplied aircraft layout and opens independent copies',()=>{
 const a=tOneTemplate(),b=tOneTemplate();assert.notEqual(a.id,b.id);assert.equal(a.name,'T-One Final');assert.equal(a.items.length,20);assert.equal(a.items.filter(i=>i.kind==='slot').length,4);assert.deepEqual([a.tray.length,a.tray.wide,a.tray.narrow],[313,175,165]);
 const rb=a.items.find(i=>i.component?.id==='rb35s')!;assert.deepEqual([rb.x,rb.y,rb.rotation],[136.69,87.72499999999998,0]);const tone=a.items.find(i=>i.component?.id==='tone')!;assert.equal(tone.rotation,180);assert.equal(tone.component!.body.l,52.5);assert.deepEqual(tone.component!.holes,[{x:30,y:-18.75,d:1.5},{x:-30,y:18.75,d:1.5}]);assert.deepEqual(a.tray.extensions?.rear,{enabled:true,width:60,depth:19,radius:5});
 const normalize=(d:ReturnType<typeof tOneTemplate>|typeof snapshot)=>({...d,id:'template',updatedAt:'snapshot',items:d.items.map(i=>({...i,id:'object'}))});assert.deepEqual(normalize(a),normalize(snapshot));assert.equal(a.tray.thickness,3.5);assert.deepEqual(a.items.filter(i=>i.kind==='hole').map(i=>[i.x,i.y,i.diameter]),[[4.3,36.5,3],[4.3,138.5,3],[307.3,36.5,3],[307.3,138.5,3]]);assert.ok(a.items.some(i=>i.component?.id==='kp600'));assert.ok(a.items.some(i=>i.component?.id==='nfc'));assert.ok(a.items.some(i=>i.component?.id==='servo3'));
 assert.ok(a.items.every(i=>!b.items.some(j=>j.id===i.id)));rb.component!.body.l=500;assert.equal(tOneTemplate().items.find(i=>i.component?.id==='rb35s')!.component!.body.l,100);
 assert.equal(validateDesign(b).filter(i=>i.level==='error').length,0);
});
test('T-One built-in layout generates a connected printable solid',async()=>{
 const m=await Module();m.setup();const mesh=generateGeometry(m,tOneTemplate());assert.ok(mesh.volume>0);assert.equal(mesh.pieces,1);assert.ok(mesh.triangles>100);auditMesh(mesh);const d=tOneTemplate(),thickness=d.tray.thickness;d.items=d.items.filter(i=>i.kind!=='hole');const without=generateGeometry(m,d),expected=4*32*1.5**2*Math.sin(2*Math.PI/64)*thickness;assert.ok(Math.abs(without.volume-mesh.volume-expected)<.001);
});
