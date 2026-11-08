import {roundedOutline,signedArea,trayRim,type Design,type Point,type Side} from './model';
/** Height varies along the perimeter, blending side targets with a cosine window. */
export function rimProfile(d:Design){
 let p=roundedOutline(d);if(signedArea(p)<0)p=[...p].reverse();const rim=trayRim(d);let total=0;
 const segments=p.map((a,k)=>{const b=p[(k+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),start=total;total+=length;const side:Side=Math.abs(dx)>=Math.abs(dy)?dx>=0?'north':'south':dy>=0?'east':'west';return {a,b,dx,dy,length,start,height:rim.sideHeights?.[side]??rim.height};});
 const window=Math.min(rim.transitionLength??20,total/2),half=window/2;
 const primitive=(v:number)=>v/window+Math.sin(2*Math.PI*v/window)/(2*Math.PI);
 function heightAtDistance(s:number){if(!rim.sideHeights)return rim.height;let height=0;for(const segment of segments)for(const wrap of [-total,0,total]){const lo=Math.max(-half,segment.start+wrap-s),hi=Math.min(half,segment.start+segment.length+wrap-s);if(hi>lo)height+=segment.height*(primitive(hi)-primitive(lo));}return height;}
 return (x:number,y:number)=>{let nearest=Infinity,s=0;for(const e of segments){if(e.length<1e-8)continue;const t=Math.max(0,Math.min(1,((x-e.a[0])*e.dx+(y-e.a[1])*e.dy)/(e.length*e.length))),distance=(x-e.a[0]-t*e.dx)**2+(y-e.a[1]-t*e.dy)**2;if(distance<nearest){nearest=distance;s=e.start+t*e.length;}}return heightAtDistance(s);};
}
