import{i as e}from"./rolldown-runtime-CvV0OH9Q.js";import{n as t,t as n}from"./jsx-runtime-L7zctKWu.js";import{t as r}from"./bekalUiLabel-CbEISXb8.js";import{A as i,At as a,Ft as o,Ht as s,K as c,M as l,P as u,Qt as d,T as f,Ut as p,Vt as m,W as h,Wt as g,Zt as _,a as v,bt as y,et as b,g as x,it as S,j as C,l as w,lt as T,m as E,nn as D,o as O,rt as k,t as A,u as j,v as M,w as N,xt as P,yt as F}from"./OrbitControls-CtjmNxNa.js";var I=e(t()),L={x:0,y:0,zoom:1};({...L});var R=[{type:`character`,label:`Character`,icon:`👤`,defaultSize:{width:40,height:40},defaultColor:`#6366f1`},{type:`prop`,label:`Prop`,icon:`📦`,defaultSize:{width:30,height:30},defaultColor:`#f59e0b`},{type:`camera`,label:`Camera`,icon:`🎥`,defaultSize:{width:50,height:30},defaultColor:`#ef4444`},{type:`light`,label:`Light`,icon:`💡`,defaultSize:{width:35,height:35},defaultColor:`#fbbf24`},{type:`environment`,label:`Environment`,icon:`🌍`,defaultSize:{width:100,height:100},defaultColor:`#10b981`},{type:`area`,label:`Area`,icon:`⬜`,defaultSize:{width:80,height:80},defaultColor:`#8b5cf6`}],z=0,B=0,V=()=>`elem-${Date.now()}-${++z}`,H=()=>`scene-${Date.now()}-${++B}`,U=(e,t={x:0,y:0},n)=>{let r=R.find(t=>t.type===e);return{id:V(),type:e,label:n?.label||r?.label||e,position:t,size:n?.size||r?.defaultSize||{width:40,height:40},rotation:0,color:n?.color||r?.defaultColor||`#6366f1`,linkedShotNumbers:[],...n}},W=(e=`New Scene`)=>({id:H(),name:e,description:``,elements:[],gridSize:50,backgroundUrl:void 0,linkedEnvironmentId:void 0}),G=()=>{let e=W(`Scene 1`);return{scenes:[e],activeSceneId:e.id,viewport:{...L}}},K=(e,t)=>Math.round(e/t)*t,q=e=>R.find(t=>t.type===e),J=n(),Y=50,X={house:`House`,camera:`Camera`,light:`Light`,character:`Character`,prop:`Prop`,area:`Area`,tree:`Tree`,car:`Car`,table:`Table`},Z=e=>{let t=e.label.toLowerCase();return e.type===`environment`?/tree|forest|wood/.test(t)?`tree`:`house`:e.type===`prop`?/car|van|truck|vehicle/.test(t)?`car`:/table|desk|counter/.test(t)?`table`:`prop`:e.type===`camera`?`camera`:e.type===`light`?`light`:e.type===`character`?`character`:`area`},Q=(e,t={})=>new T({color:new E(e),roughness:.75,metalness:.05,...t}),$=(e,t)=>{let n=new l,r=t.color||`#8b93a7`,i=Math.max(.4,t.size.width/Y),a=Math.max(.4,t.size.height/Y);switch(e){case`house`:{let e=new k(new O(i,Math.max(2.4,Math.min(i,a)*.9),a),Q(r));e.position.y=e.geometry.parameters.height/2;let t=new k(new x(Math.max(i,a)*.72,Math.max(1,Math.min(i,a)*.5),4),Q(`#5b4636`));t.position.y=e.geometry.parameters.height+t.geometry.parameters.height/2,t.rotation.y=Math.PI/4,n.add(e,t);break}case`tree`:{let e=new k(new M(.15,.2,1.2,8),Q(`#6b4a2b`));e.position.y=.6;let t=new k(new m(Math.max(.8,i*.6),12,10),Q(`#3f8f4a`));t.position.y=1.2+t.geometry.parameters.radius*.8,n.add(e,t);break}case`camera`:{let e=new k(new O(.5,.3,.35),Q(`#2b2f3a`,{metalness:.4,roughness:.4}));e.position.y=1.4;let t=new k(new M(.1,.12,.35,16),Q(`#111`));t.rotation.x=Math.PI/2,t.position.set(0,1.4,.35);let i=new k(new x(1.4,3.2,4,1,!0),new S({color:new E(r),transparent:!0,opacity:.12,side:2}));i.rotation.x=-Math.PI/2,i.rotation.y=Math.PI/4,i.position.set(0,1.4,2.1);let a=new k(new M(.03,.03,1.25,6),Q(`#444`));a.position.y=.62,n.add(e,t,i,a);break}case`light`:{let e=new k(new M(.03,.03,2.2,6),Q(`#555`));e.position.y=1.1;let t=new k(new M(.22,.3,.35,16),Q(`#333`,{metalness:.5}));t.rotation.x=Math.PI/2.4,t.position.set(0,2.2,.15);let i=new k(new x(1.1,3,24,1,!0),new S({color:new E(r||`#fbbf24`),transparent:!0,opacity:.16,side:2,depthWrite:!1}));i.rotation.x=Math.PI/2.4,i.position.set(0,1.4,1.35);let a=new s(new E(r||`#fbbf24`),12,12,Math.PI/6,.6);a.position.set(0,2.2,.15),a.target.position.set(0,0,2.5),n.add(e,t,i,a,a.target);break}case`character`:{let e=new k(new j(.28,1.1,6,12),Q(r));e.position.y=.85;let t=new k(new m(.2,12,10),Q(`#e8c4a0`));t.position.y=1.7;let i=new k(new x(.05,.12,6),Q(`#e8c4a0`));i.rotation.x=Math.PI/2,i.position.set(0,1.68,.22),n.add(e,t,i);break}case`car`:{let e=new k(new O(Math.max(1.8,i),.6,Math.max(4,a)),Q(r,{metalness:.5,roughness:.35}));e.position.y=.55;let t=new k(new O(Math.max(1.5,i*.8),.55,Math.max(2,a*.5)),Q(`#222`,{metalness:.4,roughness:.3}));t.position.y=1.12,n.add(e,t),[-1,1].forEach(e=>[-1,1].forEach(t=>{let r=new k(new M(.32,.32,.25,14),Q(`#111`));r.rotation.z=Math.PI/2,r.position.set(e*Math.max(.9,i/2),.32,t*Math.max(1.3,a/3)),n.add(r)}));break}case`table`:{let e=new k(new O(i,.06,a),Q(r));e.position.y=.75,n.add(e),[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([e,t])=>{let r=new k(new M(.03,.03,.72,6),Q(`#5b4636`));r.position.set(e*(i/2-.08),.36,t*(a/2-.08)),n.add(r)});break}case`area`:{let e=new k(new O(i,.02,a),Q(r,{transparent:!0,opacity:.35}));e.position.y=.01;let t=new c(new f(new O(i,.04,a)),new h({color:new E(r)}));t.position.y=.02,n.add(e,t);break}default:{let e=Math.max(.4,Math.min(i,a)),t=new k(new O(i,e,a),Q(r));t.position.y=e/2,n.add(t)}}return n},ee=e=>{let t=document.createElement(`canvas`);t.width=256,t.height=64;let n=t.getContext(`2d`);if(!n)return null;n.fillStyle=`rgba(0,0,0,0.55)`,n.beginPath(),n.roundRect(4,8,248,48,12),n.fill(),n.fillStyle=`#fff`,n.font=`600 24px -apple-system, system-ui, sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e.slice(0,22),128,32);let r=new p(new g({map:new w(t),depthTest:!1,transparent:!0}));return r.scale.set(2,.5,1),r},te=({scene:e,selectedElementId:t,onSelectElement:n,onMoveElement:r})=>{let s=(0,I.useRef)(null),c=(0,I.useRef)(null),l=(0,I.useRef)(null),f=(0,I.useRef)(null),p=(0,I.useRef)(null),m=(0,I.useRef)(new Map),h=(0,I.useRef)(null),g=(0,I.useRef)(!1),[x,S]=(0,I.useState)(!1),[w,O]=(0,I.useState)(null),j=e?.elements||[];(0,I.useEffect)(()=>{let e=s.current;if(!e)return;let t=new D({antialias:!0,alpha:!0});t.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),t.setSize(e.clientWidth,e.clientHeight),t.shadowMap.enabled=!0,t.shadowMap.type=2,e.appendChild(t.domElement),c.current=t;let g=new o;g.background=new E(`#0d1016`),g.fog=new i(`#0d1016`,40,120),l.current=g;let v=new F(45,e.clientWidth/Math.max(1,e.clientHeight),.1,400);v.position.set(14,12,18),f.current=v;let b=new A(v,t.domElement);b.enableDamping=!0,b.maxPolarAngle=Math.PI/2.05,b.target.set(0,.5,0),p.current=b,g.add(new u(`#bcd3ff`,`#3b3a36`,.9));let x=new N(`#ffffff`,1.6);x.position.set(12,18,8),x.castShadow=!0,x.shadow.mapSize.set(2048,2048),x.shadow.camera.left=-30,x.shadow.camera.right=30,x.shadow.camera.top=30,x.shadow.camera.bottom=-30,g.add(x);let S=new k(new P(200,200),new T({color:`#171b23`,roughness:.95}));S.rotation.x=-Math.PI/2,S.receiveShadow=!0,S.name=`floor`,g.add(S);let w=new C(80,80,3883856,2501686);w.position.y=.005,g.add(w);let j=new a,M=new _,I=new y(new d(0,1,0),0),L=e=>{let n=t.domElement.getBoundingClientRect();M.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),j.setFromCamera(M,v)},R=()=>{let e=Array.from(m.current.values()),t=j.intersectObjects(e,!0);for(let e of t){let t=e.object;for(;t&&!t.userData.elementId;)t=t.parent;if(t?.userData.elementId)return String(t.userData.elementId)}return null},z=e=>{L(e);let i=R();if(n(i),i&&r){let n=m.current.get(i),r=new d;j.ray.intersectPlane(I,r),n&&(h.current={id:i,offset:n.position.clone().sub(r)},b.enabled=!1,t.domElement.setPointerCapture(e.pointerId))}},B=e=>{L(e);let t=h.current;if(t){let e=new d;if(j.ray.intersectPlane(I,e)){let n=m.current.get(t.id);n&&n.position.set(e.x+t.offset.x,0,e.z+t.offset.z)}return}O(R())},V=e=>{let n=h.current;h.current=null,b.enabled=!0;try{t.domElement.releasePointerCapture(e.pointerId)}catch{}if(n&&r){let e=m.current.get(n.id);e&&r(n.id,{x:e.position.x*Y,y:e.position.z*Y})}};t.domElement.addEventListener(`pointerdown`,z),t.domElement.addEventListener(`pointermove`,B),t.domElement.addEventListener(`pointerup`,V);let H=new ResizeObserver(()=>{v.aspect=e.clientWidth/Math.max(1,e.clientHeight),v.updateProjectionMatrix(),t.setSize(e.clientWidth,e.clientHeight)});return H.observe(e),t.setAnimationLoop(()=>{b.update(),t.render(g,v)}),()=>{t.setAnimationLoop(null),H.disconnect(),t.domElement.removeEventListener(`pointerdown`,z),t.domElement.removeEventListener(`pointermove`,B),t.domElement.removeEventListener(`pointerup`,V),b.dispose(),t.dispose(),e.removeChild(t.domElement),m.current.clear()}},[]),(0,I.useEffect)(()=>{let e=l.current;if(!e)return;let t=new Set;j.forEach(n=>{t.add(n.id);let r=Z(n),i=m.current.get(n.id);if(!i||i.userData.prefab!==r||i.userData.color!==n.color||i.userData.size!==`${n.size.width}x${n.size.height}`||i.userData.label!==n.label){i&&e.remove(i),i=$(r,n),i.userData.elementId=n.id,i.userData.prefab=r,i.userData.color=n.color,i.userData.size=`${n.size.width}x${n.size.height}`,i.userData.label=n.label,i.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let t=ee(n.label);t&&(t.position.y=r===`house`?4.2:r===`tree`?3.4:2.6,i.add(t)),m.current.set(n.id,i),e.add(i)}(!h.current||h.current.id!==n.id)&&i.position.set((n.position.x+n.size.width/2)/Y,0,(n.position.y+n.size.height/2)/Y),i.rotation.y=-b.degToRad(n.rotation||0)}),m.current.forEach((n,r)=>{t.has(r)||(e.remove(n),m.current.delete(r))}),!g.current&&j.length>0&&(g.current=!0,requestAnimationFrame(()=>M()))},[j]),(0,I.useEffect)(()=>{m.current.forEach((e,n)=>{let r=n===t||n===w;e.traverse(e=>{let i=e;i.isMesh&&i.material instanceof T&&(i.material.emissive=new E(n===t?`#7c8cff`:r?`#3b4a80`:`#000000`),i.material.emissiveIntensity=n===t?.55:r?.3:0)})})},[t,w,j]),(0,I.useEffect)(()=>{let e=f.current,n=p.current;if(!e||!n||!x)return;let r=j.find(e=>e.id===t&&e.type===`camera`)||j.find(e=>e.type===`camera`);if(!r)return;let i=m.current.get(r.id);if(!i)return;let a=new d(0,0,1).applyAxisAngle(new d(0,1,0),i.rotation.y);e.position.copy(i.position).add(new d(0,1.45,0)),n.target.copy(e.position).add(a.multiplyScalar(6)),n.update()},[x,t,j]);let M=()=>{let e=f.current,t=p.current;if(!e||!t)return;let n=new v;if(m.current.forEach(e=>{e.updateMatrixWorld(!0),n.expandByObject(e)}),n.isEmpty())e.position.set(14,12,18),t.target.set(0,.5,0);else{let r=n.getCenter(new d),i=n.getSize(new d),a=Math.max(6,Math.max(i.x,i.z)*.9);e.position.set(r.x+a*.9,a*.75+4,r.z+a*1.1),t.target.set(r.x,.8,r.z)}t.update()},L=()=>{S(!1),M()},R=j.reduce((e,t)=>{let n=Z(t);return e[n]=(e[n]||0)+1,e},{});return(0,J.jsxs)(`div`,{className:`scenemap3d`,children:[(0,J.jsx)(`div`,{ref:s,className:`scenemap3d__viewport`}),(0,J.jsxs)(`div`,{className:`scenemap3d__hud`,children:[(0,J.jsxs)(`div`,{className:`scenemap3d__legend`,children:[Object.entries(R).map(([e,t])=>(0,J.jsxs)(`span`,{className:`status-chip`,children:[X[e],` · `,t]},e)),j.length===0&&(0,J.jsx)(`span`,{className:`app-muted text-xs`,children:`Drop elements into the 2D map; they appear here as 3D props.`})]}),(0,J.jsxs)(`div`,{className:`scenemap3d__actions`,children:[(0,J.jsx)(`button`,{type:`button`,className:`toolbar-button ${x?`toolbar-segmented__item--active`:``}`,onClick:()=>S(e=>!e),disabled:!j.some(e=>e.type===`camera`),title:`Look through the selected camera`,children:`Camera view`}),(0,J.jsx)(`button`,{type:`button`,className:`toolbar-button`,onClick:L,children:`Atur ulang tampilan`})]})]}),(0,J.jsx)(`div`,{className:`scenemap3d__hint`,children:`Drag props to move them · orbit with the mouse or two fingers · scroll to zoom`})]})},ne=({sceneMap:e,onChange:t,references:n=[],shotPrompts:i=[]})=>{let a=e||G(),o=a.scenes.find(e=>e.id===a.activeSceneId)||a.scenes[0],[s,c]=(0,I.useState)(null),[l,u]=(0,I.useState)(!1),[d,f]=(0,I.useState)(!1),[p,m]=(0,I.useState)({x:0,y:0}),[h,g]=(0,I.useState)(!1),[_,v]=(0,I.useState)({x:0,y:0}),y=(0,I.useRef)(null),b=o?.elements.find(e=>e.id===s);(0,I.useEffect)(()=>{(!e||e.scenes.length===0)&&t(G())},[e,t]);let x=(0,I.useCallback)((e,n)=>{t({...a,scenes:a.scenes.map(t=>t.id===e?{...t,...n}:t)})},[a,t]),S=(0,I.useCallback)((e,t)=>{o&&x(o.id,{elements:o.elements.map(n=>n.id===e?{...n,...t}:n)})},[o,x]),C=(0,I.useCallback)((e,t)=>{if(!o)return;let r=t?n.find(e=>e.id===t):void 0,i=U(e,{x:200,y:200},{referenceId:t,label:r?.name||q(e)?.label||e,imageUrl:r?.imageUrl||void 0});x(o.id,{elements:[...o.elements,i]}),c(i.id)},[o,n,x]),w=(0,I.useCallback)(e=>{o&&(x(o.id,{elements:o.elements.filter(t=>t.id!==e)}),s===e&&c(null))},[o,s,x]),T=(0,I.useCallback)(()=>{let e=W(`Scene ${a.scenes.length+1}`);t({...a,scenes:[...a.scenes,e],activeSceneId:e.id})},[a,t]),E=(0,I.useCallback)(e=>{t({...a,activeSceneId:e}),c(null)},[a,t]),D=(0,I.useCallback)(e=>{e.button===1||e.button===0&&e.altKey?(g(!0),v({x:e.clientX-a.viewport.x,y:e.clientY-a.viewport.y}),e.preventDefault()):e.target===y.current&&c(null)},[a.viewport]),O=(0,I.useCallback)(e=>{if(h)t({...a,viewport:{...a.viewport,x:e.clientX-_.x,y:e.clientY-_.y}});else if(d&&s&&o){let t=y.current?.getBoundingClientRect();if(!t)return;let n=(e.clientX-t.left-a.viewport.x)/a.viewport.zoom-p.x,r=(e.clientY-t.top-a.viewport.y)/a.viewport.zoom-p.y;S(s,{position:{x:K(n,o.gridSize),y:K(r,o.gridSize)}})}},[h,d,s,o,a,_,p,t,S]),k=(0,I.useCallback)(()=>{g(!1),f(!1)},[]),A=(0,I.useCallback)(e=>{let n=e.deltaY>0?.9:1.1,r=Math.min(Math.max(a.viewport.zoom*n,.25),3);t({...a,viewport:{...a.viewport,zoom:r}})},[a,t]),j=(0,I.useCallback)((e,t)=>{e.stopPropagation(),c(t.id),f(!0);let n=y.current?.getBoundingClientRect();if(!n)return;let r=(e.clientX-n.left-a.viewport.x)/a.viewport.zoom,i=(e.clientY-n.top-a.viewport.y)/a.viewport.zoom;m({x:r-t.position.x,y:i-t.position.y})},[a.viewport]),M=(0,I.useCallback)(e=>{e.preventDefault();let t=e.dataTransfer.getData(`application/json`);if(t)try{let{type:r,referenceId:i}=JSON.parse(t),s=y.current?.getBoundingClientRect();if(!s||!o)return;let l=(e.clientX-s.left-a.viewport.x)/a.viewport.zoom,u=(e.clientY-s.top-a.viewport.y)/a.viewport.zoom,d=i?n.find(e=>e.id===i):void 0,f=U(r,{x:K(l,o.gridSize),y:K(u,o.gridSize)},{referenceId:i,label:d?.name||q(r)?.label||r,imageUrl:d?.imageUrl||void 0});x(o.id,{elements:[...o.elements,f]}),c(f.id)}catch{}},[o,n,a.viewport,x]),N=(o?.gridSize||50)*a.viewport.zoom,P=n.filter(e=>e.type===`character`),F=n.filter(e=>e.type===`prop`),L=n.filter(e=>e.type===`environment`);return(0,J.jsxs)(`div`,{className:`scene-map-workspace`,children:[(0,J.jsxs)(`div`,{className:`scene-tabs`,children:[a.scenes.map(e=>(0,J.jsx)(`button`,{className:`scene-tab ${e.id===o?.id?`active`:``}`,onClick:()=>E(e.id),children:e.name},e.id)),(0,J.jsx)(`button`,{className:`scene-tab add-tab`,onClick:T,children:`+ New Scene`}),(0,J.jsx)(`div`,{className:`scene-tabs__spacer`}),(0,J.jsxs)(`div`,{className:`toolbar-segmented`,role:`radiogroup`,"aria-label":`Tampilan`,children:[(0,J.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":!l,className:`toolbar-segmented__item ${l?``:`toolbar-segmented__item--active`}`,onClick:()=>u(!1),children:`2D plan`}),(0,J.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":l,className:`toolbar-segmented__item ${l?`toolbar-segmented__item--active`:``}`,onClick:()=>u(!0),children:`3D blockout`})]})]}),(0,J.jsxs)(`div`,{className:`scene-map-content`,children:[(0,J.jsxs)(`div`,{className:`element-palette`,children:[(0,J.jsx)(`h3`,{children:`Elements`}),(0,J.jsxs)(`div`,{className:`palette-section`,children:[(0,J.jsx)(`h4`,{children:`Add Elements`}),R.map(e=>(0,J.jsxs)(`div`,{className:`palette-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:e.type}))},onClick:()=>C(e.type),children:[(0,J.jsx)(`span`,{className:`palette-icon`,children:e.icon}),(0,J.jsx)(`span`,{children:r(e.label)})]},e.type))]}),P.length>0&&(0,J.jsxs)(`div`,{className:`palette-section`,children:[(0,J.jsx)(`h4`,{children:`Karakter`}),P.map(e=>(0,J.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`character`,referenceId:e.id}))},onClick:()=>C(`character`,e.id),children:[e.imageUrl&&(0,J.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,J.jsx)(`span`,{children:e.name})]},e.id))]}),F.length>0&&(0,J.jsxs)(`div`,{className:`palette-section`,children:[(0,J.jsx)(`h4`,{children:`Properti adegan`}),F.map(e=>(0,J.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`prop`,referenceId:e.id}))},onClick:()=>C(`prop`,e.id),children:[e.imageUrl&&(0,J.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,J.jsx)(`span`,{children:e.name})]},e.id))]}),L.length>0&&(0,J.jsxs)(`div`,{className:`palette-section`,children:[(0,J.jsx)(`h4`,{children:`Latar adegan`}),L.map(e=>(0,J.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`environment`,referenceId:e.id}))},onClick:()=>C(`environment`,e.id),children:[e.imageUrl&&(0,J.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,J.jsx)(`span`,{children:e.name})]},e.id))]})]}),l&&o&&(0,J.jsx)(te,{scene:o,selectedElementId:s,onSelectElement:c,onMoveElement:(n,r)=>{let i=e||G();t({...i,scenes:i.scenes.map(e=>e.id===o.id?{...e,elements:e.elements.map(e=>e.id===n?{...e,position:{x:Math.round(r.x-e.size.width/2),y:Math.round(r.y-e.size.height/2)}}:e)}:e)})}}),(0,J.jsxs)(`div`,{ref:y,className:`scene-canvas`,onMouseDown:D,onMouseMove:O,onMouseUp:k,onMouseLeave:k,onWheel:A,onDragOver:e=>e.preventDefault(),onDrop:M,style:{backgroundImage:`
                            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,backgroundSize:`${N}px ${N}px`,backgroundPosition:`${a.viewport.x}px ${a.viewport.y}px`},children:[(0,J.jsx)(`div`,{className:`canvas-transform`,style:{transform:`translate(${a.viewport.x}px, ${a.viewport.y}px) scale(${a.viewport.zoom})`,transformOrigin:`0 0`},children:o?.elements.map(e=>{let t=q(e.type),n=e.id===s;return(0,J.jsxs)(`div`,{className:`scene-element ${n?`selected`:``}`,style:{left:e.position.x,top:e.position.y,width:e.size.width,height:e.size.height,transform:`rotate(${e.rotation}deg)`,backgroundColor:e.color||t?.defaultColor,borderColor:n?`#fff`:`transparent`},onMouseDown:t=>j(t,e),children:[e.imageUrl?(0,J.jsx)(`img`,{src:e.imageUrl,alt:r(e.label),className:`element-image`,draggable:!1}):(0,J.jsx)(`span`,{className:`element-icon`,children:t?.icon}),(0,J.jsx)(`span`,{className:`element-label`,children:r(e.label)})]},e.id)})}),(0,J.jsxs)(`div`,{className:`zoom-indicator`,children:[Math.round(a.viewport.zoom*100),`%`]})]}),(0,J.jsxs)(`div`,{className:`properties-panel`,children:[(0,J.jsx)(`h3`,{children:`Properti`}),b?(0,J.jsxs)(`div`,{className:`property-fields`,children:[(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Label`}),(0,J.jsx)(`input`,{type:`text`,value:b.label,onChange:e=>S(b.id,{label:e.target.value})})]}),(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Posisi`}),(0,J.jsxs)(`div`,{className:`property-row`,children:[(0,J.jsx)(`input`,{type:`number`,value:b.position.x,onChange:e=>S(b.id,{position:{...b.position,x:Number(e.target.value)}})}),(0,J.jsx)(`input`,{type:`number`,value:b.position.y,onChange:e=>S(b.id,{position:{...b.position,y:Number(e.target.value)}})})]})]}),(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Ukuran`}),(0,J.jsxs)(`div`,{className:`property-row`,children:[(0,J.jsx)(`input`,{type:`number`,value:b.size.width,onChange:e=>S(b.id,{size:{...b.size,width:Number(e.target.value)}})}),(0,J.jsx)(`input`,{type:`number`,value:b.size.height,onChange:e=>S(b.id,{size:{...b.size,height:Number(e.target.value)}})})]})]}),(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Rotasi`}),(0,J.jsx)(`input`,{type:`number`,value:b.rotation,onChange:e=>S(b.id,{rotation:Number(e.target.value)})})]}),(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Warna`}),(0,J.jsx)(`input`,{type:`color`,value:b.color||`#6366f1`,onChange:e=>S(b.id,{color:e.target.value})})]}),(0,J.jsxs)(`div`,{className:`property-group`,children:[(0,J.jsx)(`label`,{children:`Linked Shots`}),(0,J.jsx)(`div`,{className:`linked-shots`,children:i.map(e=>{let t=b.linkedShotNumbers?.includes(e.shot);return(0,J.jsx)(`button`,{className:`shot-chip ${t?`linked`:``}`,onClick:()=>{let n=b.linkedShotNumbers||[],r=t?n.filter(t=>t!==e.shot):[...n,e.shot];S(b.id,{linkedShotNumbers:r})},children:e.shot},e.shot)})})]}),(0,J.jsx)(`button`,{className:`delete-btn`,onClick:()=>w(b.id),children:`Delete Element`})]}):(0,J.jsx)(`p`,{className:`no-selection`,children:`Select an element to edit its properties`})]})]}),(0,J.jsx)(`style`,{children:`
                .scene-map-workspace {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background-primary, #0b0f19);
                    color: var(--text-primary, #fff);
                }

                .scene-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 8px 12px;
                    background: var(--background-secondary, #1a1f2e);
                    border-bottom: 1px solid var(--border-color, #2a2f3e);
                    overflow-x: auto;
                }

                .scene-tab {
                    padding: 8px 16px;
                    background: var(--background-tertiary, #252a3a);
                    border: 1px solid var(--border-color, #2a2f3e);
                    border-radius: 6px;
                    color: var(--text-secondary, #888);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 13px;
                }

                .scene-tab:hover {
                    background: var(--background-hover, #2a2f3e);
                    color: var(--text-primary, #fff);
                }

                .scene-tab.active {
                    background: var(--accent-primary, #6366f1);
                    color: #fff;
                    border-color: var(--accent-primary, #6366f1);
                }

                .scene-tab.add-tab {
                    background: transparent;
                    border-style: dashed;
                }

                .scene-map-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .element-palette {
                    width: 220px;
                    padding: 12px;
                    background: var(--background-secondary, #1a1f2e);
                    border-right: 1px solid var(--border-color, #2a2f3e);
                    overflow-y: auto;
                }

                .element-palette h3 {
                    margin: 0 0 12px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .palette-section {
                    margin-bottom: 16px;
                }

                .palette-section h4 {
                    margin: 0 0 8px;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: var(--text-secondary, #888);
                }

                .palette-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: var(--background-tertiary, #252a3a);
                    border-radius: 6px;
                    margin-bottom: 4px;
                    cursor: grab;
                    transition: background 0.2s;
                    font-size: 13px;
                }

                .palette-item:hover {
                    background: var(--background-hover, #2a2f3e);
                }

                .palette-icon {
                    font-size: 18px;
                }

                .palette-thumb {
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    object-fit: cover;
                }

                .scene-canvas {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    cursor: crosshair;
                    background: var(--background-primary, #0b0f19);
                }

                .canvas-transform {
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                .scene-element {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 2px solid transparent;
                    cursor: move;
                    transition: border-color 0.15s, box-shadow 0.15s;
                    overflow: hidden;
                }

                .scene-element.selected {
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
                }

                .element-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                }

                .element-icon {
                    font-size: 20px;
                }

                .element-label {
                    position: absolute;
                    bottom: -18px;
                    font-size: 10px;
                    white-space: nowrap;
                    color: var(--text-secondary, #888);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }

                .zoom-indicator {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    padding: 4px 8px;
                    background: rgba(0,0,0,0.6);
                    border-radius: 4px;
                    font-size: 11px;
                    color: var(--text-secondary, #888);
                }

                .properties-panel {
                    width: 260px;
                    padding: 12px;
                    background: var(--background-secondary, #1a1f2e);
                    border-left: 1px solid var(--border-color, #2a2f3e);
                    overflow-y: auto;
                }

                .properties-panel h3 {
                    margin: 0 0 16px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .property-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .property-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .property-group label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: var(--text-secondary, #888);
                }

                .property-group input {
                    padding: 8px;
                    background: var(--background-tertiary, #252a3a);
                    border: 1px solid var(--border-color, #2a2f3e);
                    border-radius: 4px;
                    color: var(--text-primary, #fff);
                    font-size: 13px;
                }

                .property-group input[type="color"] {
                    height: 36px;
                    padding: 4px;
                    cursor: pointer;
                }

                .property-row {
                    display: flex;
                    gap: 8px;
                }

                .property-row input {
                    flex: 1;
                    min-width: 0;
                }

                .linked-shots {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .shot-chip {
                    padding: 4px 10px;
                    background: var(--background-tertiary, #252a3a);
                    border: 1px solid var(--border-color, #2a2f3e);
                    border-radius: 12px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .shot-chip:hover {
                    background: var(--background-hover, #2a2f3e);
                }

                .shot-chip.linked {
                    background: var(--accent-primary, #6366f1);
                    border-color: var(--accent-primary, #6366f1);
                    color: #fff;
                }

                .delete-btn {
                    margin-top: 12px;
                    padding: 10px;
                    background: #ef4444;
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .delete-btn:hover {
                    background: #dc2626;
                }

                .no-selection {
                    color: var(--text-secondary, #888);
                    font-size: 13px;
                    text-align: center;
                    padding: 20px;
                }
            `})]})};export{ne as default};