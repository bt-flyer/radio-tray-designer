import {test} from 'node:test';import assert from 'node:assert/strict';
import Module from 'manifold-3d';
import {generateGrommets,grommetDimensions} from '../src/grommets';
import {auditMesh} from '../src/geometry';
import {newDesign,makeItem,designSchema} from '../src/model';
import {grommetDefaults} from '../src/grommetSettings';
import {tOneTemplate} from '../src/templates';
const api=await Module();api.setup();
function design(top:boolean){const d=newDesign();d.tray.thickness=3.5;const i=makeItem('slot',[100,80]);i.grommet={...grommetDefaults(),enabled:true,...(top?{}:{topLipHeight:0})};d.items=[i];return {d,i};}

test('a lipless sleeve stands 0.5 mm proud of the opening rim; lipped gaskets keep their snug grip',()=>{const lipless=design(false),q=grommetDimensions(lipless.d,lipless.i);assert.equal(q.hasTopLip,false);assert.ok(Math.abs(q.grip-(3.5+1.5+.5))<1e-9);const m=generateGrommets(api,lipless.d);auditMesh(m);assert.ok(Math.abs(m.bounds.max[2]-(1+3.5+1.5+.5))<1e-6,'bottom lip + tray + rim + 0.5 proud');
 const lipped=design(true);assert.ok(Math.abs(grommetDimensions(lipped.d,lipped.i).grip-5.2)<1e-9);});

test('proud height is adjustable, saved, and ignored when a manual grip is set',()=>{const {d,i}=design(false);i.grommet!.proud=1;assert.ok(Math.abs(grommetDimensions(d,i).grip-6)<1e-9);assert.deepEqual(designSchema.parse(JSON.parse(JSON.stringify(d))),d);i.grommet!.gripHeight=4;assert.equal(grommetDimensions(d,i).grip,4);});

test('T-One default gaskets are lipless on top and stand 0.5 mm proud',()=>{const d=tOneTemplate();const slots=d.items.filter(i=>i.grommet?.enabled);assert.equal(slots.length,4);for(const i of slots){const q=grommetDimensions(d,i);assert.equal(q.hasTopLip,false);assert.equal(q.hasBottomLip,true);assert.ok(Math.abs(q.grip-(d.tray.thickness+1.5+.5))<1e-9);}auditMesh(generateGrommets(api,d));});
