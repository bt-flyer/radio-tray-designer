import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {componentModel} from '../src/componentModels';
import {catalog} from '../src/catalog';

test('all procedural references use finite geometry without mutating saved measurements',()=>{
 for(const c of catalog.filter(c=>c.category!=='uat')){
  const before=JSON.stringify(c),g=componentModel(c);assert.equal(g.userData.referenceOnly,true);
  const body=g.children[0] as THREE.Mesh;body.geometry.computeBoundingBox();const size=body.geometry.boundingBox!.getSize(new THREE.Vector3());
  for(const [actual,expected] of [[size.x,c.body.l],[size.y,c.body.w],[size.z,c.body.h]] as [number,number|null][])if(expected!==null)assert.ok(Math.abs(actual-expected)<.001,c.name);
  g.traverse(o=>{if(o instanceof THREE.Mesh){const p=o.geometry.getAttribute('position');for(const n of p.array)assert.ok(Number.isFinite(n),c.name);o.geometry.dispose();}});
  assert.equal(JSON.stringify(c),before);
 }
});
test('asymmetric reference mounting tabs match reflected layout coordinates',()=>{
 const c=catalog.find(c=>c.id==='tone')!,g=componentModel(c);
 for(const t of c.tabs!)assert.ok(g.children.some(o=>o.position.x===t.x&&o.position.y===-t.y));
});
