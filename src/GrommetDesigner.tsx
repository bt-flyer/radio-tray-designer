import {useState} from 'react';
import type {Design} from './model';
import {grommetDimensions} from './grommets';
import {grommetDefaults} from './grommetSettings';
import {GrommetDiagram,type GasketParameter} from './GrommetDiagram';
import {GrommetFields} from './GrommetFields';
import {NumberField} from './NumberField';
export function GrommetDesigner({design,change}:{design:Design;change:(d:Design)=>void}){
 const slots=design.items.filter(i=>i.kind==='slot'),[id,setId]=useState(slots[0]?.id),[selected,setSelected]=useState<GasketParameter>('flange'),opening=slots.find(i=>i.id===id)??slots[0];if(!opening)return null;
 const settings={...grommetDefaults(),...design.grommetSettings},item={...opening,grommet:{...settings,enabled:true,useGlobal:false}},q=grommetDimensions(design,item);
 const labels:Record<GasketParameter,[string,number,number,number]>={flange:['Top lip overhang / side',settings.flange,0,10],retention:['Bottom lip overhang / side',settings.retention,0,10],topLipHeight:['Top lip thickness',q.topLipHeight,0,5],bottomLipHeight:['Bottom lip thickness',q.bottomLipHeight,0,5],wall:['Sleeve wall thickness',settings.wall,.4,10],clearance:['Fit clearance / side',settings.clearance,0,2],gripHeight:['Sleeve grip height',q.grip,.2,100]},[label,value,min,max]=labels[selected];
 const update=(next:typeof settings)=>change({...design,grommetSettings:{...next,enabled:false,useGlobal:undefined}});
 return <section className="global-gasket-designer"><h3>Global gasket design</h3><p className="field-help">Applies to all openings following global settings. Click a feature to size it, or expand all dimensions below.</p><label className="text-field"><span>Preview opening</span><select value={opening.id} onChange={e=>setId(e.target.value)}>{slots.map((i,k)=><option value={i.id} key={i.id}>Opening {k+1} · {i.l} × {i.w} mm</option>)}</select></label><GrommetDiagram design={design} item={item} selected={selected} onSelect={setSelected}/><NumberField label={label} value={value} min={min} max={max} onChange={v=>update({...settings,[selected]:v!})}/><details><summary>All global dimensions & flap controls</summary><GrommetFields design={design} item={item} change={update}/></details></section>;
}
