import {BrowserStore} from './browserStorage';
export const browserMode=import.meta.env.VITE_BROWSER_STORAGE==='true';
let store:BrowserStore|undefined;
export async function api<T>(path:string,options?:RequestInit):Promise<T>{
 if(!browserMode){const r=await fetch(`/api${path}`,{...options,headers:{'Content-Type':'application/json',...options?.headers}});const data=await r.json();if(!r.ok)throw new Error(data.error??'Local service unavailable');return data;}
 store??=new BrowserStore();const url=new URL(path,'https://trayworks.invalid'),method=options?.method??'GET',parts=url.pathname.split('/').filter(Boolean);let result:unknown;
 if(parts[0]==='health'&&method==='GET')result={dataDirectory:'This browser on this device · download design JSON for backups'};
 else if(parts[0]==='designs'&&parts.length===1&&method==='GET')result=await store.listDesigns();
 else if(parts[0]==='designs'&&parts.length===2){const auto=url.searchParams.get('autosave')==='true';if(method==='GET')result=await store.readDesign(parts[1],auto);else if(method==='PUT'){const value=JSON.parse(String(options?.body));if(value.id!==parts[1])throw new Error('Document ID mismatch');result=await store.saveDesign(value,auto);}else throw new Error('Unsupported operation');}
 else if(parts[0]==='components'&&parts.length===1){if(method==='GET')result=await store.components();else if(method==='POST')result=await store.saveComponent(JSON.parse(String(options?.body)));else throw new Error('Unsupported operation');}
 else throw new Error('Unknown storage operation');
 return result as T;
}
