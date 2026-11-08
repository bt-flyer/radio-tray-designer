import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Module from 'manifold-3d';
import {catalog} from '../src/catalog';
import {newDesign,makeItem,designSchema,validateDesign,wallGaps,transform,printedHoleDiameter} from '../src/model';
import {generateGeometry,binarySTL} from '../src/geometry';
import {componentModel} from '../src/componentModels';
const api=await Module();api.setup();
const c=catalog.find(c=>c.id==='kp600')!;
test('KP-600 dimensions are backed by the supplied STL, with independently estimated holes',()=>{
 const bytes=readFileSync('public/references/kp600.stl'),bounds=[[Infinity,-Infinity],[Infinity,-Infinity],[Infinity,-Infinity]];
 for(let k=0;k<bytes.readUInt32LE(80);k++)for(let j=0;j<3;j++)for(let a=0;a<3;a++){const v=bytes.readFloatLE(84+50*k+12+12*j+4*a);bounds[a][0]=Math.min(bounds[a][0],v);bounds[a][1]=Math.max(bounds[a][1],v);}
 assert.ok(Math.abs(bounds[0][1]-bounds[0][0]-103.70879)<.001);assert.ok(Math.abs(bounds[1][1]-bounds[1][0]-32)<.001);assert.ok(Math.abs(bounds[2][0]-4)<.001);assert.ok(Math.abs(bounds[2][1]-36)<.001);
 assert.deepEqual(c.body,{l:65,w:32,h:36});assert.equal(c.holesStatus,'estimated');assert.deepEqual(c.holes,[{x:-22.5,y:-24,d:3},{x:-22.5,y:24,d:3}]);
});
test('KP-600 clamp relief and 1.5 mm pilots rotate and survive JSON saving without exporting electronics',()=>{
 for(const rotation of [0,37,180]){
 const d=newDesign(),i=makeItem('component',[150,90],c);i.rotation=rotation;d.items=[i];assert.equal(i.holder.height,2.5);
 assert.equal(printedHoleDiameter(d,3,true),1.5);assert.ok(wallGaps(i,'north').some(([a,b])=>a<=-28.5&&b>=-16.5));
 const holes=c.holes.map(h=>transform([h.x,h.y],i));assert.ok(Math.abs(Math.hypot(holes[0][0]-holes[1][0],holes[0][1]-holes[1][1])-48)<1e-8);
 assert.equal(validateDesign(d).filter(e=>e.level==='error').length,0);const mesh=generateGeometry(api,d);assert.equal(mesh.pieces,1);assert.equal(mesh.bounds.max[2],5.5);binarySTL(mesh);
 const restored=designSchema.parse(JSON.parse(JSON.stringify(d)));assert.deepEqual(generateGeometry(api,restored),mesh);
 }
 const model=componentModel(c);assert.equal(model.userData.referenceOnly,true);assert.ok(model.getObjectByName('kp600-dummy-body'));
});
