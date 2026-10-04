// Audit layout and startup errors with isolated browser data and external APIs disabled.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),base=process.env.PBS_SITE_BASE_URL||'http://127.0.0.1:8000/';
const viewports=[{width:320,height:800},{width:390,height:844},{width:768,height:1024},{width:820,height:390},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080},{width:2560,height:1440}];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PBS_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;const issues=[];
 for(const theme of ['light','dark']){
  const context=await browser.newContext();const page=await context.newPage();
  await page.route('https://**/*',route=>route.abort());
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.evaluate(t=>{localStorage.setItem('pbs_theme',t);PBS.register({name:'Layout audit',email:'layout@example.invalid',phone:'0800000000',password:'layout-test',target:'cpns'});},theme);
  for(const viewport of viewports){
   await page.setViewportSize(viewport);
   for(const file of fs.readdirSync(root).filter(name=>name.endsWith('.html'))){
    const errors=[];const handler=error=>errors.push(error.message);page.on('pageerror',handler);
    await page.goto(new URL(file,base).href,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(60);
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{
     const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
     if(!rect.width||style.visibility==='hidden'||style.display==='none')return false;
     // Intentional scroll containers and closed drawers are not page overflow.
     for(let a=el;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(s.position==='fixed'||(a!==el&&['auto','scroll','hidden'].includes(s.overflowX)))return false;}
     return rect.right>innerWidth+2||rect.left < -2;
    }).slice(0,5).map(el=>({tag:el.tagName,id:el.id,class:el.getAttribute('class')})));
    if(errors.length||overflow.length)issues.push({file,theme,...viewport,errors,overflow});
    page.off('pageerror',handler);checks++;
   }
  }
  await context.close();
 }
 await browser.close();
 assert.deepEqual(issues,[],JSON.stringify(issues,null,2));
 console.log('PASS: '+checks+' page/viewport/theme checks, including phone landscape and wide desktop.');
})().catch(error=>{console.error(error);process.exit(1)});
