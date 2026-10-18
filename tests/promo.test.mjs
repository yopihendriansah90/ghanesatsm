import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, PUBLIC_FILES, loadData, renderPage, renderBlocks, savePromo, recover, rupiah, validate } from '../tools/promo.mjs';
import { build } from '../tools/build.mjs';
import { startServer } from '../tools/server.mjs';
import { promoCopy, periodLabel } from '../tools/promo-content.mjs';

const source = await readFile(join(ROOT, 'index.html'), 'utf8');
const initial = await loadData();
const fresh = () => structuredClone(initial);
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'ghanesa-promo-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'data'));
  await writeFile(join(root, 'data/promo.json'), JSON.stringify(initial));
  await writeFile(join(root, 'index.html'), source);
  return root;
}
test('new period, details and inclusions reach HTML, FAQ and WhatsApp', () => {
  const d = fresh();
  Object.assign(d, { period: 'November 2026', startDate: '2026-11-01', endDate: '2026-11-30' });
  Object.assign(d.packages[0], { name: 'Baru & Hemat', title: 'Judul lama 8 jam', description: 'Deskripsi lama', price: 1250000, duration: 9, registrationIncluded: false, simIncluded: true });
  const blocks = renderBlocks(d), html = renderPage(source, d);
  assert.equal(rupiah(1250000), 'Rp1.250.000');
  assert.match(blocks.SECTION, /9 Jam Kursus Mengemudi \+ Pembuatan SIM A/);
  assert.doesNotMatch(blocks.SECTION, /Judul lama|Deskripsi lama/);
  assert.match(blocks.FAQ, /Baru &amp; Hemat: 9 jam/);
  assert.match(blocks.FAQ, /Tidak termasuk biaya pendaftaran/);
  assert.match(blocks.FAQ, /Termasuk pembuatan SIM A/);
  assert.match(decodeURIComponent(blocks.SECTION), /Rp1.250.000/);
  assert.match(blocks.HERO, /November%202026/);
  for (const content of Object.values(blocks)) assert.doesNotMatch(content, /Oktober/);
  assert.equal(renderPage(html, d), html);
  assert.match(html, /id="paket-reguler"/);
  assert.match(html, /id="testimonial-track"/);
});
test('inactive promo hides old offer details across generated blocks', () => {
  const d = fresh(); d.active = false;
  const blocks = renderBlocks(d);
  for (const block of Object.values(blocks)) assert.doesNotMatch(block, /Oktober|Crazy Deal|Rp1\.150\.000|promo-card/);
  assert.match(blocks.SECTION, /id="program"/);
  assert.match(blocks.SECTION, /belum ada promo aktif/);
  assert.match(blocks.HERO, /Konsultasi Kursus via WhatsApp/);
});
test('invalid numbers, dates, package count, transmissions and booleans rejected', () => {
  for (const change of [d=>d.packages.pop(), d=>d.packages[0].price=-1, d=>d.packages[0].price=NaN, d=>d.packages[0].duration=1.5, d=>d.endDate='2026-02-30', d=>d.endDate='2025-01-01', d=>d.packages[0].transmissions=[], d=>d.active='false', d=>d.packages[0].features=['']]) {
    const d=fresh(); change(d); assert.throws(()=>validate(d));
  }
  assert.throws(()=>renderPage(source.replace('<!-- PROMO:HERO:START -->',''),fresh()),/Penanda/);
});
test('save persists files; invalid data and storage failure preserve previous state', async t => {
  const root = await fixture(t), before = await readFile(join(root,'index.html'),'utf8');
  const invalid = fresh(); invalid.packages[0].price=0;
  await assert.rejects(savePromo(invalid,root));
  assert.equal(await readFile(join(root,'index.html'),'utf8'),before);
  await writeFile(join(root,'.promo-backups'),'blocked');
  await assert.rejects(savePromo(fresh(),root));
  assert.equal(await readFile(join(root,'index.html'),'utf8'),before);
  await rm(join(root,'.promo-backups'));
  const d=fresh(); d.packages[0].name='Paket tersimpan';
  await savePromo(d,root);
  assert.equal((await loadData(root)).packages[0].name,'Paket tersimpan');
  assert.match(await readFile(join(root,'index.html'),'utf8'),/Paket tersimpan/);
  assert.ok((await readdir(join(root,'.promo-backups'))).some(n=>n.startsWith('backup-')));
});
test('interrupted transaction restores both files', async t => {
  const root=await fixture(t);
  const files=await Promise.all(['data/promo.json','index.html'].map(async name=>({name,content:await readFile(join(root,name),'utf8')})));
  await mkdir(join(root,'.promo-backups'));
  await writeFile(join(root,'.promo-backups/pending.json'),JSON.stringify({files}));
  await writeFile(join(root,'data/promo.json'),'broken');
  await recover(root);
  assert.deepEqual(await loadData(root),initial);
  assert.equal(await readFile(join(root,'index.html'),'utf8'),source);
});
test('build only publishes explicit public assets and static HTML', async t=>{
  const root=await fixture(t);
  for (const file of PUBLIC_FILES.filter(f=>f!=='index.html')) await writeFile(join(root,file),await readFile(join(ROOT,file)));
  await mkdir(join(root,'dist'));
  await writeFile(join(root,'dist/private.json'),'must not publish');
  await build(root);
  assert.deepEqual((await readdir(join(root,'dist'))).sort(),[...PUBLIC_FILES].sort());
  const html=await readFile(join(root,'dist/index.html'),'utf8');
  assert.match(html,/Rp1\.150\.000/); assert.match(html,/data-icon="close"/); assert.match(html,/wa\.me/);
});
test('local API restricts writes and data persists after restart', async t=>{
  const root=await fixture(t);
  let server=await startServer({root,port:0});
  t.after(()=>server.close());
  let url=`http://127.0.0.1:${server.address().port}`;
  const {token}=await (await fetch(url+'/api/promo')).json();
  assert.equal((await fetch(url+'/api/promo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(initial)})).status,403);
  assert.equal((await fetch(url+'/api/promo',{method:'POST',headers:{'Content-Type':'application/json','X-Promo-Token':token,Origin:'https://outside.example'},body:JSON.stringify(initial)})).status,403);
  assert.equal((await fetch(url+'/data/promo.json')).status,404);
  const headers={'Content-Type':'application/json','X-Promo-Token':token,Origin:url};
  const d=fresh();d.packages[0].name='Persistensi API';
  assert.equal((await fetch(url+'/api/promo',{method:'POST',headers,body:JSON.stringify(d)})).status,200);
  d.packages[0].price=-1;
  assert.equal((await fetch(url+'/api/promo',{method:'POST',headers,body:JSON.stringify(d)})).status,400);
  await new Promise(ok=>server.close(ok));
  server=await startServer({root,port:0}); url=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await (await fetch(url+'/api/promo')).json()).data.packages[0].name,'Persistensi API');
});
test('website root and dashboard paths stay separate; old website links redirect', async t=>{
  const root=await fixture(t);
  await mkdir(join(root,'dashboard'));
  for(const name of ['index.html','dashboard.js','dashboard.css']) await writeFile(join(root,'dashboard',name),await readFile(join(ROOT,'dashboard',name)));
  await mkdir(join(root,'tools'));
  await writeFile(join(root,'tools/promo-content.mjs'),await readFile(join(ROOT,'tools/promo-content.mjs')));
  for(const name of ['style.css','script.js','logoganesa.png']) await writeFile(join(root,name),await readFile(join(ROOT,name)));
  const server=await startServer({root,port:0}); t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}`;
  const website=await (await fetch(url+'/')).text();
  assert.match(website,/id="beranda"/);assert.doesNotMatch(website,/id="promo-form"/);
  for(const path of ['/dashboard','/dashboard/']) {
    const html=await (await fetch(url+path)).text();
    assert.match(html,/id="promo-form"/);assert.match(html,/src="\/dashboard\/dashboard.js"/);
  }
  for(const path of ['/style.css','/script.js','/logoganesa.png','/dashboard/dashboard.js','/dashboard/dashboard.css','/dashboard/promo-content.mjs']) assert.equal((await fetch(url+path)).status,200);
  for(const path of ['/data/promo.json','/tools/server.mjs','/.promo-backups/pending.json','/dashboard/unknown']) assert.equal((await fetch(url+path)).status,404);
  const redirect=await fetch(url+'/website/',{redirect:'manual'});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/');
});
test('all derived copy follows facts across duration, SIM, registration and transmission combinations',()=>{
  for(const unit of ['jam','pertemuan']) for(const simIncluded of [true,false]) for(const registrationIncluded of [true,false]) for(const transmissions of [['manual'],['matic'],['manual','matic']]) {
    const d=fresh();Object.assign(d.packages[0],{duration:9,unit,simIncluded,registrationIncluded,transmissions,name:'Paket <A> & "B"',title:'Judul basi',description:'Deskripsi basi',label:'Label basi',buttonText:'Tombol basi',note:'Catatan basi'});
    Object.assign(d,{period:'Periode basi',title:'Section basi',intro:'Pengantar basi'});
    const copy=promoCopy(validate(d)), p=copy.packages[0], blocks=renderBlocks(d);
    assert.equal(p.title,`9 ${unit==='jam'?'Jam':'Pertemuan'} Kursus Mengemudi${simIncluded?' + Pembuatan SIM A':''}`);
    assert.ok(p.description.includes(simIncluded?'Termasuk pembuatan SIM A.':'Tidak termasuk pembuatan SIM A.'));
    assert.ok(p.description.includes(registrationIncluded?'Sudah termasuk biaya pendaftaran.':'Biaya pendaftaran terpisah.'));
    assert.equal(p.buttonText,'Ambil Paket Paket <A> & "B"');
    assert.match(blocks.SECTION,/Paket &lt;A&gt; &amp; &quot;B&quot;/);
    assert.match(decodeURIComponent(blocks.SECTION),/9 (jam|pertemuan)/);
    for(const block of Object.values(blocks)) assert.doesNotMatch(block,/basi/);
    assert.equal(Object.hasOwn(validate(d).packages[0],'title'),false);
  }
});
test('period labels follow same-month, cross-month and cross-year dates',()=>{
  assert.equal(periodLabel('2026-11-01','2026-11-30'),'November 2026');
  assert.equal(periodLabel('2026-11-01','2026-12-31'),'November – Desember 2026');
  assert.equal(periodLabel('2026-12-01','2027-01-31'),'Desember 2026 – Januari 2027');
  assert.equal(periodLabel('',''),'Pilih tanggal promo');
});
test('legacy data migrates without retaining conflicting copy; managed benefits cannot be duplicated',()=>{
  const old=fresh();delete old.quotaLimited;old.quotaNote='Kuota promo terbatas';old.period='Salah';old.packages[0].title='Tidak sinkron';
  const normalized=validate(old);assert.equal(normalized.quotaLimited,true);assert.equal(Object.hasOwn(normalized,'period'),false);
  assert.equal(normalized.packages[0].name,old.packages[0].name);
  assert.equal(normalized.packages[0].price,old.packages[0].price);
  for(const f of ['Termasuk SIM A','Gratis pendaftaran']) { const d=fresh();d.packages[0].features=[f];assert.throws(()=>validate(d),/pilihannya/); }
  const d=fresh();d.quotaLimited=false;
  assert.doesNotMatch(Object.values(renderBlocks(d)).join(' '),/Kuota promo terbatas/);
});
