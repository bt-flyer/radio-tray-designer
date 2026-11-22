import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {catalog} from '../src/catalog';
import {newDesign,makeItem,footLocators,validateDesign,designSchema,transform,clone} from '../src/model';
import {generateGeometry,auditMesh} from '../src/geometry';
import {integrateMeasurements} from '../src/measured';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
const kp=catalog.find(c=>c.id==='kp600')!;
function topAt(m:ReturnType<typeof generateGeometry>,x:number,y:number,z:number){y=-y;for(let i=0;i<m.indices.length;i+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[i+k]*3,m.indices[i+k]*3+3)]);if(p.some(v=>Math.abs(v[2]-z)>1e-4))continue;const cross=(a:number[],b:number[],c:number[])=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const c=p.map((v,k)=>cross(v,p[(k+1)%3],[x,y]));if(c.every(v=>v>=-1e-6)||c.every(v=>v<=1e-6))return true;}return false;}

test('KP-600 C locators match the confirmed drawing',()=>{assert.deepEqual(kp.footLocator,{enabled:true,width:10,reach:3});const i=makeItem('component',[0,0],kp);const f=footLocators(i);assert.equal(f.length,2);
 const lower=f.find(v=>v.hole[1]>0)!,xs=lower.outline.map(p=>p[0]),ys=lower.outline.map(p=>p[1]);assert.ok(Math.abs(Math.max(...xs)-Math.min(...xs)-14.6)<1e-9,'14.6 outside');assert.ok(Math.abs(Math.min(...ys)-13.5)<1e-9,'arms start at case side');assert.ok(Math.abs(Math.max(...ys)-21.3)<1e-9,'outer end 3 + 0.3 + 2 past hole');
 const upper=f.find(v=>v.hole[1]<0)!;assert.ok(Math.abs(Math.min(...upper.outline.map(p=>p[1]))+21.3)<1e-9);assert.deepEqual(kp.tabs,[{x:-9.25,y:-16.25,l:10,w:5.5},{x:-9.25,y:16.25,l:10,w:5.5}]);});

test('C locators print as walls open towards the case, rotate with the pump, and keep the hole clear',()=>{for(const rotation of [0,90,37]){const d=newDesign(),i=makeItem('component',[150,90],kp);i.rotation=rotation;d.items=[i];assert.equal(validateDesign(d).filter(e=>e.level==='error').length,0);const m=generateGeometry(api,d);auditMesh(m);assert.equal(m.pieces,1);const z=d.tray.thickness+i.holder.height;
 const at=(x:number,y:number)=>topAt(m,...transform([x,y],i),z);assert.equal(at(-9.25,20.3),true,'outer end wall');assert.equal(at(-9.25-6.3,17),true,'arm');assert.equal(at(-9.25+6.3,17),true,'arm');assert.equal(at(-9.25,17),false,'foot pocket open');assert.equal(at(-9.25,14),false,'open towards case');assert.equal(at(-9.25,-20.3),true,'mirrored foot');assert.equal(topAt(m,...transform([-9.25,16],i),d.tray.thickness),false,'pilot hole kept');}});

test('locators can be disabled or resized and saved',()=>{const d=newDesign(),i=makeItem('component',[150,90],kp);d.items=[i];const on=generateGeometry(api,d).volume;i.component!.footLocator!.enabled=false;assert.ok(generateGeometry(api,d).volume<on);i.component!.footLocator={enabled:true,width:12,reach:4.5};assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);i.component!.footLocator.reach=1;assert.ok(validateDesign(d).some(e=>e.message.includes('foot edge')));});

test('existing KP-600 designs and the T-One default gain the locators once',()=>{const d=newDesign(),c=clone(kp);delete c.footLocator;delete c.footLocatorRevision;c.tabs=[{x:-9.25,y:-16,l:12,w:8},{x:-9.25,y:16,l:12,w:8}];const i=makeItem('component',[60,60],c);d.items=[i];integrateMeasurements(d);assert.deepEqual(i.component!.footLocator,{enabled:true,width:10,reach:3});i.component!.footLocator!.enabled=false;integrateMeasurements(d);assert.equal(i.component!.footLocator!.enabled,false);
 const t=tOneTemplate();assert.ok(t.items.find(i=>i.component?.id==='kp600')!.component!.footLocator?.enabled);const m=generateGeometry(api,t);auditMesh(m);assert.equal(m.pieces,1);});
