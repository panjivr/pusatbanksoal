import{i as e}from"./rolldown-runtime-CvV0OH9Q.js";import{n as t,t as n}from"./jsx-runtime-L7zctKWu.js";var r=e(t()),i=n(),a=e=>e.trim().toLowerCase(),o=({reviewData:e,setReviewData:t,shotPrompts:n,storyBible:o})=>{let s=e.changeRequests??[],c=e.shotTasks??[],l=(0,r.useMemo)(()=>s.map(e=>{let t=a(e.targetName),r=n.filter(n=>{if(e.type===`character`)return n.characters?.some(e=>a(e)===t);if(e.type===`environment`)return a(n.environment||``)===t;if(e.type===`product`||e.type===`brand`){let e=n.products?.some(e=>a(e)===t),r=a(n.prompt||``).includes(t)||a(n.description||``).includes(t);return!!(e||r)}return!1}).map(e=>e.shot);return{...e,affectedShots:r,tasks:c.filter(t=>t.requestId===e.id)}}),[s,n,c]),u=(0,r.useMemo)(()=>{let e=new Map;return n.forEach(t=>e.set(t.shot,t)),e},[n]),d=(e,n)=>{t(t=>({...t,shotTasks:(t.shotTasks??[]).map(t=>t.id===e?{...t,status:n,updatedAt:new Date().toISOString()}:t)}))};return(0,i.jsxs)(`div`,{className:`h-full overflow-y-auto px-6 py-6`,children:[(0,i.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`p`,{className:`text-xs uppercase tracking-[0.3em] text-slate-400`,children:`Permintaan`}),(0,i.jsx)(`h1`,{className:`text-2xl font-semibold`,children:`Artist Requests`})]}),(0,i.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,i.jsx)(`button`,{className:`app-button border border-slate-500/40`,onClick:()=>{let e={exportedAt:new Date().toISOString(),project:{title:o.title||`Untitled Project`},requests:l},t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`director-requests-${Date.now()}.json`,r.click(),URL.revokeObjectURL(n)},children:`Ekspor JSON`}),(0,i.jsx)(`button`,{className:`app-button border border-slate-500/40`,onClick:()=>{let e=`
      <html>
        <head>
          <title>Director Requests</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 8px; }
            .section { margin-top: 20px; }
            .request { border: 1px solid #ddd; padding: 12px; margin-bottom: 12px; }
            .shots { color: #555; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Director Requests</h1>
          <p>Project: ${o.title||`Untitled Project`}</p>
          <div class="section">
            ${l.map(e=>{let t=e.affectedShots.length?`Shots: ${e.affectedShots.join(`, `)}`:`Shots: none`;return`
                  <div class="request">
                    <strong>${e.type}</strong> · <strong>${e.targetName}</strong> · ${e.action}<br/>
                    ${e.note?`<em>${e.note}</em><br/>`:``}
                    <div class="shots">${t}</div>
                  </div>
                `}).join(``)}
          </div>
        </body>
      </html>
    `,t=window.open(``,`_blank`);t&&(t.document.write(e),t.document.close(),t.focus(),t.print())},children:`Ekspor PDF`})]})]}),(0,i.jsxs)(`div`,{className:`mt-6 space-y-4`,children:[l.length===0&&(0,i.jsx)(`p`,{className:`text-sm text-slate-400`,children:`No requests yet.`}),l.map(e=>(0,i.jsxs)(`div`,{className:`app-card p-4`,children:[(0,i.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-3`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`div`,{className:`text-sm font-semibold`,children:[e.type,` · `,e.targetName,` · `,e.action]}),e.note&&(0,i.jsx)(`div`,{className:`text-xs text-slate-400 mt-1`,children:e.note})]}),e.affectedShots.length>0&&(0,i.jsxs)(`div`,{className:`text-xs text-slate-400`,children:[`Shots: `,e.affectedShots.join(`, `)]})]}),(0,i.jsxs)(`div`,{className:`mt-3 space-y-2`,children:[e.tasks.length===0&&(0,i.jsx)(`p`,{className:`text-xs text-slate-400`,children:`No tasks generated yet.`}),e.tasks.map(e=>{let t=u.get(e.shotNumber),n=t?[t.imageUrl?null:`image`,t.sketchUrl?null:`sketch`,t.videoUrl?null:`video`].filter(Boolean):[];return(0,i.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-500/20 p-2 text-xs text-slate-300`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`span`,{children:[`Adegan `,e.shotNumber]}),n.length>0&&(0,i.jsxs)(`span`,{className:`ml-2 text-[10px] text-rose-300`,children:[`Missing: `,n.join(`, `)]})]}),(0,i.jsxs)(`select`,{className:`app-select text-xs`,value:e.status,onChange:t=>d(e.id,t.target.value),children:[(0,i.jsx)(`option`,{value:`open`,children:`buka`}),(0,i.jsx)(`option`,{value:`in_progress`,children:`in progress`}),(0,i.jsx)(`option`,{value:`done`,children:`selesai`})]})]},e.id)})]})]},e.id))]})]})};export{o as default};