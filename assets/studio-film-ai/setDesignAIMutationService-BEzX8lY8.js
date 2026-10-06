import{j as e}from"./geminiService-D42oOwT6.js";import{Mt as t,jt as n}from"./studio-8OsWj68F.js";var r=()=>{if(typeof window>`u`)return!1;try{return!!localStorage.getItem(`replicate_api_key`)}catch{return!1}},i=e=>{let t=e.replace(/```json/g,``).replace(/```/g,``).trim(),n=t.indexOf(`{`),r=t.lastIndexOf(`}`);return n>=0&&r>n?t.slice(n,r+1):t},a=e=>{let t=i(e);return JSON.parse(t)},o=async i=>{try{return await e(i)}catch(e){if(!r())throw e;let a=e;try{return await n(i,{systemPrompt:`Return only valid JSON. No markdown.`})}catch(e){a=e;try{return await t(i,{systemPrompt:`Return only valid JSON. No markdown.`})}catch(e){a=e}}throw a}},s=async(e,t,n=[])=>{let r=n.length>0?`Conversation History:\n${n.map(e=>`${e.role.toUpperCase()}: ${e.text}`).join(`
`)}`:`Conversation History: (none)`,i=`
    You are an AI Director controlling a 3D Set Design scene (Three.js).
    Your goal is to translate the User's natural language command into mutations and respond briefly.

    Current Scene State:
    ${JSON.stringify(t,null,2)}

    ${r}

    Available Mutation Types:
    1. create_asset: { type: 'create_asset', asset: { name: string, primitive?: 'box'|'sphere'|'plane', position?: {x,y,z}, ... } }
       - If user asks for a shape (cube, sphere), use 'primitive'.
       - If user asks for a complex object (chair, dragon), DO NOT use 'primitive'. Instead, use 'generate_asset'.
    2. generate_asset: { type: 'generate_asset', name: string, prompt: string }
       - Use this when the user wants a specific 3D model generated (e.g. "a vintage chair"). The prompt is the description for the 3D generator (Rodin).
    3. remove_asset: { type: 'remove_asset', nameOrId: string }
       - Try to match name from Current Scene.
    4. update_transform: { type: 'update_transform', nameOrId: string, position?, rotation?, scale?, relative?: boolean }
       - If user says "move up by 2", use relative: true, position: {x:0, y:2, z:0}.
       - If user says "move to 0,0,0", use relative: false.
    5. update_material: { type: 'update_material', nameOrId: string, material: { color?: string, metalness?: number, roughness?: number, opacity?: number, transparent?: boolean } }
       - Interprels visual properties.
       - "Make it red" -> color: "#ff0000"
       - "Make it gold/metallic" -> color: "#ffd700", metalness: 1.0, roughness: 0.2
       - "Make it glass/transparent" -> opacity: 0.3, roughness: 0.0, transparent: true
    6. create_light: { type: 'create_light', light: { type: 'point'|'directional'|'ambient', color: string, intensity: number, position?: {x,y,z} } }
    7. update_light: { type: 'update_light', nameOrId: string, updates: { ... } }
    8. remove_light: { type: 'remove_light', nameOrId: string }
    9. camera_look_at: { type: 'camera_look_at', target: {x,y,z} }
    10. camera_position: { type: 'camera_position', position: {x,y,z} }
    11. search_sketchfab: { type: 'search_sketchfab', query: string, name_hint?: string, position?:{x,y,z}, rotation?:{x,y,z}, scale?:{x,y,z} }
       - Use this when the user asks for a specific existing model (e.g. "find a red car on sketchfab", "add a gladiator model").
       - query: the search term for Sketchfab.
       - name_hint: optional name for the asset.
       - position/rotation/scale: optional transform if specified (e.g. "place at center", "rotate 90 degrees").

    Rules:
    - Return ONLY valid JSON object: {"reply":"...","mutations":[...]}.
    - If unclear, ask a clarification question and return an empty mutations array.
    - Interpret "left/right" as X axis, "up/down" as Y axis, "forward/back" as Z axis.
    - Default color for lights is white (#ffffff) unless specified.
    - Default intensity for lights is 1.0.

    User Command: "${e}"
  `;try{let e=a(await o(i));return{reply:e.reply||`Done.`,mutations:e.mutations||[]}}catch(e){return console.error(`Failed to parse AI Director mutations`,e),{reply:`AI Director failed to respond. ${e instanceof Error?e.message:`Unknown error`}`,mutations:[]}}};export{s as generateSetMutations};