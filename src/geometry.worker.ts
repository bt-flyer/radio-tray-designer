import {generateGrommets} from './grommets';
import Module from 'manifold-3d';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import {generateGeometry} from './geometry';
import {designSchema} from './model';
const ready=Module({locateFile:()=>wasmUrl}).then(m=>{m.setup();return m;});
self.onmessage=async(e)=>{const {id,design,mode}=e.data;try{const api=await ready;const mesh=(mode==='grommets'?generateGrommets:generateGeometry)(api,designSchema.parse(design));self.postMessage({id,mesh}, {transfer:[mesh.positions.buffer,mesh.indices.buffer]});}catch(err){self.postMessage({id,error:err instanceof Error?err.message:String(err)});}};
