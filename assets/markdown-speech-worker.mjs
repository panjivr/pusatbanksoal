import {pipeline,env} from './vendor/speech-engine.mjs';
env.allowLocalModels=false;
env.allowRemoteModels=true;
env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/onnx/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
self.onmessage=async e=>{try{postMessage({type:'progress',phase:'loading',text:'Mengunduh atau membuka model suara lokal...'});const asr=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny',{device:'wasm',dtype:'q8',progress_callback:m=>{postMessage({type:'progress',phase:'loading',text:m.file||m.status,progress:m.progress});}});const input=e.data.audio;postMessage({type:'progress',phase:'transcribing',text:'Mengenali suara secara lokal. Proses bisa memerlukan beberapa menit.'});const output=await asr(input,{language:e.data.language||'indonesian',task:'transcribe',return_timestamps:true,chunk_length_s:30,stride_length_s:5});const text=output.text,cues=(output.chunks||[]).map(c=>({text:c.text.trim(),start:c.timestamp?.[0]??0,end:c.timestamp?.[1]??input.length/16000})).filter(c=>c.text);await asr.dispose();postMessage({type:'result',text,cues});}catch(e){postMessage({type:'error',message:'Transkripsi belum berhasil: '+e.message+'. Periksa akses unduhan model, kapasitas perangkat, atau gunakan transkrip SRT/VTT/TXT.'});}};
