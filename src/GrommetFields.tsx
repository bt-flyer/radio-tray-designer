import type {Design,Item} from './model';
import {grommetDimensions} from './grommets';
import {flapDefaults,withGrommetOverride,type GrommetSettings} from './grommetSettings';
import {NumberField} from './NumberField';
export function GrommetFields({design,item,change}:{design:Design;item:Item;change:(settings:GrommetSettings)=>void}){
 const q=grommetDimensions(design,item),s=q.settings,flap=q.flap;
 const update=(patch:Partial<GrommetSettings>)=>change({...s,...patch});
 const fields=[['flange','Top lip overhang / side',s.flange,.4,10],['retention','Bottom lip overhang / side',s.retention,.2,10],['topLipHeight','Top lip thickness',q.topLipHeight,.2,5],['bottomLipHeight','Bottom lip thickness',q.bottomLipHeight,.2,5],['wall','Sleeve wall thickness',s.wall,.4,10],['clearance','Fit clearance / side',s.clearance,0,2]] as const;
 return <div className="grommet-fields"><div className="field-pair">{fields.map(([key,label,value,min,max])=><NumberField key={key} label={label} value={value} min={min} max={max} onChange={v=>update({[key]:v!})}/>)}</div>
 <p className="field-help">Lip overhangs extend outward from the sleeve. Clearance reduces the sleeve to fit the tray opening; wall thickness reduces the clear cable bore.</p>
 <label className="check-row"><input type="checkbox" checked={s.gripHeight===undefined} onChange={e=>update({gripHeight:e.target.checked?undefined:q.grip})}/> Match grip height to tray and opening rim</label>
 {s.gripHeight===undefined?<NumberField label="Grip allowance" value={s.axialClearance} min={0} max={2} onChange={v=>update({axialClearance:v!})}/>:<NumberField label="Sleeve grip height" value={q.grip} min={.2} max={100} onChange={v=>update({gripHeight:v!})}/>}
 <label className="check-row"><input type="checkbox" checked={flap.enabled} onChange={e=>update({flap:{...flapDefaults(),...s.flap,enabled:e.target.checked}})}/> Add internal cut flap</label>
 {flap.enabled&&<div className="field-pair">{([['thickness','Flap thickness',.2,2],['slit','Cut width',.2,2],['pitch','Finger spacing',2,40]] as const).filter(([key])=>key!=='pitch'||Math.abs(item.l-item.w)>.001).map(([key,label,min,max])=><NumberField key={key} label={label} value={flap[key]} min={min} max={max} onChange={v=>update({flap:{...flap,[key]:v!}})}/>)}</div>}
 <p className="field-help">Top lip: {q.outerL.toFixed(1)} × {q.outerW.toFixed(1)} mm · bottom lip: {q.bottomOuterL.toFixed(1)} × {q.bottomOuterW.toFixed(1)} mm.<br/>Cable bore: {q.boreL.toFixed(1)} × {q.boreW.toFixed(1)} mm · grip: {q.grip.toFixed(1)} mm · total height: {q.height.toFixed(1)} mm.</p>
 </div>;
}

export function GrommetOpeningFields({design,item,change}:{design:Design;item:Item;change:(d:Design)=>void}){
 const inherited=!!design.grommetSettings&&item.grommet?.useGlobal!==false;
 return <>{design.grommetSettings&&<label className="check-row"><input type="checkbox" checked={!inherited} onChange={e=>change(withGrommetOverride(design,item.id,e.target.checked))}/> Override global settings for this opening</label>}<fieldset disabled={inherited} style={{border:0,padding:0,margin:0,opacity:inherited?.55:1}}><GrommetFields design={design} item={item} change={settings=>change({...design,items:design.items.map(i=>i.id===item.id?{...i,grommet:{...settings,useGlobal:false}}:i)})}/></fieldset>{inherited&&<p className="field-help">Following global gasket settings. Enable override to adjust this opening independently.</p>}</>;
}
