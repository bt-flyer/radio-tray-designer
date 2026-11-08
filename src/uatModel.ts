import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Appearance only. The STL seat rises at 30°; tank dimensions are photo estimates. */
export function uatTankModel():THREE.Group{
 const assembly=new THREE.Group();assembly.name='UAT tank and retaining straps';
 assembly.userData={referenceOnly:true,appearance:'Photo estimate: 70 × 32 × 32 mm tank, two red straps; not a measured clearance envelope'};
 assembly.position.set(-16.58,-.04149,19.6);assembly.rotation.y=Math.PI/6;
 const plastic=new THREE.MeshPhysicalMaterial({color:0xbac2c7,transparent:true,opacity:.48,roughness:.3,depthWrite:false,side:THREE.DoubleSide});
 const tank=new THREE.Mesh(new RoundedBoxGeometry(70,32,32,4,4),plastic);tank.position.z=16.3;tank.name='Estimated UAT tank';assembly.add(tank);
 const seam=new THREE.LineSegments(new THREE.EdgesGeometry(tank.geometry,30),new THREE.LineBasicMaterial({color:0x89949e,transparent:true,opacity:.45}));seam.position.copy(tank.position);assembly.add(seam);
 // Filler neck on the high end of the inclined tank.
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(7,7,12,32),new THREE.MeshStandardMaterial({color:0x969da3,roughness:.4}));cap.rotation.z=Math.PI/2;cap.position.set(-40,0,16.3);cap.name='Estimated UAT filler neck';assembly.add(cap);
 function roundedPath(path:THREE.Path,w:number,h:number,r:number){const x=-w/2,y=-h/2;path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);path.closePath();}
 for(const x of [-18,18]){
  const shape=new THREE.Shape();roundedPath(shape,34.6,34.6,5);const hole=new THREE.Path();roundedPath(hole,32.6,32.6,4);shape.holes.push(hole);
  const strap=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:8,bevelEnabled:false,curveSegments:8}),new THREE.MeshStandardMaterial({color:0xa91620,roughness:.8}));strap.rotation.y=Math.PI/2;strap.position.set(x-4,0,16.3);strap.name='Estimated UAT retaining strap';assembly.add(strap);
 }
 return assembly;
}
