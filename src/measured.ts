import specification from './component-measurements.json';
import type {ComponentDef,Item,Design} from './model';
const source='User specification: component-measurements.json (mm).';
function readComponentMeasurements(original:ComponentDef):ComponentDef{
 if(original.category==='connector'&&['xt30','xt60'].includes(original.id)&&!original.cutout?.l)return standardConnector(original.id);
 if(original.id==='drm'&&original.measurementRevision===1&&original.holes.some(h=>h.d===null)){const c=structuredClone(original);c.holes.forEach(h=>{h.d??=3;});c.sources.holes='Supplied drawing: X ±32 mm, Y 0; Ø3 mm confirmed by user.';c.note=c.note.replace('Ø3 mm mounting holes confirmed by user.','Ø3 mm mounting holes confirmed by user.');return c;}
 if(original.id==='rb35s'&&original.body.l===98&&original.fitSizingRevision!==2){const c=structuredClone(original);c.body.l=99;c.bodyStatus='measured';c.sources.body='User physical fit check: case length 99 mm; width/height retained. Hole positions already fit.';c.note+=' Case length corrected to 99 mm after print fit test; hole pattern and placement preserved.';return c;}
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
function applyHolderDefaults(i:Item){const id=i.component?.id;if(i.component?.measurementRevision!==1)return;
 if(['telemetry','gps','airspeed','tone'].includes(id??'')){applySurroundingRibs(i);return;}
 if(id==='tone'){i.holder.enabled=false;return;}
 if(['telemetry','gps','airspeed','gsu'].includes(id??'')){i.holder.sides.east.enabled=false;}
 if(id==='airspeed')i.holder.sides.west.enabled=false;
 if(id==='gsu'){i.holder.strap.enabled=true;i.holder.strap.axis='y';i.holder.sides.east.keepout=15;}
 if(id==='sp1'){i.holder.sides.east.enabled=false;i.holder.sides.east.keepout=15;}
 if(id==='drm'){i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
 if(id==='pgc'){i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
}
export function integrateMeasurements(d:Design):Design{d.screwHoles??={mode:'components',pilotDiameter:1.5};for(const i of d.items){if(i.component&&((['sp1','tone'].includes(i.component.id)&&!i.component.physicalFitRevision)||(i.component.id==='sp1'&&i.component.mountBossDiameter===null)||(i.component.id==='tone'&&(!i.component.lightMountRevision||(i.component.body.l===52.35&&i.component.fitSizingRevision!==2)))||!i.component.measurementRevision||(i.component.id==='drm'&&i.component.holes.some(h=>h.d===null))||(i.component.id==='rb35s'&&i.component.body.l===98&&i.component.fitSizingRevision!==2))){const next=applyComponentMeasurements(i.component);if(next.measurementRevision||next.connectorRevision){i.component=next;applyHolderMeasurements(i);}}if(i.component)i.component=applyConfirmedHolePattern(applyFitSizing(i.component));applySurroundingRibs(i);applyRailHeight(i);applyInstallationFit(i);if(i.component)i.component=applyPGCFeet(i.component);}return d;}

export function standardConnector(id:string):ComponentDef{const small=id==='xt30',l=small?10.2:15.5,w=small?5.2:8.1,h=small?12.4:20.2,openingL=l+.6,openingW=w+.6;return {id,name:small?'XT30 standard connector':'XT60 standard connector',variant:small?'Standard AMASS XT30U-F body + printed flange':'Standard AMASS XT60-F body + printed flange',category:'connector',body:{l,w,h},bodyStatus:'published',holesStatus:'designed',clearanceStatus:'designed',confirmed:true,connectorRevision:1,sources:{body:small?'https://www.micros.com.pl/mediaserver/Z_XT30U-F_AMASS_0001.pdf':'https://www.bto.pl/pdf/08031/XT60-F.pdf',holes:'Designed printed flange: two Ø3.2 mm holes, 4 mm beyond opening ends.',clearance:'Designed 0.3 mm clearance per side.'},holes:[{x:-openingL/2-4,y:0,d:3.2},{x:openingL/2+4,y:0,d:3.2}],cutout:{l:openingL,w:openingW,r:.5,flangeL:openingL+16,flangeW:openingW+8,printedFlange:true,flangeThickness:3},note:'Printed adapter for a standard female connector body. Rounded rectangular clearance opening, 0.3 mm per side; 3 mm raised flange with two M3 clearance holes. Secure the connector in the adapter with a suitable adhesive or separate retainer. Mating connector and electrical contacts are references only. Check actual shell fit; male, capped and panel variants may differ.'};}

export function applySurroundingRibs(i:Item){if(!['telemetry','gps','airspeed','tone'].includes(i.component?.id??'')||i.holder.ribRevision===1)return;i.holder.enabled=true;for(const side of Object.values(i.holder.sides)){side.enabled=true;side.opening=0;side.offset=0;}i.holder.ribRevision=1;}

function applyComponentUpdates(original:ComponentDef):ComponentDef{const c=readComponentMeasurements(original);if(c.id==='tone'&&(!c.lightMountRevision||(c.body.l===52.35&&c.fitSizingRevision!==2))){const next=structuredClone(c);next.physicalFitRevision=1;next.lightMountRevision=1;next.body={l:44.5,w:44.5,h:8.5};next.bodyStatus='measured';next.sources.body='User remeasured case: 44.5 × 44.5 × 8.5 mm.';next.holes=[{x:30,y:-14.75,d:1.5},{x:-30,y:22.75,d:1.5}];next.holesStatus='measured';next.mountingPatternPending=false;next.sources.holes='User: 60 mm horizontally, centred; upper-right 7.5 mm and lower-left 45 mm down from top. Ø1.5 mm printed pilots selected.';next.tabs=[{x:27.625,y:-10.75,l:10.75,w:16},{x:-27.625,y:18.75,l:10.75,w:16}];next.note='44.5 × 44.5 × 8.5 mm case; two holes on upper-right/lower-left diagonal. Pattern centred horizontally; vertical offsets retained exactly. Tab clearance windows are conservatively 16 mm wide, inferred from photo and adjustable; not measured tab outlines. Original hardware hole diameter was not supplied; 1.5 mm is the requested printed pilot size.';return next;}if(c.id==='sp1'&&(!c.physicalFitRevision||c.mountBossDiameter===null)){const next=structuredClone(c);next.physicalFitRevision=1;next.mountBossDiameter=8;next.note+=' User confirmed Ø8 mm mounting bosses; hole centres already fit. Walls are relieved around bosses.';return next;}return c;}

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
export function applyComponentMeasurements(c:ComponentDef):ComponentDef{return applyPGCFeet(applyConfirmedHolePattern(applyFitSizing(applyComponentUpdates(c))));}

export function servoHeader():ComponentDef{return {
 id:'servo3',name:'3-pin servo header',variant:'Generic 1 × 3 male header · 2.54 mm pitch + printed flange',category:'connector',
 body:{l:7.62,w:2.54,h:2.54},bodyStatus:'designed',holesStatus:'designed',clearanceStatus:'designed',confirmed:true,
 sources:{body:'Generic 2.54 mm-pitch single-row strip; 3 × 2.54 mm insulator envelope. Pitch reference: https://suddendocs.samtec.com/catalog_english/tsw_th.pdf',holes:'Designed flange: two holes at X ±8.11 mm, Y 0; Ø1.5 mm component pilots.',clearance:'Designed 0.3 mm per side around generic header insulator; adjust for your actual housing.'},
 holes:[{x:-8.11,y:0,d:1.5},{x:8.11,y:0,d:1.5}],cutout:{l:8.22,w:3.14,r:.2,flangeL:24.22,flangeW:11.14,printedFlange:true,flangeThickness:3},
 note:'Upward-facing generic three-pin male servo header, 2.54 mm pitch. Insulator 7.62 × 2.54 × 2.54 mm; six-millimetre mating pins are illustrative. Printed flange and through-opening only: install the metal header separately and retain with adhesive or a separate retainer. Not a keyed Futaba/JR housing or a specific panel connector. Measure your actual header and mating plug; adjust cutout and flange in Measurements. Pin assignment is intentionally unspecified.'
};}

/** One-time fit-envelope updates; mounting geometry and later manual sizing stay intact. */
export function applyFitSizing(c:ComponentDef):ComponentDef{
 if(!['rb35s','telemetry','tone'].includes(c.id)||c.fitSizingRevision===2)return c;
 const next=structuredClone(c);next.fitSizingRevision=2;
 if(c.id==='tone'){if([44.5,52.35].includes(c.body.l??0)){next.body={l:52.5,w:52.5,h:16.5};next.bodyStatus='measured';next.sources.body='User remeasured after physical fit: 52.5 × 52.5 × 16.5 mm. Existing mounting holes line up and remain unchanged.';next.note=next.note.replace('44.5 × 44.5 × 8.5 mm case;','52.5 × 52.5 × 16.5 mm case;');next.note+=' New body envelope only; mounting-hole coordinates retained from successful fit, not recalculated from case edges.';next.sources.holes+=' Hole coordinates retained unchanged after body remeasurement.';}return next;}
 const legacy=c.id==='rb35s'?[98,99]:[45.25,45.75];
 if(legacy.includes(c.body.l??0)){
  next.body.l=c.id==='rb35s'?100:45.4;next.bodyStatus='designed';
  next.sources.body=c.id==='rb35s'?'User requested 100 mm fit envelope after the 99 mm version remained tight; width and height unchanged.':'User requested a total 46 mm inner opening including 0.3 mm clearance per side: fit envelope length 45.4 mm. Width and height unchanged.';
  next.note+=' Fit allowance update: '+next.sources.body+' Mounting-hole centres and placement preserved.';
 }
 return next;
}

export function applyHolderMeasurements(i:Item){applyHolderDefaults(i);applyInstallationFit(i);}
export function applyInstallationFit(i:Item){
 const id=i.component?.id;if(!['sp1','pgc'].includes(id??'')||i.holder.installationFitRevision===2)return;
 if(id==='sp1'){i.holder.enabled=false;if(i.component)i.component.note=i.component.note.replace('Walls are relieved around bosses.','Locating ribs removed after interference; screw holes and boss positions remain unchanged.');}
 if(id==='pgc'){i.holder.enabled=true;for(const side of Object.values(i.holder.sides)){side.enabled=true;side.opening=0;side.offset=0;}}
 i.holder.installationFitRevision=2;
}
export function applyPGCFeet(c:ComponentDef):ComponentDef{
 if(c.id!=='pgc'||c.tabs?.length||c.holes.length!==4||![-1,1].every(x=>[-1,1].every(y=>c.holes.some(h=>h.x===x*36.5&&h.y===y*16.5))))return c;
 const next=structuredClone(c);next.tabs=c.holes.map(h=>({x:h.x,y:h.y,l:8,w:8}));next.note+=' Four-side locating ribs have conservative 8 × 8 mm foot clearance windows around the confirmed mounting centres. Foot outline is estimated and editable.';return next;
}
