import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {uatTankModel} from '../src/uatModel';
test('UAT tank and two straps sit on the inclined STL seat as reference-only objects',()=>{
 const g=uatTankModel();assert.equal(g.userData.referenceOnly,true);assert.equal(g.children.filter(c=>c.name==='Estimated UAT retaining strap').length,2);
 assert.ok(Math.abs(g.rotation.y-Math.PI/6)<1e-9);g.updateMatrixWorld(true);
 const bottom=g.localToWorld(new THREE.Vector3(0,0,.3));assert.ok(Math.abs(.5*bottom.x+Math.sqrt(3)/2*bottom.z-8.68)<.4);
 const bounds=new THREE.Box3().setFromObject(g);assert.ok(bounds.max.z>50);assert.ok(bounds.min.z>0);
 g.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){for(const n of o.geometry.getAttribute('position').array)assert.ok(Number.isFinite(n));o.geometry.dispose();}});
});
