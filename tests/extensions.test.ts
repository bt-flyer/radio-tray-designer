import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {newDesign,rawOutline,roundedOutline,bounds,selfIntersect,designSchema,validateDesign,makeItem,trayExtension} from '../src/model';
import {generateGeometry,binarySTL} from '../src/geometry';
const api=await Module();api.setup();
test('centred front/rear extensions preserve exact width, depth, settings and printable connectivity',()=>{
 for(const shape of ['rectangle','trapezoid'] as const)for(const end of ['front','rear','both'] as const)for(const radius of [0,5,100]){
 const d=newDesign();d.tray.shape=shape;d.tray.radius=0;d.tray.extensions={front:{enabled:end!=='rear',width:60,depth:20,radius},rear:{enabled:end!=='front',width:80,depth:15,radius}};
 const p=rawOutline(d),r=roundedOutline(d),b=bounds(r);assert.equal(selfIntersect(p),false);assert.equal(selfIntersect(r),false);
 assert.equal(b.minX,end==='rear'?0:-20);assert.equal(b.maxX,d.tray.length+(end==='front'?0:15));
 if(end!=='rear')assert.deepEqual(p.filter(p=>p[0]===-20).map(p=>p[1]).sort((a,b)=>a-b),[57.5,117.5]);
 assert.equal(validateDesign(d).filter(i=>i.level==='error').length,0);const m=generateGeometry(api,d);assert.equal(m.pieces,1);assert.ok(m.volume>0);binarySTL(m);
 const copy=designSchema.parse(JSON.parse(JSON.stringify(d)));assert.deepEqual(copy,d);assert.deepEqual(generateGeometry(api,copy),m);
 }
});
test('extension accepts mounting holes, follows perimeter rim and participates in bed and invalid-width checks',()=>{
 const d=newDesign();d.tray.extensions={front:{enabled:true,width:60,depth:30,radius:4},rear:trayExtension(d,'rear')};d.tray.rim={enabled:true,height:1.5,wall:1.5};d.items=[makeItem('hole',[-15,87.5])];assert.equal(validateDesign(d).filter(i=>i.level==='error').length,0);const m=generateGeometry(api,d);assert.equal(m.pieces,1);assert.equal(m.bounds.max[2],4.5);binarySTL(m);assert.ok(validateDesign(d).some(i=>i.message.includes('printer bed')));
 d.tray.extensions.front.width=175;assert.ok(validateDesign(d).some(i=>i.level==='error'&&i.message.includes('extension width')));
});
test('old designs stay unchanged with disabled extensions; polygon conversion bakes the outline once',()=>{
 const d=newDesign(),before=roundedOutline(d);d.tray.extensions={front:trayExtension(d,'front'),rear:trayExtension(d,'rear')};assert.deepEqual(roundedOutline(d),before);d.tray.extensions.front.enabled=true;const p=rawOutline(d);d.tray.shape='polygon';d.tray.points=p;delete d.tray.extensions;assert.deepEqual(rawOutline(d),p);assert.equal(generateGeometry(api,d).pieces,1);
});
