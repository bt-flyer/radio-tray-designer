import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog';
import {newDesign,makeItem,validateDesign} from '../src/model';
import {applyConfirmedHolePattern,integrateMeasurements} from '../src/measured';
import {tOneTemplate} from '../src/templates';
test('fit-confirmed presets and old saved patterns shed stale warnings without changing geometry',()=>{
 for(const id of ['rb35s','pgc','sp1']){
  const c=structuredClone(catalog.find(c=>c.id===id)!);c.holesStatus='estimated';const before=structuredClone(c),d=newDesign();d.items=[makeItem('component',[155,87.5],c)];integrateMeasurements(d);const next=d.items[0].component!;
  assert.equal(next.holesStatus,'measured');assert.deepEqual(next.holes,before.holes);assert.deepEqual(next.body,before.body);
  assert.ok(!validateDesign(d).some(i=>/provisional|connector access has not/.test(i.message)));
 }
 const template=tOneTemplate(),estimatedPump=template.items.find(i=>i.component?.id==='kp600')!;assert.ok(!validateDesign(template).some(i=>i.itemId!==estimatedPump.id&&/provisional|connector access has not/.test(i.message)));
});
test('custom edits to confirmed patterns remain provisional; missing geometry and actual conflicts still warn',()=>{
 const c=structuredClone(catalog.find(c=>c.id==='rb35s')!);c.holesStatus='estimated';c.holes[0].x+=2;assert.equal(applyConfirmedHolePattern(c).holesStatus,'estimated');
 const d=newDesign();d.items=[makeItem('component',[155,87.5],c)];assert.ok(validateDesign(d).some(i=>i.message.includes('provisional')));
 d.items[0].component!.body.h=null;assert.ok(validateDesign(d).some(i=>i.level==='error'&&i.message.includes('body')));
 const edge=newDesign(),uat=makeItem('component',[edge.tray.length-48.28505,87.5],catalog.find(c=>c.id==='uat')!);uat.rotation=180;edge.items=[uat];assert.ok(validateDesign(edge).some(i=>i.message.includes('outer tray rim')));
});
