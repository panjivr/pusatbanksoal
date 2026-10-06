import { generateStudioImage } from './openRouterMedia';
import { loadStudioCatalog } from './openRouterCatalog';
const copyCanvas = (source: HTMLCanvasElement) => { const canvas = document.createElement('canvas'); canvas.width=source.width;canvas.height=source.height;canvas.getContext('2d')!.drawImage(source,0,0);return canvas; };
/** Keep every pixel outside the user's mask, even if the model modifies the full image. */
export const editMaskedImage = async (model: string, prompt: string, base: HTMLCanvasElement, mask: HTMLCanvasElement, resolution: string) => {
  const original = copyCanvas(base), savedMask = copyCanvas(mask), masked = copyCanvas(base);
  const ctx = masked.getContext('2d')!; ctx.globalCompositeOperation='destination-out';ctx.drawImage(savedMask,0,0);
  const metadata = (await loadStudioCatalog('image')).find(m=>m.id===model);
  if (!metadata?.architecture?.input_modalities?.includes('image')) throw new Error('Pilih model OpenRouter yang menerima referensi gambar untuk mengedit foto.');
  const ratios = metadata.supported_parameters?.aspect_ratio?.values || ['1:1','16:9','9:16','4:3','3:4'];
  const ratio = ratios.filter((r:string)=>/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(r)).sort((a:string,b:string)=>{const value=(r:string)=>{const [w,h]=r.split(':').map(Number);return Math.abs(Math.log(w/h)-Math.log(base.width/base.height));};return value(a)-value(b);})[0];
  if (!ratio) throw new Error('Rasio model ini belum tersedia untuk pengeditan foto.');
  const data=masked.toDataURL('image/png').split(',')[1];
  const result=await generateStudioImage(model,`${prompt}\nUbah area transparan saja. Pertahankan subjek dan komposisi.`,[{base64:data,mimeType:'image/png'}],ratio,resolution);
  const image=new Image();image.crossOrigin='anonymous';image.src=result.url;await image.decode();
  const edited=copyCanvas(original), editCtx=edited.getContext('2d')!;editCtx.clearRect(0,0,edited.width,edited.height);editCtx.drawImage(image,0,0,edited.width,edited.height);editCtx.globalCompositeOperation='destination-in';editCtx.drawImage(savedMask,0,0);
  original.getContext('2d')!.drawImage(edited,0,0);
  return {...result,url:original.toDataURL('image/png')};
};
