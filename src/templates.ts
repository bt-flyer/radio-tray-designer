import tOne from './templates/t-one.tray.json';
import {designSchema,uid,type Design} from './model';
/** Open a fresh copy of the approved snapshot without changing its geometry or settings. */
export function tOneTemplate():Design{
 const d=designSchema.parse(tOne);
 return {...d,id:uid(),updatedAt:new Date().toISOString(),items:d.items.map(i=>({...i,id:uid()}))};
}
