import specification from './component-measurements.json';
import type {ComponentDef,Item,Design} from './model';
const source='User specification: component-measurements.json (mm).';
function readComponentMeasurements(original:ComponentDef):ComponentDef{
 if(original.category==='connector'&&['xt30','xt60'].includes(original.id)&&!original.cutout?.l)return standardConnector(original.id);
 if(original.id==='drm'&&original.measurementRevision===1&&original.holes.some(h=>h.d===null)){const c=structuredClone(original);c.holes.forEach(h=>{h.d??=3;});c.sources.holes='Supplied drawing: X ±32 mm, Y 0; Ø3 mm confirmed by user.';c.note=c.note.replace('Ø3 mm mounting holes confirmed by user.','Ø3 mm mounting holes confirmed by user.');return c;}
 if(original.id==='rb35s'&&original.body.l===98){const c=structuredClone(original);c.body.l=99;c.bodyStatus='measured';c.sources.body='User physical fit check: case length 99 mm; width/height retained. Hole positions already fit.';c.note+=' Case length corrected to 99 mm after print fit test; hole pattern and placement preserved.';return c;}
 if(original.measurementRevision===1)return original;
 const spec=specification.components.find(s=>s.id===original.id);if(!spec)return original;
 const c=structuredClone(original);c.measurementRevision=1;
 const body='body' in spec?spec.body:undefined;
 if(body){c.body={l:body.length,w:body.width,h:body.height};c.bodyStatus='measured';c.sources.body=source+' '+body.status;}
 if(c.id==='rb35s'){c.body={l:99,w:73.4,h:18.7};c.bodyStatus='measured';c.sources.body=source+' Case length 99 mm confirmed by physical fit test; width and height retained from published dimensions.';c.tabs=[-1,1].flatMap(x=>[-1,1].map(y=>({x:x*53.1,y:y*24,l:8.2,w:10})));}
 const mount='mounting' in spec?spec.mounting:undefined;
 if(mount){const m=mount as {holeCount:number;diameter:number|null;spacingAlongLength?:number;spacingAcrossWidth?:number;horizontalCentreSeparation?:number;verticalCentreSeparation?:number};c.holes=m.holeCount===4?[-1,1].flatMap(x=>[-1,1].map(y=>({x:x*m.spacingAlongLength!/2,y:y*m.spacingAcrossWidth!/2,d:m.diameter}))):[{x:-m.horizontalCentreSeparation!/2,y:-m.verticalCentreSeparation!/2,d:m.diameter},{x:m.horizontalCentreSeparation!/2,y:m.verticalCentreSeparation!/2,d:m.diameter}];c.holesStatus='estimated';c.sources.holes=source+' '+mount.status+'; centring on case provisional.';}
 c.note=source+' '+('access' in spec?spec.access:'')+' '+('holder' in spec?spec.holder:'')+(mount?' Hole pattern centring remains provisional.':'');
 if(c.id==='rb35s')c.note+=' Four tab openings assumed 10 mm wide, editable below. Tab projection 7.7 mm inferred from overall 114.4 mm length. Check actual foot shape before printing.';
 if(c.id==='gsu')c.note+=' Standard open cradle and strap are provided; retaining lips and finger notch are not yet designed.';
 if(c.id==='drm'){c.bodyStatus='published';c.holesStatus='published';c.sources.body='/references/kingtech-g4-drm-dimensions.png';c.sources.holes='Supplied drawing: centres at X ±32 mm, Y 0; Ø3 mm confirmed by user.';c.note+=' Both mounting-ear ends are open; Ø3 mm mounting holes confirmed by user.';}
 if(c.id==='telemetry')c.note+=' Connector inclusion in measured body size is unconfirmed.';
 return c;
}
export function applyHolderMeasurements(i:Item){const id=i.component?.id;if(i.component?.measurementRevision!==1)return;
 if(['telemetry','gps','airspeed','tone'].includes(id??'')){applySurroundingRibs(i);return;}
 if(id==='tone'){i.holder.enabled=false;return;}
 if(['telemetry','gps','airspeed','gsu'].includes(id??'')){i.holder.sides.east.enabled=false;}
 if(id==='airspeed')i.holder.sides.west.enabled=false;
 if(id==='gsu'){i.holder.strap.enabled=true;i.holder.strap.axis='y';i.holder.sides.east.keepout=15;}
 if(id==='sp1'){i.holder.sides.east.enabled=false;i.holder.sides.east.keepout=15;}
 if(id==='drm'){i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
 if(id==='pgc'){i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
}
export function integrateMeasurements(d:Design):Design{d.screwHoles??={mode:'components',pilotDiameter:1.5};for(const i of d.items){if(i.component&&((['sp1','tone'].includes(i.component.id)&&!i.component.physicalFitRevision)||(i.component.id==='sp1'&&i.component.mountBossDiameter===null)||(i.component.id==='tone'&&(!i.component.lightMountRevision||i.component.body.l===52.35))||!i.component.measurementRevision||(i.component.id==='drm'&&i.component.holes.some(h=>h.d===null))||(i.component.id==='rb35s'&&i.component.body.l===98))){const next=applyComponentMeasurements(i.component);if(next.measurementRevision||next.connectorRevision){i.component=next;applyHolderMeasurements(i);}}if(i.component)i.component=applyConfirmedHolePattern(i.component);applySurroundingRibs(i);applyRailHeight(i);}return d;}

export function standardConnector(id:string):ComponentDef{const small=id==='xt30',l=small?10.2:15.5,w=small?5.2:8.1,h=small?12.4:20.2,openingL=l+.6,openingW=w+.6;return {id,name:small?'XT30 standard connector':'XT60 standard connector',variant:small?'Standard AMASS XT30U-F body + printed flange':'Standard AMASS XT60-F body + printed flange',category:'connector',body:{l,w,h},bodyStatus:'published',holesStatus:'designed',clearanceStatus:'designed',confirmed:true,connectorRevision:1,sources:{body:small?'https://www.micros.com.pl/mediaserver/Z_XT30U-F_AMASS_0001.pdf':'https://www.bto.pl/pdf/08031/XT60-F.pdf',holes:'Designed printed flange: two Ø3.2 mm holes, 4 mm beyond opening ends.',clearance:'Designed 0.3 mm clearance per side.'},holes:[{x:-openingL/2-4,y:0,d:3.2},{x:openingL/2+4,y:0,d:3.2}],cutout:{l:openingL,w:openingW,r:.5,flangeL:openingL+16,flangeW:openingW+8,printedFlange:true,flangeThickness:3},note:'Printed adapter for a standard female connector body. Rounded rectangular clearance opening, 0.3 mm per side; 3 mm raised flange with two M3 clearance holes. Secure the connector in the adapter with a suitable adhesive or separate retainer. Mating connector and electrical contacts are references only. Check actual shell fit; male, capped and panel variants may differ.'};}

export function applySurroundingRibs(i:Item){if(!['telemetry','gps','airspeed','tone'].includes(i.component?.id??'')||i.holder.ribRevision===1)return;i.holder.enabled=true;for(const side of Object.values(i.holder.sides)){side.enabled=true;side.opening=0;side.offset=0;}i.holder.ribRevision=1;}

function applyComponentUpdates(original:ComponentDef):ComponentDef{const c=readComponentMeasurements(original);if(c.id==='tone'&&(!c.lightMountRevision||c.body.l===52.35)){const next=structuredClone(c);next.physicalFitRevision=1;next.lightMountRevision=1;next.body={l:44.5,w:44.5,h:8.5};next.bodyStatus='measured';next.sources.body='User remeasured case: 44.5 × 44.5 × 8.5 mm.';next.holes=[{x:30,y:-14.75,d:1.5},{x:-30,y:22.75,d:1.5}];next.holesStatus='measured';next.mountingPatternPending=false;next.sources.holes='User: 60 mm horizontally, centred; upper-right 7.5 mm and lower-left 45 mm down from top. Ø1.5 mm printed pilots selected.';next.tabs=[{x:27.625,y:-10.75,l:10.75,w:16},{x:-27.625,y:18.75,l:10.75,w:16}];next.note='44.5 × 44.5 × 8.5 mm case; two holes on upper-right/lower-left diagonal. Pattern centred horizontally; vertical offsets retained exactly. Tab clearance windows are conservatively 16 mm wide, inferred from photo and adjustable; not measured tab outlines. Original hardware hole diameter was not supplied; 1.5 mm is the requested printed pilot size.';return next;}if(c.id==='sp1'&&(!c.physicalFitRevision||c.mountBossDiameter===null)){const next=structuredClone(c);next.physicalFitRevision=1;next.mountBossDiameter=8;next.note+=' User confirmed Ø8 mm mounting bosses; hole centres already fit. Walls are relieved around bosses.';return next;}return c;}

export function applyRailHeight(i:Item){if(i.component?.category!=='electronics'||i.holder.railHeightRevision===1)return;i.holder.height=2.5;i.holder.railHeightRevision=1;}

/** Promote only the exact patterns confirmed by the user's physical fit checks. */
export function applyConfirmedHolePattern(c:ComponentDef):ComponentDef{
 const patterns:Record<string,[number,number]>={rb35s:[53,24],sp1:[13,16],pgc:[36.5,16.5]};
 const pattern=patterns[c.id];
 if(!pattern||c.measurementRevision!==1||c.holesStatus!=='estimated'||c.holes.length!==4)return c;
 const expected=[-1,1].flatMap(x=>[-1,1].map(y=>[x*pattern[0],y*pattern[1]]));
 if(!expected.every(([x,y])=>c.holes.filter(h=>Math.abs(h.x-x)<.001&&Math.abs(h.y-y)<.001).length===1))return c;
 const next=structuredClone(c);next.holesStatus='measured';
 next.sources.holes='User physical fit check: mounting-hole centres line up on the printed tray. Original hardware diameters retained; printed component pilots are independently configured.';
 next.note=next.note.replace(' Hole pattern centring remains provisional.','');
 return next;
}
export function applyComponentMeasurements(c:ComponentDef):ComponentDef{return applyConfirmedHolePattern(applyComponentUpdates(c));}
