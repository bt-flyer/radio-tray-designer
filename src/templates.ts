import {applyConfirmedHolePattern,applyFitSizing,applyPGCFeet,applyInstallationFit} from './measured';
import tOne from './templates/t-one.tray.json';
import {designSchema,uid,type Design} from './model';
/** A frozen published snapshot; opening it never modifies a saved user design. */
export function tOneTemplate():Design{
 const d=designSchema.parse(tOne);for(const i of d.items)applyInstallationFit(i);
 return {...d,id:uid(),updatedAt:new Date().toISOString(),items:d.items.map(i=>({...i,id:uid(),component:i.component?applyPGCFeet(applyConfirmedHolePattern(applyFitSizing(i.component))):null}))};
}
