export interface GrommetSettings{enabled:boolean;wall:number;clearance:number;flange:number;retention:number;lipHeight:number;axialClearance:number}
export function grommetDefaults():GrommetSettings{return {enabled:false,wall:1.2,clearance:.2,flange:2.3,retention:.8,lipHeight:1,axialClearance:.2};}
