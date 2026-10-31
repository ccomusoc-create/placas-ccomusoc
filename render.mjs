// Uso: node render.mjs '{"seccion":"Tecnología","titulo":"...","resaltar":"palabra","bajada":"...","fecha":"2026-10-31"}'
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(process.argv[2]);
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tones = { // por sección del sitio: [fondo chip, texto]
  'tecnología':['#000','#fff'],'política':['#000','#fff'],'educación':['#0e98d6','#000'],
  'trámites':['#0e98d6','#000'],'becas':['#0e98d6','#000'],'agenda':['#ffd400','#000'],
  'bolsillo':['#ffd400','#000'],'efemérides':['#ffd400','#000'],'tus derechos':['#c4241b','#fff']
};
const [bg,fg] = tones[(d.seccion||'').toLowerCase()] || ['#000','#fff'];
let titulo = esc(d.titulo);
if (d.resaltar) titulo = titulo.replace(esc(d.resaltar), m => `<mark>${m}</mark>`);
const html = readFileSync(path.join(dir,'template.html'),'utf8')
  .replace('{{CHIPBG}}',bg).replace('{{CHIPFG}}',fg).replace('{{SECCION}}',esc(d.seccion))
  .replace('{{TITULO}}',titulo).replace('{{BAJADA}}',esc(d.bajada));
const tmp = path.join(dir,'_tmp.html'); writeFileSync(tmp, html);
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1080,height:1350}});
await p.goto(pathToFileURL(tmp).href); await p.evaluate(()=>document.fonts.ready);
// achica el título hasta que entre en la tarjeta
await p.evaluate(()=>{const h=document.querySelector('h1'),c=document.querySelector('.card');let s=112;
  const over=()=>c.scrollHeight>c.clientHeight+1; while(over()&&s>56){s-=4;h.style.fontSize=s+'px';}});
const out = path.join(dir,'placas',`${d.fecha}.jpg`);
await p.screenshot({path:out,type:'jpeg',quality:92}); await b.close();
console.log(out);
