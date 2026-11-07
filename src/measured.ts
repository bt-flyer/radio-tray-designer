import specification from './component-measurements.json';
import type {ComponentDef,Item,Design} from './model';
const source='User specification: component-measurements.json (mm).';
export function applyComponentMeasurements(original:ComponentDef):ComponentDef{
 if(original.category==='connector'&&['xt30','xt60'].includes(original.id)&&!original.cutout?.l)return standardConnector(original.id);
 if(original.id==='drm'&&original.measurementRevision===1&&original.holes.some(h=>h.d===null)){const c=structuredClone(original);c.holes.forEach(h=>{h.d??=3;});c.sources.holes='Supplied drawing: X ±32 mm, Y 0; Ø3 mm confirmed by user.';c.note=c.note.replace('Ø3 mm mounting holes confirmed by user.','Ø3 mm mounting holes confirmed by user.');return c;}
 if(original.measurementRevision===1)return original;
 const spec=specification.components.find(s=>s.id===original.id);if(!spec)return original;
 const c=structuredClone(original);c.measurementRevision=1;
 const body='body' in spec?spec.body:undefined;
 if(body){c.body={l:body.length,w:body.width,h:body.height};c.bodyStatus='measured';c.sources.body=source+' '+body.status;}
 if(c.id==='rb35s'){c.body={l:98,w:73.4,h:18.7};c.bodyStatus='estimated';c.sources.body=source+' Case length estimated from image; height from published envelope.';c.tabs=[-1,1].flatMap(x=>[-1,1].map(y=>({x:x*53.1,y:y*24,l:8.2,w:10})));}
 const mount='mounting' in spec?spec.mounting:undefined;
 if(mount){const m=mount as {holeCount:number;diameter:number|null;spacingAlongLength?:number;spacingAcrossWidth?:number;horizontalCentreSeparation?:number;verticalCentreSeparation?:number};c.holes=m.holeCount===4?[-1,1].flatMap(x=>[-1,1].map(y=>({x:x*m.spacingAlongLength!/2,y:y*m.spacingAcrossWidth!/2,d:m.diameter}))):[{x:-m.horizontalCentreSeparation!/2,y:-m.verticalCentreSeparation!/2,d:m.diameter},{x:m.horizontalCentreSeparation!/2,y:m.verticalCentreSeparation!/2,d:m.diameter}];c.holesStatus='estimated';c.sources.holes=source+' '+mount.status+'; centring on case provisional.';}
 c.note=source+' '+('access' in spec?spec.access:'')+' '+('holder' in spec?spec.holder:'')+(mount?' Hole pattern centring remains provisional.':'');
 if(c.id==='rb35s')c.note+=' Four tab openings assumed 10 mm wide, editable below. Tab projection 8.2 mm inferred from overall 114.4 mm length. Check actual foot shape before printing.';
 if(c.id==='gsu')c.note+=' Standard open cradle and strap are provided; retaining lips and finger notch are not yet designed.';
 if(c.id==='drm'){c.bodyStatus='published';c.holesStatus='published';c.sources.body='/references/kingtech-g4-drm-dimensions.png';c.sources.holes='Supplied drawing: centres at X ±32 mm, Y 0; Ø3 mm confirmed by user.';c.note+=' Both mounting-ear ends are open; Ø3 mm mounting holes confirmed by user.';}
 if(c.id==='telemetry')c.note+=' Connector inclusion in measured body size is unconfirmed.';
 return c;
}
export function applyHolderMeasurements(i:Item){const id=i.component?.id;if(i.component?.measurementRevision!==1)return;
 if(id==='tone'){i.holder.enabled=false;return;}
 if(['telemetry','gps','airspeed','gsu'].includes(id??'')){i.holder.height=2;i.holder.sides.east.enabled=false;}
 if(id==='airspeed')i.holder.sides.west.enabled=false;
 if(id==='gsu'){i.holder.height=4;i.holder.strap.enabled=true;i.holder.strap.axis='y';i.holder.sides.east.keepout=15;}
 if(id==='sp1'){i.holder.sides.east.enabled=false;i.holder.sides.east.keepout=15;}
 if(id==='drm'){i.holder.height=2;i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
 if(id==='pgc'){i.holder.sides.east.enabled=false;i.holder.sides.west.enabled=false;}
}
export function integrateMeasurements(d:Design):Design{for(const i of d.items){if(i.component&&(!i.component.measurementRevision||(i.component.id==='drm'&&i.component.holes.some(h=>h.d===null)))){const next=applyComponentMeasurements(i.component);if(next.measurementRevision||next.connectorRevision){i.component=next;applyHolderMeasurements(i);}}}return d;}

export function standardConnector(id:string):ComponentDef{const small=id==='xt30',l=small?10.2:15.5,w=small?5.2:8.1,h=small?12.4:20.2,openingL=l+.6,openingW=w+.6;return {id,name:small?'XT30 standard connector':'XT60 standard connector',variant:small?'Standard AMASS XT30U-F body + printed flange':'Standard AMASS XT60-F body + printed flange',category:'connector',body:{l,w,h},bodyStatus:'published',holesStatus:'designed',clearanceStatus:'designed',confirmed:true,connectorRevision:1,sources:{body:small?'https://www.micros.com.pl/mediaserver/Z_XT30U-F_AMASS_0001.pdf':'https://www.bto.pl/pdf/08031/XT60-F.pdf',holes:'Designed printed flange: two Ø3.2 mm holes, 4 mm beyond opening ends.',clearance:'Designed 0.3 mm clearance per side.'},holes:[{x:-openingL/2-4,y:0,d:3.2},{x:openingL/2+4,y:0,d:3.2}],cutout:{l:openingL,w:openingW,r:.5,flangeL:openingL+16,flangeW:openingW+8,printedFlange:true,flangeThickness:3},note:'Printed adapter for a standard female connector body. Rounded rectangular clearance opening, 0.3 mm per side; 3 mm raised flange with two M3 clearance holes. Secure the connector in the adapter with a suitable adhesive or separate retainer. Mating connector and electrical contacts are references only. Check actual shell fit; male, capped and panel variants may differ.'};}
