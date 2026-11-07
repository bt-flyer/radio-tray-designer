import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import fontData from 'three/examples/fonts/helvetiker_regular.typeface.json';
const font=new FontLoader().parse(fontData);
export interface LabelText{value:string;size:number;height:number}
type Point=[number,number];
export const labelDefaults=():LabelText=>({value:'LABEL',size:5,height:.6});
export function unsupportedLabelCharacters(text:string){return [...new Set([...text].filter(c=>!Object.hasOwn(fontData.glyphs,c)))];}
const cache=new Map<string,{contours:Point[][];width:number;height:number}>();
/** Contours are shared by SVG and CSG, so preview, dimensions and STL agree. */
export function labelOutline(text:LabelText=labelDefaults()){
 const key=JSON.stringify([text.value,text.size]);const cached=cache.get(key);if(cached)return cached;
 const shapes=font.generateShapes(text.value,1),contours=shapes.flatMap(s=>{const p=s.extractPoints(8);return [p.shape,...p.holes];}).filter(p=>p.length>=3);
 const points=contours.flat();if(!points.length)return {contours:[] as Point[][],width:Math.max(1,text.size),height:text.size};
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y)),scale=text.size/(maxY-minY||1),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 const result={contours:contours.map(p=>p.map(v=>[(v.x-cx)*scale,-(v.y-cy)*scale] as Point)),width:(maxX-minX)*scale,height:text.size};
 if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(key,result);return result;
}
export function labelPath(text?:LabelText){return labelOutline(text).contours.map(p=>'M '+p.map(v=>v.join(',')).join(' L ')+' Z').join(' ');}
