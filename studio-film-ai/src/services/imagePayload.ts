/** Transport copies only. Project originals, reference order and alpha stay intact. */
export async function prepareImagePayload(body: any, budget = 6 * 1024 * 1024, signal?: AbortSignal): Promise<string> {
  const copy = structuredClone(body);
  const refs: any[] = copy.input_references || (copy.messages || []).flatMap((m: any) => m.content.filter((p: any) => p.type === 'image_url'));
  let serialized = JSON.stringify(copy);
  if (new TextEncoder().encode(serialized).length <= budget) return serialized;
  const unique = new Map<string, Promise<string>>();
  const allowance = Math.floor((budget - new TextEncoder().encode(JSON.stringify(copy, (k, v) => k === 'url' ? '' : v)).length) / Math.max(1, refs.length));
  for (const ref of refs) {
    if (signal?.aborted) throw new DOMException('Dibatalkan', 'AbortError');
    const url = ref.image_url?.url;
    if (typeof url !== 'string' || !url.startsWith('data:image/') || url.length <= allowance) continue;
    if (!unique.has(url)) unique.set(url, (async () => {
      const blob = await (await fetch(url, { signal })).blob();
      const bitmap = await createImageBitmap(blob);
      try {
        for (const limit of [2048, 1536, 1024, 768, 512, 384, 256]) {
          if (signal?.aborted) throw new DOMException('Dibatalkan', 'AbortError');
          const scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas tidak tersedia');
          context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          // WebP preserves transparent mask pixels; browsers without WebP fall back to PNG.
          const result = canvas.toDataURL('image/webp', 0.88);
          canvas.width = canvas.height = 1;
          if (result.length <= allowance) return result;
        }
        throw new Error('Referensi belum dapat dipadatkan');
      } finally { bitmap.close(); }
    })());
    ref.image_url.url = await unique.get(url);
  }
  serialized = JSON.stringify(copy);
  if (new TextEncoder().encode(serialized).length > budget) throw new Error('Teks atau referensi melebihi kapasitas pengiriman OpenRouter. Kurangi konteks teks atau jumlah referensi.');
  return serialized;
}

/** Preserve every visual reference in numbered contact sheets when the selected model limits image count. */
export async function packImageReferences(refs: any[], max: number, signal?: AbortSignal): Promise<any[]> {
  if (!Number.isInteger(max) || max < 1 || refs.length <= max) return refs;
  const groups = Array.from({length:max},(_,i)=>refs.slice(Math.floor(i*refs.length/max),Math.floor((i+1)*refs.length/max)));
  const packed = [];
  let number = 0;
  for (const group of groups) {
    if (group.length === 1) { packed.push(group[0]); number++; continue; }
    const columns = Math.ceil(Math.sqrt(group.length)), cell = 512, rows = Math.ceil(group.length / columns);
    const canvas = document.createElement('canvas');canvas.width=columns*cell;canvas.height=rows*(cell+32);
    const context=canvas.getContext('2d');if(!context)throw new Error('Referensi belum dapat digabungkan.');
    for(let i=0;i<group.length;i++){
      if(signal?.aborted)throw new DOMException('Dibatalkan','AbortError');
      const bitmap=await createImageBitmap(await(await fetch(group[i].image_url.url,{signal})).blob());
      try{const scale=Math.min(cell/bitmap.width,cell/bitmap.height),w=bitmap.width*scale,h=bitmap.height*scale,x=(i%columns)*cell,y=Math.floor(i/columns)*(cell+32);context.drawImage(bitmap,x+(cell-w)/2,y+(cell-h)/2,w,h);context.fillStyle='#18212e';context.fillRect(x,y+cell,cell,32);context.fillStyle='#fff';context.font='20px sans-serif';context.fillText(`Referensi ${++number}`,x+8,y+cell+24);}finally{bitmap.close();}
    }
    packed.push({type:'image_url',image_url:{url:canvas.toDataURL('image/png')}});canvas.width=canvas.height=1;
  }
  return packed;
}

/** Deduplicate identical inputs and bound their aggregate pixel area (file size alone does not control MP billing). */
export async function limitReferencePixels(body: any, maxMP: number, signal?: AbortSignal): Promise<any> {
  const copy = structuredClone(body);
  const lists: any[][] = copy.input_references ? [copy.input_references] : (copy.messages || []).map((m:any)=>m.content);
  for(const list of lists){const seen=new Set<string>();for(let i=0;i<list.length;i++){const url=list[i].type==='image_url' ? list[i].image_url?.url : undefined;if(!url)continue;if(seen.has(url)){list.splice(i--,1);}else seen.add(url);}}
  const refs=lists.flat().filter(p=>p.type==='image_url');
  if(typeof document === 'undefined' || !refs.length)return copy;
  if(typeof createImageBitmap !== 'function')throw new Error('Browser ini belum mendukung penyiapan referensi dengan batas megapiksel. Gunakan browser terbaru.');
  const sizes: {width:number;height:number}[]=[];
  for(const ref of refs){const bitmap=await createImageBitmap(await(await fetch(ref.image_url.url,{signal})).blob());try{sizes.push({width:bitmap.width,height:bitmap.height});}finally{bitmap.close();}}
  const total=sizes.reduce((sum,s)=>sum+s.width*s.height,0), scale=Math.min(1,Math.sqrt(maxMP*1e6/total));
  if(scale===1)return copy;
  for(let i=0;i<refs.length;i++){
    if(signal?.aborted)throw new DOMException('Dibatalkan','AbortError');
    const bitmap=await createImageBitmap(await(await fetch(refs[i].image_url.url,{signal})).blob());
    try{const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.floor(sizes[i].width*scale));canvas.height=Math.max(1,Math.floor(sizes[i].height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Referensi belum dapat disiapkan');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);refs[i].image_url.url=canvas.toDataURL('image/webp',.92);canvas.width=canvas.height=1;}finally{bitmap.close();}
  }
  return copy;
}
