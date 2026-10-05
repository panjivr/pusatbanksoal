import{i as e}from"./rolldown-runtime-CvV0OH9Q.js";import{n as t,t as n}from"./jsx-runtime-L7zctKWu.js";import{A as r,At as i,Ft as a,Ht as o,K as s,M as c,P as l,Qt as u,T as d,Ut as f,Vt as p,W as m,Wt as h,Zt as g,a as _,bt as v,et as y,g as b,it as x,j as S,l as C,lt as w,m as T,nn as E,o as D,rt as O,t as k,u as A,v as j,w as M,xt as N,yt as P}from"./OrbitControls-Bwl3ze78.js";var F=e(t()),I={x:0,y:0,zoom:1};({...I});var L=[{type:`character`,label:`Character`,icon:`👤`,defaultSize:{width:40,height:40},defaultColor:`#6366f1`},{type:`prop`,label:`Prop`,icon:`📦`,defaultSize:{width:30,height:30},defaultColor:`#f59e0b`},{type:`camera`,label:`Camera`,icon:`🎥`,defaultSize:{width:50,height:30},defaultColor:`#ef4444`},{type:`light`,label:`Light`,icon:`💡`,defaultSize:{width:35,height:35},defaultColor:`#fbbf24`},{type:`environment`,label:`Environment`,icon:`🌍`,defaultSize:{width:100,height:100},defaultColor:`#10b981`},{type:`area`,label:`Area`,icon:`⬜`,defaultSize:{width:80,height:80},defaultColor:`#8b5cf6`}],R=0,z=0,B=()=>`elem-${Date.now()}-${++R}`,V=()=>`scene-${Date.now()}-${++z}`,H=(e,t={x:0,y:0},n)=>{let r=L.find(t=>t.type===e);return{id:B(),type:e,label:n?.label||r?.label||e,position:t,size:n?.size||r?.defaultSize||{width:40,height:40},rotation:0,color:n?.color||r?.defaultColor||`#6366f1`,linkedShotNumbers:[],...n}},U=(e=`New Scene`)=>({id:V(),name:e,description:``,elements:[],gridSize:50,backgroundUrl:void 0,linkedEnvironmentId:void 0}),W=()=>{let e=U(`Scene 1`);return{scenes:[e],activeSceneId:e.id,viewport:{...I}}},G=(e,t)=>Math.round(e/t)*t,K=e=>L.find(t=>t.type===e),q=n(),J=50,Y={house:`House`,camera:`Camera`,light:`Light`,character:`Character`,prop:`Prop`,area:`Area`,tree:`Tree`,car:`Car`,table:`Table`},X=e=>{let t=e.label.toLowerCase();return e.type===`environment`?/tree|forest|wood/.test(t)?`tree`:`house`:e.type===`prop`?/car|van|truck|vehicle/.test(t)?`car`:/table|desk|counter/.test(t)?`table`:`prop`:e.type===`camera`?`camera`:e.type===`light`?`light`:e.type===`character`?`character`:`area`},Z=(e,t={})=>new w({color:new T(e),roughness:.75,metalness:.05,...t}),Q=(e,t)=>{let n=new c,r=t.color||`#8b93a7`,i=Math.max(.4,t.size.width/J),a=Math.max(.4,t.size.height/J);switch(e){case`house`:{let e=new O(new D(i,Math.max(2.4,Math.min(i,a)*.9),a),Z(r));e.position.y=e.geometry.parameters.height/2;let t=new O(new b(Math.max(i,a)*.72,Math.max(1,Math.min(i,a)*.5),4),Z(`#5b4636`));t.position.y=e.geometry.parameters.height+t.geometry.parameters.height/2,t.rotation.y=Math.PI/4,n.add(e,t);break}case`tree`:{let e=new O(new j(.15,.2,1.2,8),Z(`#6b4a2b`));e.position.y=.6;let t=new O(new p(Math.max(.8,i*.6),12,10),Z(`#3f8f4a`));t.position.y=1.2+t.geometry.parameters.radius*.8,n.add(e,t);break}case`camera`:{let e=new O(new D(.5,.3,.35),Z(`#2b2f3a`,{metalness:.4,roughness:.4}));e.position.y=1.4;let t=new O(new j(.1,.12,.35,16),Z(`#111`));t.rotation.x=Math.PI/2,t.position.set(0,1.4,.35);let i=new O(new b(1.4,3.2,4,1,!0),new x({color:new T(r),transparent:!0,opacity:.12,side:2}));i.rotation.x=-Math.PI/2,i.rotation.y=Math.PI/4,i.position.set(0,1.4,2.1);let a=new O(new j(.03,.03,1.25,6),Z(`#444`));a.position.y=.62,n.add(e,t,i,a);break}case`light`:{let e=new O(new j(.03,.03,2.2,6),Z(`#555`));e.position.y=1.1;let t=new O(new j(.22,.3,.35,16),Z(`#333`,{metalness:.5}));t.rotation.x=Math.PI/2.4,t.position.set(0,2.2,.15);let i=new O(new b(1.1,3,24,1,!0),new x({color:new T(r||`#fbbf24`),transparent:!0,opacity:.16,side:2,depthWrite:!1}));i.rotation.x=Math.PI/2.4,i.position.set(0,1.4,1.35);let a=new o(new T(r||`#fbbf24`),12,12,Math.PI/6,.6);a.position.set(0,2.2,.15),a.target.position.set(0,0,2.5),n.add(e,t,i,a,a.target);break}case`character`:{let e=new O(new A(.28,1.1,6,12),Z(r));e.position.y=.85;let t=new O(new p(.2,12,10),Z(`#e8c4a0`));t.position.y=1.7;let i=new O(new b(.05,.12,6),Z(`#e8c4a0`));i.rotation.x=Math.PI/2,i.position.set(0,1.68,.22),n.add(e,t,i);break}case`car`:{let e=new O(new D(Math.max(1.8,i),.6,Math.max(4,a)),Z(r,{metalness:.5,roughness:.35}));e.position.y=.55;let t=new O(new D(Math.max(1.5,i*.8),.55,Math.max(2,a*.5)),Z(`#222`,{metalness:.4,roughness:.3}));t.position.y=1.12,n.add(e,t),[-1,1].forEach(e=>[-1,1].forEach(t=>{let r=new O(new j(.32,.32,.25,14),Z(`#111`));r.rotation.z=Math.PI/2,r.position.set(e*Math.max(.9,i/2),.32,t*Math.max(1.3,a/3)),n.add(r)}));break}case`table`:{let e=new O(new D(i,.06,a),Z(r));e.position.y=.75,n.add(e),[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([e,t])=>{let r=new O(new j(.03,.03,.72,6),Z(`#5b4636`));r.position.set(e*(i/2-.08),.36,t*(a/2-.08)),n.add(r)});break}case`area`:{let e=new O(new D(i,.02,a),Z(r,{transparent:!0,opacity:.35}));e.position.y=.01;let t=new s(new d(new D(i,.04,a)),new m({color:new T(r)}));t.position.y=.02,n.add(e,t);break}default:{let e=Math.max(.4,Math.min(i,a)),t=new O(new D(i,e,a),Z(r));t.position.y=e/2,n.add(t)}}return n},$=e=>{let t=document.createElement(`canvas`);t.width=256,t.height=64;let n=t.getContext(`2d`);if(!n)return null;n.fillStyle=`rgba(0,0,0,0.55)`,n.beginPath(),n.roundRect(4,8,248,48,12),n.fill(),n.fillStyle=`#fff`,n.font=`600 24px -apple-system, system-ui, sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e.slice(0,22),128,32);let r=new f(new h({map:new C(t),depthTest:!1,transparent:!0}));return r.scale.set(2,.5,1),r},ee=({scene:e,selectedElementId:t,onSelectElement:n,onMoveElement:o})=>{let s=(0,F.useRef)(null),c=(0,F.useRef)(null),d=(0,F.useRef)(null),f=(0,F.useRef)(null),p=(0,F.useRef)(null),m=(0,F.useRef)(new Map),h=(0,F.useRef)(null),b=(0,F.useRef)(!1),[x,C]=(0,F.useState)(!1),[D,A]=(0,F.useState)(null),j=e?.elements||[];(0,F.useEffect)(()=>{let e=s.current;if(!e)return;let t=new E({antialias:!0,alpha:!0});t.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),t.setSize(e.clientWidth,e.clientHeight),t.shadowMap.enabled=!0,t.shadowMap.type=2,e.appendChild(t.domElement),c.current=t;let _=new a;_.background=new T(`#0d1016`),_.fog=new r(`#0d1016`,40,120),d.current=_;let y=new P(45,e.clientWidth/Math.max(1,e.clientHeight),.1,400);y.position.set(14,12,18),f.current=y;let b=new k(y,t.domElement);b.enableDamping=!0,b.maxPolarAngle=Math.PI/2.05,b.target.set(0,.5,0),p.current=b,_.add(new l(`#bcd3ff`,`#3b3a36`,.9));let x=new M(`#ffffff`,1.6);x.position.set(12,18,8),x.castShadow=!0,x.shadow.mapSize.set(2048,2048),x.shadow.camera.left=-30,x.shadow.camera.right=30,x.shadow.camera.top=30,x.shadow.camera.bottom=-30,_.add(x);let C=new O(new N(200,200),new w({color:`#171b23`,roughness:.95}));C.rotation.x=-Math.PI/2,C.receiveShadow=!0,C.name=`floor`,_.add(C);let D=new S(80,80,3883856,2501686);D.position.y=.005,_.add(D);let j=new i,F=new g,I=new v(new u(0,1,0),0),L=e=>{let n=t.domElement.getBoundingClientRect();F.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),j.setFromCamera(F,y)},R=()=>{let e=Array.from(m.current.values()),t=j.intersectObjects(e,!0);for(let e of t){let t=e.object;for(;t&&!t.userData.elementId;)t=t.parent;if(t?.userData.elementId)return String(t.userData.elementId)}return null},z=e=>{L(e);let r=R();if(n(r),r&&o){let n=m.current.get(r),i=new u;j.ray.intersectPlane(I,i),n&&(h.current={id:r,offset:n.position.clone().sub(i)},b.enabled=!1,t.domElement.setPointerCapture(e.pointerId))}},B=e=>{L(e);let t=h.current;if(t){let e=new u;if(j.ray.intersectPlane(I,e)){let n=m.current.get(t.id);n&&n.position.set(e.x+t.offset.x,0,e.z+t.offset.z)}return}A(R())},V=e=>{let n=h.current;h.current=null,b.enabled=!0;try{t.domElement.releasePointerCapture(e.pointerId)}catch{}if(n&&o){let e=m.current.get(n.id);e&&o(n.id,{x:e.position.x*J,y:e.position.z*J})}};t.domElement.addEventListener(`pointerdown`,z),t.domElement.addEventListener(`pointermove`,B),t.domElement.addEventListener(`pointerup`,V);let H=new ResizeObserver(()=>{y.aspect=e.clientWidth/Math.max(1,e.clientHeight),y.updateProjectionMatrix(),t.setSize(e.clientWidth,e.clientHeight)});return H.observe(e),t.setAnimationLoop(()=>{b.update(),t.render(_,y)}),()=>{t.setAnimationLoop(null),H.disconnect(),t.domElement.removeEventListener(`pointerdown`,z),t.domElement.removeEventListener(`pointermove`,B),t.domElement.removeEventListener(`pointerup`,V),b.dispose(),t.dispose(),e.removeChild(t.domElement),m.current.clear()}},[]),(0,F.useEffect)(()=>{let e=d.current;if(!e)return;let t=new Set;j.forEach(n=>{t.add(n.id);let r=X(n),i=m.current.get(n.id);if(!i||i.userData.prefab!==r||i.userData.color!==n.color||i.userData.size!==`${n.size.width}x${n.size.height}`||i.userData.label!==n.label){i&&e.remove(i),i=Q(r,n),i.userData.elementId=n.id,i.userData.prefab=r,i.userData.color=n.color,i.userData.size=`${n.size.width}x${n.size.height}`,i.userData.label=n.label,i.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let t=$(n.label);t&&(t.position.y=r===`house`?4.2:r===`tree`?3.4:2.6,i.add(t)),m.current.set(n.id,i),e.add(i)}(!h.current||h.current.id!==n.id)&&i.position.set((n.position.x+n.size.width/2)/J,0,(n.position.y+n.size.height/2)/J),i.rotation.y=-y.degToRad(n.rotation||0)}),m.current.forEach((n,r)=>{t.has(r)||(e.remove(n),m.current.delete(r))}),!b.current&&j.length>0&&(b.current=!0,requestAnimationFrame(()=>I()))},[j]),(0,F.useEffect)(()=>{m.current.forEach((e,n)=>{let r=n===t||n===D;e.traverse(e=>{let i=e;i.isMesh&&i.material instanceof w&&(i.material.emissive=new T(n===t?`#7c8cff`:r?`#3b4a80`:`#000000`),i.material.emissiveIntensity=n===t?.55:r?.3:0)})})},[t,D,j]),(0,F.useEffect)(()=>{let e=f.current,n=p.current;if(!e||!n||!x)return;let r=j.find(e=>e.id===t&&e.type===`camera`)||j.find(e=>e.type===`camera`);if(!r)return;let i=m.current.get(r.id);if(!i)return;let a=new u(0,0,1).applyAxisAngle(new u(0,1,0),i.rotation.y);e.position.copy(i.position).add(new u(0,1.45,0)),n.target.copy(e.position).add(a.multiplyScalar(6)),n.update()},[x,t,j]);let I=()=>{let e=f.current,t=p.current;if(!e||!t)return;let n=new _;if(m.current.forEach(e=>{e.updateMatrixWorld(!0),n.expandByObject(e)}),n.isEmpty())e.position.set(14,12,18),t.target.set(0,.5,0);else{let r=n.getCenter(new u),i=n.getSize(new u),a=Math.max(6,Math.max(i.x,i.z)*.9);e.position.set(r.x+a*.9,a*.75+4,r.z+a*1.1),t.target.set(r.x,.8,r.z)}t.update()},L=()=>{C(!1),I()},R=j.reduce((e,t)=>{let n=X(t);return e[n]=(e[n]||0)+1,e},{});return(0,q.jsxs)(`div`,{className:`scenemap3d`,children:[(0,q.jsx)(`div`,{ref:s,className:`scenemap3d__viewport`}),(0,q.jsxs)(`div`,{className:`scenemap3d__hud`,children:[(0,q.jsxs)(`div`,{className:`scenemap3d__legend`,children:[Object.entries(R).map(([e,t])=>(0,q.jsxs)(`span`,{className:`status-chip`,children:[Y[e],` · `,t]},e)),j.length===0&&(0,q.jsx)(`span`,{className:`app-muted text-xs`,children:`Drop elements into the 2D map; they appear here as 3D props.`})]}),(0,q.jsxs)(`div`,{className:`scenemap3d__actions`,children:[(0,q.jsx)(`button`,{type:`button`,className:`toolbar-button ${x?`toolbar-segmented__item--active`:``}`,onClick:()=>C(e=>!e),disabled:!j.some(e=>e.type===`camera`),title:`Look through the selected camera`,children:`Camera view`}),(0,q.jsx)(`button`,{type:`button`,className:`toolbar-button`,onClick:L,children:`Reset view`})]})]}),(0,q.jsx)(`div`,{className:`scenemap3d__hint`,children:`Drag props to move them · orbit with the mouse or two fingers · scroll to zoom`})]})},te=({sceneMap:e,onChange:t,references:n=[],shotPrompts:r=[]})=>{let i=e||W(),a=i.scenes.find(e=>e.id===i.activeSceneId)||i.scenes[0],[o,s]=(0,F.useState)(null),[c,l]=(0,F.useState)(!1),[u,d]=(0,F.useState)(!1),[f,p]=(0,F.useState)({x:0,y:0}),[m,h]=(0,F.useState)(!1),[g,_]=(0,F.useState)({x:0,y:0}),v=(0,F.useRef)(null),y=a?.elements.find(e=>e.id===o);(0,F.useEffect)(()=>{(!e||e.scenes.length===0)&&t(W())},[e,t]);let b=(0,F.useCallback)((e,n)=>{t({...i,scenes:i.scenes.map(t=>t.id===e?{...t,...n}:t)})},[i,t]),x=(0,F.useCallback)((e,t)=>{a&&b(a.id,{elements:a.elements.map(n=>n.id===e?{...n,...t}:n)})},[a,b]),S=(0,F.useCallback)((e,t)=>{if(!a)return;let r=t?n.find(e=>e.id===t):void 0,i=H(e,{x:200,y:200},{referenceId:t,label:r?.name||K(e)?.label||e,imageUrl:r?.imageUrl||void 0});b(a.id,{elements:[...a.elements,i]}),s(i.id)},[a,n,b]),C=(0,F.useCallback)(e=>{a&&(b(a.id,{elements:a.elements.filter(t=>t.id!==e)}),o===e&&s(null))},[a,o,b]),w=(0,F.useCallback)(()=>{let e=U(`Scene ${i.scenes.length+1}`);t({...i,scenes:[...i.scenes,e],activeSceneId:e.id})},[i,t]),T=(0,F.useCallback)(e=>{t({...i,activeSceneId:e}),s(null)},[i,t]),E=(0,F.useCallback)(e=>{e.button===1||e.button===0&&e.altKey?(h(!0),_({x:e.clientX-i.viewport.x,y:e.clientY-i.viewport.y}),e.preventDefault()):e.target===v.current&&s(null)},[i.viewport]),D=(0,F.useCallback)(e=>{if(m)t({...i,viewport:{...i.viewport,x:e.clientX-g.x,y:e.clientY-g.y}});else if(u&&o&&a){let t=v.current?.getBoundingClientRect();if(!t)return;let n=(e.clientX-t.left-i.viewport.x)/i.viewport.zoom-f.x,r=(e.clientY-t.top-i.viewport.y)/i.viewport.zoom-f.y;x(o,{position:{x:G(n,a.gridSize),y:G(r,a.gridSize)}})}},[m,u,o,a,i,g,f,t,x]),O=(0,F.useCallback)(()=>{h(!1),d(!1)},[]),k=(0,F.useCallback)(e=>{let n=e.deltaY>0?.9:1.1,r=Math.min(Math.max(i.viewport.zoom*n,.25),3);t({...i,viewport:{...i.viewport,zoom:r}})},[i,t]),A=(0,F.useCallback)((e,t)=>{e.stopPropagation(),s(t.id),d(!0);let n=v.current?.getBoundingClientRect();if(!n)return;let r=(e.clientX-n.left-i.viewport.x)/i.viewport.zoom,a=(e.clientY-n.top-i.viewport.y)/i.viewport.zoom;p({x:r-t.position.x,y:a-t.position.y})},[i.viewport]),j=(0,F.useCallback)(e=>{e.preventDefault();let t=e.dataTransfer.getData(`application/json`);if(t)try{let{type:r,referenceId:o}=JSON.parse(t),c=v.current?.getBoundingClientRect();if(!c||!a)return;let l=(e.clientX-c.left-i.viewport.x)/i.viewport.zoom,u=(e.clientY-c.top-i.viewport.y)/i.viewport.zoom,d=o?n.find(e=>e.id===o):void 0,f=H(r,{x:G(l,a.gridSize),y:G(u,a.gridSize)},{referenceId:o,label:d?.name||K(r)?.label||r,imageUrl:d?.imageUrl||void 0});b(a.id,{elements:[...a.elements,f]}),s(f.id)}catch{}},[a,n,i.viewport,b]),M=(a?.gridSize||50)*i.viewport.zoom,N=n.filter(e=>e.type===`character`),P=n.filter(e=>e.type===`prop`),I=n.filter(e=>e.type===`environment`);return(0,q.jsxs)(`div`,{className:`scene-map-workspace`,children:[(0,q.jsxs)(`div`,{className:`scene-tabs`,children:[i.scenes.map(e=>(0,q.jsx)(`button`,{className:`scene-tab ${e.id===a?.id?`active`:``}`,onClick:()=>T(e.id),children:e.name},e.id)),(0,q.jsx)(`button`,{className:`scene-tab add-tab`,onClick:w,children:`+ New Scene`}),(0,q.jsx)(`div`,{className:`scene-tabs__spacer`}),(0,q.jsxs)(`div`,{className:`toolbar-segmented`,role:`radiogroup`,"aria-label":`View`,children:[(0,q.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":!c,className:`toolbar-segmented__item ${c?``:`toolbar-segmented__item--active`}`,onClick:()=>l(!1),children:`2D plan`}),(0,q.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":c,className:`toolbar-segmented__item ${c?`toolbar-segmented__item--active`:``}`,onClick:()=>l(!0),children:`3D blockout`})]})]}),(0,q.jsxs)(`div`,{className:`scene-map-content`,children:[(0,q.jsxs)(`div`,{className:`element-palette`,children:[(0,q.jsx)(`h3`,{children:`Elements`}),(0,q.jsxs)(`div`,{className:`palette-section`,children:[(0,q.jsx)(`h4`,{children:`Add Elements`}),L.map(e=>(0,q.jsxs)(`div`,{className:`palette-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:e.type}))},onClick:()=>S(e.type),children:[(0,q.jsx)(`span`,{className:`palette-icon`,children:e.icon}),(0,q.jsx)(`span`,{children:e.label})]},e.type))]}),N.length>0&&(0,q.jsxs)(`div`,{className:`palette-section`,children:[(0,q.jsx)(`h4`,{children:`Characters`}),N.map(e=>(0,q.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`character`,referenceId:e.id}))},onClick:()=>S(`character`,e.id),children:[e.imageUrl&&(0,q.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,q.jsx)(`span`,{children:e.name})]},e.id))]}),P.length>0&&(0,q.jsxs)(`div`,{className:`palette-section`,children:[(0,q.jsx)(`h4`,{children:`Props`}),P.map(e=>(0,q.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`prop`,referenceId:e.id}))},onClick:()=>S(`prop`,e.id),children:[e.imageUrl&&(0,q.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,q.jsx)(`span`,{children:e.name})]},e.id))]}),I.length>0&&(0,q.jsxs)(`div`,{className:`palette-section`,children:[(0,q.jsx)(`h4`,{children:`Environments`}),I.map(e=>(0,q.jsxs)(`div`,{className:`palette-item reference-item`,draggable:!0,onDragStart:t=>{t.dataTransfer.setData(`application/json`,JSON.stringify({type:`environment`,referenceId:e.id}))},onClick:()=>S(`environment`,e.id),children:[e.imageUrl&&(0,q.jsx)(`img`,{src:e.imageUrl,alt:e.name,className:`palette-thumb`}),(0,q.jsx)(`span`,{children:e.name})]},e.id))]})]}),c&&a&&(0,q.jsx)(ee,{scene:a,selectedElementId:o,onSelectElement:s,onMoveElement:(n,r)=>{let i=e||W();t({...i,scenes:i.scenes.map(e=>e.id===a.id?{...e,elements:e.elements.map(e=>e.id===n?{...e,position:{x:Math.round(r.x-e.size.width/2),y:Math.round(r.y-e.size.height/2)}}:e)}:e)})}}),(0,q.jsxs)(`div`,{ref:v,className:`scene-canvas`,onMouseDown:E,onMouseMove:D,onMouseUp:O,onMouseLeave:O,onWheel:k,onDragOver:e=>e.preventDefault(),onDrop:j,style:{backgroundImage:`
                            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,backgroundSize:`${M}px ${M}px`,backgroundPosition:`${i.viewport.x}px ${i.viewport.y}px`},children:[(0,q.jsx)(`div`,{className:`canvas-transform`,style:{transform:`translate(${i.viewport.x}px, ${i.viewport.y}px) scale(${i.viewport.zoom})`,transformOrigin:`0 0`},children:a?.elements.map(e=>{let t=K(e.type),n=e.id===o;return(0,q.jsxs)(`div`,{className:`scene-element ${n?`selected`:``}`,style:{left:e.position.x,top:e.position.y,width:e.size.width,height:e.size.height,transform:`rotate(${e.rotation}deg)`,backgroundColor:e.color||t?.defaultColor,borderColor:n?`#fff`:`transparent`},onMouseDown:t=>A(t,e),children:[e.imageUrl?(0,q.jsx)(`img`,{src:e.imageUrl,alt:e.label,className:`element-image`,draggable:!1}):(0,q.jsx)(`span`,{className:`element-icon`,children:t?.icon}),(0,q.jsx)(`span`,{className:`element-label`,children:e.label})]},e.id)})}),(0,q.jsxs)(`div`,{className:`zoom-indicator`,children:[Math.round(i.viewport.zoom*100),`%`]})]}),(0,q.jsxs)(`div`,{className:`properties-panel`,children:[(0,q.jsx)(`h3`,{children:`Properties`}),y?(0,q.jsxs)(`div`,{className:`property-fields`,children:[(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Label`}),(0,q.jsx)(`input`,{type:`text`,value:y.label,onChange:e=>x(y.id,{label:e.target.value})})]}),(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Position`}),(0,q.jsxs)(`div`,{className:`property-row`,children:[(0,q.jsx)(`input`,{type:`number`,value:y.position.x,onChange:e=>x(y.id,{position:{...y.position,x:Number(e.target.value)}})}),(0,q.jsx)(`input`,{type:`number`,value:y.position.y,onChange:e=>x(y.id,{position:{...y.position,y:Number(e.target.value)}})})]})]}),(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Size`}),(0,q.jsxs)(`div`,{className:`property-row`,children:[(0,q.jsx)(`input`,{type:`number`,value:y.size.width,onChange:e=>x(y.id,{size:{...y.size,width:Number(e.target.value)}})}),(0,q.jsx)(`input`,{type:`number`,value:y.size.height,onChange:e=>x(y.id,{size:{...y.size,height:Number(e.target.value)}})})]})]}),(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Rotation`}),(0,q.jsx)(`input`,{type:`number`,value:y.rotation,onChange:e=>x(y.id,{rotation:Number(e.target.value)})})]}),(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Color`}),(0,q.jsx)(`input`,{type:`color`,value:y.color||`#6366f1`,onChange:e=>x(y.id,{color:e.target.value})})]}),(0,q.jsxs)(`div`,{className:`property-group`,children:[(0,q.jsx)(`label`,{children:`Linked Shots`}),(0,q.jsx)(`div`,{className:`linked-shots`,children:r.map(e=>{let t=y.linkedShotNumbers?.includes(e.shot);return(0,q.jsx)(`button`,{className:`shot-chip ${t?`linked`:``}`,onClick:()=>{let n=y.linkedShotNumbers||[],r=t?n.filter(t=>t!==e.shot):[...n,e.shot];x(y.id,{linkedShotNumbers:r})},children:e.shot},e.shot)})})]}),(0,q.jsx)(`button`,{className:`delete-btn`,onClick:()=>C(y.id),children:`Delete Element`})]}):(0,q.jsx)(`p`,{className:`no-selection`,children:`Select an element to edit its properties`})]})]}),(0,q.jsx)(`style`,{children:`
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
            `})]})};export{te as default};