// Run against a local static server; browser state is isolated per viewport.
const {chromium}=require('playwright'),assert=require('assert/strict');
const base=process.env.PBS_SITE_BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PBS_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
for(const width of [390,768,1440]){const context=await b.newContext({viewport:{width,height:900}});const p=await context.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route('https://**/*',r=>r.abort());
const go=async f=>{await p.goto(new URL(f,base).href,{waitUntil:'domcontentloaded'});};
await go('index.html');await p.evaluate(()=>PBS.register({name:'UI Audit',email:'ui@example.invalid',phone:'0800000000',password:'test-only',target:'cpns'}));
if(width<640){await p.locator('.mnav-item').last().click();assert(await p.locator('.mnav-sheet.on').isVisible());assert(await p.locator('.mnav-sheet a[href="transfer-teks.html"]').isVisible());await p.keyboard.press('Escape');}
else if(width<=900){await p.locator('[data-nav-toggle]').click();await p.locator('[aria-controls="menu-studio"]').click();await p.locator('#menu-studio a[href="transfer-teks.html"]').waitFor({state:'visible'});}
else{await p.locator('[aria-controls="menu-studio"]').click();await p.locator('#menu-studio a[href="transfer-teks.html"]').waitFor({state:'visible'});}
results.push({width,check:'Navigation',passed:true});
await go('tryout.html');await p.locator('button[onclick="startExam(\'cpns\',\'Demo Gratis\',10,15)"]').click();
const total=await p.locator('#navGrid button').count();assert.equal(total,10);
for(let i=0;i<total;i++){await p.locator('#qOptions [role=radio]').first().click();assert.equal(await p.locator('#qOptions [role=radio]').first().getAttribute('aria-checked'),'true');await p.locator('#btnNext').click();}
assert(await p.locator('#resultPanel').isVisible());assert.match(await p.locator('#resScore').textContent(),/\/10$/);assert.equal(await p.evaluate(()=>PBS.history().length),1);
results.push({width,check:'CAT answers, navigation, scoring and persisted history',passed:true});

await go('transfer-teks.html');await p.locator('#ttGoConnect').click();assert(await p.locator('#ttRole').isVisible());await p.locator('#ttConnect [data-back]').click();await p.locator('#ttGoBeam').click();await p.locator('#tbText').fill('Halo, ini catatan untuk laptop.');await p.waitForFunction(()=>document.querySelector('#tbFrameInfo').textContent.includes('siap'));
await p.addScriptTag({url:new URL('assets/jsqr.js',base).href});
const beam=await p.evaluate(()=>{const cv=document.getElementById('tbQR'),img=cv.getContext('2d').getImageData(0,0,cv.width,cv.height),r=jsQR(img.data,cv.width,cv.height);QRBeam.reset();return QRBeam.feed(r.data).text;});assert.equal(beam,'Halo, ini catatan untuk laptop.');
assert(await p.evaluate(async()=>{const text='Catatan panjang 👋 '.repeat(100);const enc=QRBeam.encodeFrames(text,60);QRBeam.reset();let r;for(const frame of enc.frames.reverse())r=QRBeam.feed(frame);if(r.text!==text||enc.total<2)return false;const key=crypto.getRandomValues(new Uint8Array(32));const encrypted=await QRBeamCrypto.encryptText(key,text);return await QRBeamCrypto.decryptText(key,encrypted)===text;}));
results.push({width,check:'Transfer mode selection, actual QR decoding, multipart Unicode, encryption',passed:true});
await go('qr-studio.html');await p.locator('#qsText').fill('https://contoh.test/produk');await p.waitForTimeout(350);await p.addScriptTag({url:new URL('assets/jsqr.js',base).href});assert.equal(await p.evaluate(()=>{const cv=document.getElementById('qsOut'),im=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);return jsQR(im.data,cv.width,cv.height).data;}),'https://contoh.test/produk');results.push({width,check:'QR code generation and decoding',passed:true});
await go('keuangan-harian.html');if(width<640)await p.locator('.mnav-primary').click();await p.locator('#khJumlah').fill('25000');await p.locator('#khCatatan').fill('Makan siang audit');await p.locator('#khSubmit').click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('bekal_keuangan_tx_v1'))[0].jumlah),25000);await p.reload({waitUntil:'domcontentloaded'});assert.match(await p.locator('#khOut').textContent(),/25\.000/);results.push({width,check:'Financial entry and persisted totals',passed:true});
await go('bisnis.html');await p.locator('[data-tool="untung"]').click();for(const [id,value] of [['pfPrice','25000'],['pfVar','10000'],['pfFix','8000000'],['pfQty','1500']])await p.locator('#'+id).fill(value);assert.match(await p.locator('#pfOut .bz-big').textContent(),/14\.500\.000/);results.push({width,check:'Business profit calculation',passed:true});
await go('kelas.html');assert.equal(await p.locator('h1').count(),1);await p.locator('#kDone').click();assert.match(await p.locator('#kDone').textContent(),/selesai/);results.push({width,check:'Course heading and completion',passed:true});
assert.deepEqual(errs,[]);await context.close();}
console.log('PASS: '+results.length+' functional checks across phone, tablet and desktop');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
