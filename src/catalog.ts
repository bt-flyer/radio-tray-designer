import {applyComponentMeasurements,standardConnector} from './measured';
import type { ComponentDef } from './model';
function part(id:string,name:string,variant:string,dims:[number,number,number]|null,source='',confirmed=true):ComponentDef{return {id,name,variant,category:'electronics',body:{l:dims?.[0]??null,w:dims?.[1]??null,h:dims?.[2]??null},bodyStatus:dims?'published':'unknown',holesStatus:'unknown',clearanceStatus:'unknown',confirmed,sources:{body:source,holes:'',clearance:''},holes:[],cutout:null,note:dims?'Nominal published envelope. Check connector access and holder fit on your hardware.':'Measurements needed. Enter dimensions before exporting a fitted holder.'};}
export const catalog:ComponentDef[]=[
 part('rb35s','FrSky RB-35S','RB-35S',[114.4,73.4,18.7],'https://frskyna.com/products/frsky-rb35s-built_in-advanced-stabilization-functions'),
 part('sp1','FrSky SP-1 smoke pump','SP-1',null,'https://frskyna.com/products/frsky-smoke-pumpsp-1'),
 part('gsu','KingTech G4 GSU','G4 touchscreen GSU',null),
 part('drm','KingTech G4 DRM','G4 external Data Relay Module',null),
 part('telemetry','Custom telemetry converter','Custom',null),
 part('pgc','FrSky PGC','Pilot Gear Controller',[68.6,50,18],'https://frskyna.com/products/frsky-pilot-gear-controller-pgc-for-turbine-jet-etc'),
 part('tone','T-One lighting controller','T-One product 27',null,'http://m.t-onemodel.com/pd.jsp?pid=27'),
 part('nfc','FrSky Remote NFC Panel','Remote NFC Panel',[33,19,6.2],'https://www.greathobbies.com/manuals/f/frs/frs03071404_manual.pdf'),
 part('gps','FrSky GPS ADV','GPS ADV',[45,20,10.4],'https://rcflight.se/pdf/pdf.aspx?a07=3023'),
 part('airspeed','FrSky ASS-70','ASS-70 original (not ADV)',[33.29,22.26,12.55],'https://www.rcflight.se/pdf/pdf.aspx?a07=1414'),
 ...['xt30','xt60'].map(standardConnector),
 {...part('uat','UAT mount','Your supplied uat.stl',[80.62346,29.91702,35.34187]),category:'uat',bodyStatus:'measured',holesStatus:'measured',clearanceStatus:'measured',sources:{body:'Supplied uat.stl; units assumed millimetres',holes:'Measured STL: Ø3 mm, 50 × 20 mm centres',clearance:'Complete original mesh retained as reference'},holes:[{x:-25,y:-10,d:3},{x:25,y:-10,d:3},{x:25,y:10,d:3},{x:-25,y:10,d:3}],note:'Bolt-on reference only. Mounting face is oriented against the tray. Four holes are exported; the mount itself is excluded.'}
].map(c=>applyComponentMeasurements(c as ComponentDef));
export function customPart():ComponentDef{return part(crypto.randomUUID(),'Custom component','User measured',null);}
