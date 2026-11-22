import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGeometry,auditMesh} from '../src/geometry';
import {newDesign,makeItem,validateDesign,designSchema,bossDefaults,footprint} from '../src/model';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
function simple(){const d=newDesign();d.screwHoles={mode:'measured',pilotDiameter:1.5};d.tray={...d.tray,rim:{enabled:false,height:1.5,wall:1.5},shape:'rectangle',length:100,wide:80,thickness:3,radius:0};return d;}
const errors=(d:ReturnType<typeof simple>)=>validateDesign(d).filter(i=>i.level==='error').map(i=>i.message);

test('a boss lets a mounting hole sit on or past the tray edge',()=>{const d=simple(),h=makeItem('hole',[1,40]);h.diameter=3;d.items=[h];
 assert.ok(errors(d).some(m=>m.includes('beyond the tray')),'bare hole on the edge is rejected');
 h.boss=bossDefaults(3);assert.equal(h.boss.diameter,8);assert.deepEqual(errors(d),[]);
 const base=generateGeometry(api,simple()).volume,m=generateGeometry(api,d);auditMesh(m);assert.equal(m.pieces,1);
 assert.ok(m.bounds.min[0]<=1-4+1e-3,'boss extends the outline past X = 0');assert.ok(m.volume>base-Math.PI*1.5**2*3,'boss adds material');
 h.x=-2;assert.deepEqual(errors(d),[]);assert.equal(generateGeometry(api,d).pieces,1);
 h.x=-6;assert.ok(errors(d).some(m=>m.includes('does not join')));});

test('fillet blends the boss joint and raised height adds a cylinder',()=>{const d=simple(),h=makeItem('hole',[0,40]);h.boss={...bossDefaults(3),fillet:0};d.items=[h];const sharp=generateGeometry(api,d).volume;h.boss.fillet=2;const blended=generateGeometry(api,d);assert.ok(blended.volume>sharp);
 h.boss.height=2;const raised=generateGeometry(api,d);auditMesh(raised);assert.ok(Math.abs(raised.bounds.max[2]-5)<1e-6);assert.equal(raised.pieces,1);});

test('boss is saved, sized in the footprint and validated',()=>{const d=simple(),h=makeItem('hole',[50,40]);h.boss=bossDefaults(3);d.items=[h];assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);
 const fp=footprint(h);assert.ok(Math.abs(fp[1][0]-fp[0][0]-8)<1e-9);h.boss.diameter=3;assert.ok(errors(d).some(m=>m.includes('larger than the hole')));
 h.boss.diameter=6;assert.ok(validateDesign(d).some(i=>i.message.includes('less than 2 mm of material around')));
 const s=makeItem('slot',[50,40]);s.boss=bossDefaults(3);assert.throws(()=>designSchema.parse({...d,items:[s]}));});

test('T-One edge holes can take bosses and still export one watertight piece',()=>{const d=tOneTemplate();for(const i of d.items)if(i.kind==='hole')i.boss=bossDefaults(i.diameter);const m=generateGeometry(api,d);auditMesh(m);assert.equal(m.pieces,1);});
