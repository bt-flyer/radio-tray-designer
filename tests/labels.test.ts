import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGeometry,binarySTL,type MeshResult} from '../src/geometry';
import {newDesign,makeItem,designSchema,validateDesign,bodySize,transform} from '../src/model';
import {labelOutline,labelPath} from '../src/labels';
import {BrowserStore} from '../src/browserStorage';
import {IDBFactory} from 'fake-indexeddb';
const api=await Module();api.setup();
function topCovers(m:MeshResult,x:number,y:number,z:number){y=-y;for(let i=0;i<m.indices.length;i+=3){const p=[0,1,2].map(k=>[...m.positions.slice(m.indices[i+k]*3,m.indices[i+k]*3+3)]);if(p.some(v=>Math.abs(v[2]-z)>1e-4))continue;const cross=(a:number[],b:number[],c:number[])=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const c=p.map((v,k)=>cross(v,p[(k+1)%3],[x,y]));if(c.every(v=>v>=-1e-6)||c.every(v=>v<=1e-6))return true;}return false;}
test('raised letters preserve enclosed holes, dimensions and rotation as a connected STL',()=>{
 const d=newDesign(),i=makeItem('label',[155,87.5]);i.text={value:'O',size:10,height:.8};i.rotation=33;d.tray.rim={enabled:false,height:1.5,wall:1.5};d.items=[i];const plain=generateGeometry(api,{...d,items:[]}),m=generateGeometry(api,d),[width,height]=bodySize(i);
 assert.equal(height,10);assert.ok(width>5);assert.equal(m.pieces,1);assert.ok(m.volume>plain.volume);assert.ok(Math.abs(m.bounds.max[2]-3.8)<.0001);assert.equal(topCovers(m,i.x,i.y,3.8),false,'counter remains open');const edge=transform([width*.45,0],i);assert.equal(topCovers(m,...edge,3.8),true);binarySTL(m);
 for(const value of ['RB35S','SMOKE / FUEL','GPS','B8i.']){i.text.value=value;assert.equal(generateGeometry(api,d).pieces,1);}
});
test('label text, position and style persist across browser save and reopen',async()=>{
 const factory=new IDBFactory(),store=new BrowserStore(factory),d=newDesign(),i=makeItem('label',[70,40]);i.text={value:'PUMP 1',size:4,height:.6};i.rotation=90;d.items=[i];await store.saveDesign(d);await store.close();const reopened=new BrowserStore(factory),copy=(await reopened.readDesign(d.id)).design;assert.deepEqual(copy,d);assert.deepEqual(generateGeometry(api,copy),generateGeometry(api,d));await reopened.close();
 assert.deepEqual(designSchema.parse({...d,items:[]}).items,[]);
});
test('labels reject unsupported or empty text and check placement and size limits',()=>{
 const d=newDesign(),i=makeItem('label',[155,87.5]);d.items=[i];i.text!.value='';assert.ok(validateDesign(d).some(x=>x.level==='error'&&x.message.includes('enter label')));i.text!.value='🚀';assert.ok(validateDesign(d).some(x=>x.message.includes('unsupported')));i.text!.value='LABEL';i.x=-10;assert.ok(validateDesign(d).some(x=>x.message.includes('beyond')));assert.equal(designSchema.safeParse({...d,items:[{...i,text:{...i.text,size:0}}]}).success,false);assert.ok(labelOutline(i.text).contours.length>0);assert.ok(labelPath(i.text).startsWith('M '));
});
