export interface GrommetSettings{enabled:boolean;wall:number;clearance:number;flange:number;retention:number;lipHeight:number;topLipHeight?:number;bottomLipHeight?:number;gripHeight?:number;axialClearance:number;flap?:{enabled:boolean;thickness:number;slit:number;pitch:number}}
export function grommetDefaults():GrommetSettings{return {enabled:false,wall:1.2,clearance:.2,flange:2.3,retention:.8,lipHeight:1,axialClearance:.2};}

export function flapDefaults(){return {enabled:false,thickness:.6,slit:.4,pitch:10};}
