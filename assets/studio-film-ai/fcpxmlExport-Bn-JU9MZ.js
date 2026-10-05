var e=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&apos;`),t=e=>{let t=Number(e);return!Number.isFinite(t)||t<=0?30:Math.round(t)},n=(e,t)=>!Number.isFinite(e)||e<=0?0:Math.max(1,Math.round(e*t)),r=(e,t)=>`${n(e,t)}/${t}s`,i=e=>{let t=[e.sourceUrl,e.url,e.originUrl,e.sourceUrl].map(e=>String(e||``).trim()).filter(Boolean).find(e=>/^(file|https?):\/\//i.test(e));if(!t)throw Error(`XML export needs a file:// or http(s) source for "${e.name||e.id}". Blob/data preview URLs cannot be relinked by Premiere or Resolve.`);return t},a=e=>{let t=Array.isArray(e)?e:[],n=new Map(t.map((e,t)=>[e.id,{track:e,index:t}])),r=t.some(e=>e.type===`video`&&e.isSolo),i=t.some(e=>e.type===`audio`&&e.isSolo);return{isActive:(e,t)=>{let a=n.get(e);return a?a.track.isMuted?!1:t===`audio`?i?!!a.track.isSolo:!0:r?!!a.track.isSolo:!0:!0},getTrackIndex:e=>n.get(e)?.index??0}},o=({projectName:t,fps:n,width:i,height:a,entries:o})=>{if(o.length===0)throw Error(`No exportable clips found for XML export.`);let s=o.map((t,i)=>{let a=`r${i+2}`,o=t.mediaType===`audio`?`0`:`1`,s=t.mediaType===`image`?`0`:`1`;return`    <asset id="${a}" name="${e(t.name)}" src="${e(t.sourceUrl)}" start="0/${n}s" duration="${r(t.sourceDuration,n)}" hasVideo="${o}" hasAudio="${s}"/>`}),c=o.map((t,i)=>{let a=`r${i+2}`;return`            <asset-clip name="${e(t.name)}" ref="${a}" offset="${r(t.timelineStart,n)}" start="${r(t.sourceStart,n)}" duration="${r(t.duration,n)}"/>`}),l=o.reduce((e,t)=>Math.max(e,t.timelineStart+t.duration),0);return`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    <format id="r1" name="FFVideoFormat${a}p${n}" frameDuration="1/${n}s" width="${i}" height="${a}"/>
${s.join(`
`)}
  </resources>
  <library>
    <event name="AI Video Production Editor">
      <project name="${e(t)}">
        <sequence duration="${r(l,n)}" format="r1" tcStart="0/${n}s" tcFormat="NDF">
          <spine>
${c.join(`
`)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`},s=({projectName:e=`Timeline Export`,fps:n=30,width:r=1920,height:s=1080,mediaItems:c,timelineClips:l,timelineTracks:u})=>{let d=t(n),f=new Map(c.map(e=>[e.id,e])),p=a(u),m=l.map(e=>{let t=f.get(e.mediaId);if(!t||!p.isActive(e.trackId,t.type))return null;let n=Number(e.start),r=Number(e.end);if(!Number.isFinite(n)||!Number.isFinite(r)||r<=n)return null;let a=Math.max(0,Number(e.sourceIn)||0),o=r-n,s=Math.max(o,Number(t.duration)||0,Number(e.sourceOut)||0,Number(e.duration)||0);return{id:e.id,name:t.name||e.id,sourceUrl:i(t),mediaType:t.type,timelineStart:Math.max(0,n),duration:o,sourceStart:a,sourceDuration:s,trackIndex:p.getTrackIndex(e.trackId)}}).filter(e=>!!e).sort((e,t)=>e.timelineStart===t.timelineStart?e.trackIndex===t.trackIndex?e.id.localeCompare(t.id):e.trackIndex-t.trackIndex:e.timelineStart-t.timelineStart);return o({projectName:e,fps:d,width:Math.max(16,Math.round(Number(r)||1920)),height:Math.max(16,Math.round(Number(s)||1080)),entries:m})},c=async({projectName:e=`Rough Cut`,fps:n=30,width:r=1920,height:i=1080,shots:a,getDuration:s})=>{let c=t(n),l=[],u=0;for(let e of a.filter(e=>!!e.videoUrl)){let t=String(e.videoUrl||``).trim();if(!/^(file|https?):\/\//i.test(t))throw Error(`XML export needs a file:// or http(s) source for Shot ${e.shot}. Blob/data preview URLs cannot be relinked by Premiere or Resolve.`);let n=5;if(s)try{let e=await s(t);Number.isFinite(e)&&e>0&&(n=e)}catch{n=5}let r=`Shot ${e.shot}: ${String(e.description||e.prompt||`Video`).trim()}`.slice(0,96);l.push({id:`shot-${e.shot}`,name:r,sourceUrl:t,mediaType:`video`,timelineStart:u,duration:n,sourceStart:0,sourceDuration:n}),u+=n}return o({projectName:e,fps:c,width:Math.max(16,Math.round(Number(r)||1920)),height:Math.max(16,Math.round(Number(i)||1080)),entries:l})},l=(e,t,n=`application/xml`)=>{let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)};export{s as n,l as r,c as t};