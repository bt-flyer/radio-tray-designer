import Module from 'manifold-3d';
import {writeFile} from 'node:fs/promises';
import {catalog} from '../src/catalog';
import {newDesign,makeItem} from '../src/model';
import {tOneTemplate} from '../src/templates';
import {generateGeometry,binarySTL} from '../src/geometry';
const api=await Module();api.setup();
for(const [id,l,w] of [['rb35s',130,90],['telemetry',60,48],['pgc',100,70],['tone',80,80]] as const){const d=newDesign();d.name=`${id} revised fit check`;d.tray={...d.tray,shape:'rectangle',length:l,wide:w,radius:3,rim:{enabled:false,height:1.5,wall:1.5}};d.items=[makeItem('component',[l/2,w/2],catalog.find(c=>c.id===id)!)];const name=id==='tone'?'light-controller-fit-test':`${id}-fit-test`,m=generateGeometry(api,d);if(m.pieces!==1)throw new Error('Detached fit test');await writeFile(`samples/${name}.stl`,new Uint8Array(binarySTL(m)));await writeFile(`samples/${name}.tray.json`,JSON.stringify(d,null,2)+'\n');console.log(name,m.pieces,m.volume);}
const d=tOneTemplate();await writeFile('samples/t-one-tray.stl',new Uint8Array(binarySTL(generateGeometry(api,d))));await writeFile('samples/t-one-tray.tray.json',JSON.stringify(d,null,2)+'\n');
