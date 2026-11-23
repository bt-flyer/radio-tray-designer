import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {tOneTemplate} from '../src/templates';
import snapshot from '../src/templates/t-one.tray.json';
import {validateDesign} from '../src/model';
import {generateGeometry,auditMesh} from '../src/geometry';
test('T-One template preserves the supplied aircraft layout and opens independent copies',()=>{
 const a=tOneTemplate(),b=tOneTemplate();assert.notEqual(a.id,b.id);assert.equal(a.name,'T-One Final-withall');assert.equal(a.items.length,25);assert.equal(a.items.filter(i=>i.kind==='slot').length,9);assert.deepEqual([a.tray.length,a.tray.wide,a.tray.narrow],[308,175,165]);
 const rb=a.items.find(i=>i.component?.id==='rb35s')!;assert.deepEqual([rb.x,rb.y,rb.rotation].map(v=>Math.round(v*1000)/1000),[127.4,87.5,0]);const tone=a.items.find(i=>i.component?.id==='tone')!;assert.equal(tone.rotation,180);assert.equal(tone.component!.body.l,52.5);assert.deepEqual(tone.component!.holes,[{x:30,y:-18.75,d:1.5},{x:-30,y:18.75,d:1.5}]);assert.deepEqual(a.tray.extensions?.rear,{enabled:true,width:50,depth:12,radius:5});assert.deepEqual(a.tray.extensions?.front,{enabled:true,width:75,depth:8,radius:5});assert.equal(a.items.filter(i=>i.grommet?.enabled).length,9);assert.equal(a.screwFeet?.enabled,true);
 const normalize=(d:ReturnType<typeof tOneTemplate>|typeof snapshot)=>({...d,id:'template',updatedAt:'snapshot',items:d.items.map(i=>({...i,id:'object'}))});assert.deepEqual(normalize(a),normalize(snapshot));assert.equal(a.tray.thickness,3.5);assert.deepEqual(a.items.filter(i=>i.kind==='hole').map(i=>[i.x,i.y,i.diameter]),[[3.3,36.5,3],[3.3,138.5,3],[306.3,36.5,3],[306.3,138.5,3]]);assert.ok(a.items.some(i=>i.component?.id==='kp600'));assert.ok(a.items.some(i=>i.component?.id==='nfc'));assert.ok(a.items.some(i=>i.component?.id==='servo3'));
 assert.ok(a.items.every(i=>!b.items.some(j=>j.id===i.id)));rb.component!.body.l=500;assert.equal(tOneTemplate().items.find(i=>i.component?.id==='rb35s')!.component!.body.l,100);
 assert.equal(validateDesign(b).filter(i=>i.level==='error').length,0);
});
test('T-One built-in layout generates a connected printable solid',async()=>{
 const m=await Module();m.setup();const mesh=generateGeometry(m,tOneTemplate());assert.ok(mesh.volume>0);assert.equal(mesh.pieces,1);assert.ok(mesh.triangles>100);auditMesh(mesh);const d=tOneTemplate(),thickness=d.tray.thickness;assert.ok(d.items.filter(i=>i.kind==='hole').every(i=>i.boss?.enabled&&i.boss.diameter===15));for(const i of d.items)if(i.boss)i.boss.enabled=false;const plain=generateGeometry(m,d);assert.ok(mesh.volume>plain.volume,'bosses add material');d.items=d.items.filter(i=>i.kind!=='hole');const without=generateGeometry(m,d),expected=4*32*1.5**2*Math.sin(2*Math.PI/64)*thickness;assert.ok(without.volume-plain.volume>=expected-.001);
});
