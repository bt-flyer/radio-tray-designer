/** Download names are independent of the design's internal identity. */
export function downloadName(input:string,extension:'.stl'|'.tray.json'):string{
 let name=input.trim();for(const suffix of ['.tray.json','.stl'])if(name.toLowerCase().endsWith(suffix)){name=name.slice(0,-suffix.length);break;}
 name=name.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').trim().slice(0,120)||'radio-tray';
 return name+extension;
}
