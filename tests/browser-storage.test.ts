import {test} from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {BrowserStore} from '../src/browserStorage';
import {newDesign,makeItem} from '../src/model';
import {catalog} from '../src/catalog';

test('browser saves, autosaves and custom presets persist across reopening',async()=>{
 const factory=new IDBFactory(),store=new BrowserStore(factory),d=newDesign();d.name='Browser test';d.items=[makeItem('component',[70,80],catalog[0])];d.items[0].rotation=37;
 await store.saveDesign(d);const auto=structuredClone(d);auto.tray.length=300;auto.updatedAt='2099-01-01T00:00:00.000Z';await store.saveDesign(auto,true);
 const custom=structuredClone(catalog[0]);custom.id='custom-test';custom.body.l=101;await store.saveComponent(custom);await store.close();
 const reopened=new BrowserStore(factory);assert.deepEqual((await reopened.readDesign(d.id)).design,d);assert.deepEqual((await reopened.readDesign(d.id,true)).design,auto);assert.equal((await reopened.listDesigns())[0].autosave,true);assert.equal((await reopened.components())[0].body.l,101);await reopened.close();
});
test('invalid browser writes cannot replace existing designs; browsers remain isolated',async()=>{
 const factory=new IDBFactory(),store=new BrowserStore(factory),d=newDesign();await store.saveDesign(d);
 await assert.rejects(store.saveDesign({...d,tray:{...d.tray,length:-1}}));await assert.rejects(store.readDesign('../escape'));
 assert.deepEqual((await store.readDesign(d.id)).design,d);assert.deepEqual(await new BrowserStore(new IDBFactory()).listDesigns(),[]);await store.close();
});
test('browser transaction retains previous revision for recovery and preserves named saved version',async()=>{
 const factory=new IDBFactory(),store=new BrowserStore(factory),d=newDesign();await store.saveDesign(d);await store.saveDesign({...d,name:'Second revision'});
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=factory.open('trayworks-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction('records','readwrite'),s=tx.objectStore('records'),r=s.get(`design:${d.id}:saved`);r.onsuccess=()=>s.put({...r.result,value:{invalid:true}});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
 const recovered=await store.readDesign(d.id);assert.equal(recovered.recovered,true);assert.deepEqual(recovered.design,d);db.close();await store.close();
});
