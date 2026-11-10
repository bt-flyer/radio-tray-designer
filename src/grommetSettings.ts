import type {Design,Item} from './model';
export interface GrommetSettings{enabled:boolean;useGlobal?:boolean;wall:number;clearance:number;flange:number;retention:number;lipHeight:number;topLipHeight?:number;bottomLipHeight?:number;gripHeight?:number;axialClearance:number;flap?:{enabled:boolean;thickness:number;slit:number;pitch:number}}
export function grommetDefaults():GrommetSettings{return {enabled:false,wall:1.2,clearance:.2,flange:2.3,retention:.8,lipHeight:1,axialClearance:.2};}

export function flapDefaults(){return {enabled:false,thickness:.6,slit:.4,pitch:10};}

export function effectiveGrommetSettings(d:Design,i:Item):GrommetSettings{
 const inherited=d.grommetSettings&&i.grommet?.useGlobal!==false;
 return {...grommetDefaults(),...(inherited?d.grommetSettings:i.grommet),enabled:i.grommet?.enabled??false};
}
function comparable(s:GrommetSettings){return JSON.stringify({wall:s.wall,clearance:s.clearance,flange:s.flange,retention:s.retention,top:s.topLipHeight??s.lipHeight,bottom:s.bottomLipHeight??s.lipHeight,grip:s.gripHeight??null,allowance:s.axialClearance,flap:{...flapDefaults(),...s.flap}});}
/** Adopt global settings once, preserving any distinct existing custom gasket as an override. */
export function initializeGrommetSettings(d:Design):Design{
 if(d.grommetSettings)return d;
 const slots=d.items.filter(i=>i.kind==='slot'),groups=new Map<string,{count:number;settings:GrommetSettings}>();
 for(const i of slots){const settings={...grommetDefaults(),...i.grommet},key=comparable(settings),group=groups.get(key);if(group)group.count++;else groups.set(key,{count:1,settings});}
 const seed=[...groups.values()].sort((a,b)=>b.count-a.count)[0]?.settings??grommetDefaults();
 return {...d,grommetSettings:{...seed,enabled:false,useGlobal:undefined},items:d.items.map(i=>i.kind==='slot'?{...i,grommet:{...grommetDefaults(),...i.grommet,useGlobal:comparable({...grommetDefaults(),...i.grommet})===comparable(seed)}}:i)};
}
export function withGrommetOverride(d:Design,id:string,override:boolean):Design{return {...d,items:d.items.map(i=>i.id===id?{...i,grommet:override?{...effectiveGrommetSettings(d,i),useGlobal:false}:{...grommetDefaults(),...i.grommet,useGlobal:true}}:i)};}
