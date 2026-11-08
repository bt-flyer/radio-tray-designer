import {applyComponentMeasurements,standardConnector,servoHeader} from './measured';
import type { ComponentDef } from './model';
function part(id:string,name:string,variant:string,dims:[number,number,number]|null,source='',confirmed=true):ComponentDef{return {id,name,variant,category:'electronics',body:{l:dims?.[0]??null,w:dims?.[1]??null,h:dims?.[2]??null},bodyStatus:dims?'published':'unknown',holesStatus:'unknown',clearanceStatus:'unknown',confirmed,sources:{body:source,holes:'',clearance:''},holes:[],cutout:null,note:dims?'Nominal published envelope. Check connector access and holder fit on your hardware.':'Measurements needed. Enter dimensions before exporting a fitted holder.'};}
export const catalog:ComponentDef[]=[
 part('rb35s','FrSky RB-35S','RB-35S',[114.4,73.4,18.7],'https://frskyna.com/products/frsky-rb35s-built_in-advanced-stabilization-functions'),
 part('sp1','FrSky SP-1 smoke pump','SP-1',null,'https://frskyna.com/products/frsky-smoke-pumpsp-1'),
 {...part('kp600','KingTech KP-600 fuel pump','KP-600 supplied dummy STL',[65,32,36]),bodyStatus:'measured',holesStatus:'estimated',clearanceStatus:'estimated',sources:{body:'User-supplied Kingtech_pump_KP-600_Dummy.stl, millimetres assumed: cylindrical case 65 × Ø32; case bottom Z4 and top Z36. Full reference including fittings is 103.71 mm long.',holes:'Estimated from supplied KP-600 photograph using the 65 mm case as scale: clamp X −22.5 mm, two holes Y ±24 mm (48 mm centres). Hidden foot assumed symmetric. Ø3 mm hardware holes estimated; printed pilots use project settings.',clearance:'Clamp and feet estimated from supplied photograph; nipple end faces local −X. Print a fit coupon before the full tray.'},holes:[{x:-22.5,y:-24,d:3},{x:-22.5,y:24,d:3}],tabs:[{x:-22.5,y:-20,l:12,w:16},{x:-22.5,y:20,l:12,w:16}],note:'Actual supplied pump mesh is reference only and excluded from STL. Silver clamp/feet and mounting pattern are photo estimates, not measured hardware. Low locating ribs are relieved around the clamp; mounting holes use the project’s 1.5 mm pilots. Nipple fittings extend 25 mm beyond the −X case end; rear fitting extends 13.71 mm beyond +X. Reference case bottom retains the STL’s 4 mm elevation.'},
 part('gsu','KingTech G4 GSU','G4 touchscreen GSU',null),
 part('drm','KingTech G4 DRM','G4 external Data Relay Module',null),
 part('telemetry','Custom telemetry converter','Custom',null),
 part('pgc','FrSky PGC','Pilot Gear Controller',[68.6,50,18],'https://frskyna.com/products/frsky-pilot-gear-controller-pgc-for-turbine-jet-etc'),
 part('tone','T-One lighting controller','T-One product 27',null,'http://m.t-onemodel.com/pd.jsp?pid=27'),
 part('nfc','FrSky Remote NFC Panel','Remote NFC Panel',[33,19,6.2],'https://www.greathobbies.com/manuals/f/frs/frs03071404_manual.pdf'),
 part('gps','FrSky GPS ADV','GPS ADV',[45,20,10.4],'https://rcflight.se/pdf/pdf.aspx?a07=3023'),
 part('airspeed','FrSky ASS-70','ASS-70 original (not ADV)',[33.29,22.26,12.55],'https://www.rcflight.se/pdf/pdf.aspx?a07=1414'),
 ...['xt30','xt60'].map(standardConnector),
 servoHeader(),
 {...part('uat','UAT mount','Your supplied uat.stl',[80.62346,29.91702,35.34187]),category:'uat',bodyStatus:'measured',holesStatus:'measured',clearanceStatus:'measured',sources:{body:'Supplied uat.stl; units assumed millimetres',holes:'Measured STL: Ø3 mm, 50 × 20 mm centres',clearance:'Complete original mesh retained as reference'},holes:[{x:-25,y:-10,d:3},{x:25,y:-10,d:3},{x:25,y:10,d:3},{x:-25,y:10,d:3}],note:'Bolt-on reference only. Mounting face is oriented against the tray. Four holes are exported; the mount itself is excluded.'}
].map(c=>applyComponentMeasurements(c as ComponentDef));
export function customPart():ComponentDef{return part(crypto.randomUUID(),'Custom component','User measured',null);}
