import { promoCopy } from './promo-content.mjs';

const form = document.querySelector('#promo-form');
const packages = document.querySelector('#packages');
const status = document.querySelector('#status');
const save = document.querySelector('#save');
let token, savedSnapshot, dirty = false, saving = false;

const field = (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs);
function message(text, type = '') { status.textContent = text; status.className = type; }
function changeState() {
  const data = readForm();
  dirty = JSON.stringify(data) !== savedSnapshot;
  document.querySelector('#dirty-state').textContent = dirty ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan tersimpan';
  const active = form.elements.active.checked;
  document.querySelector('#active-help').textContent = active ? 'Promo ditampilkan setelah file di-generate dan deployment berhasil. Tanggal tidak menjadwalkan aktivasi otomatis.' : 'Setelah generate dan deployment, kartu promo diganti ajakan konsultasi. Data kedua paket tetap tersimpan.';
  const copy = promoCopy(data);
  for (const key of ['period','title','intro']) document.querySelector('#auto-'+key).textContent = copy[key];
  packages.querySelectorAll('.package-panel').forEach((panel,index) => {
    panel.querySelectorAll('[data-auto]').forEach(el => { el.textContent = copy.packages[index][el.dataset.auto]; });
  });
  const invalidDate = data.startDate && data.endDate && data.endDate < data.startDate;
  const error = document.querySelector('#date-error');
  error.hidden = !invalidDate;
  error.textContent = invalidDate ? 'Tanggal akhir tidak boleh mendahului tanggal mulai.' : '';
  form.elements.endDate.setCustomValidity(error.textContent);
  form.elements.endDate.setAttribute('aria-invalid', String(!!invalidDate));
}
function label(text, input) { const el = field('label'); el.append(field('span', { textContent: text }), input); return el; }
function addFeature(list, value = '') {
  const row = field('div', { className: 'feature-row' });
  const input = field('input', { value, required: true, maxLength: 200 });
  input.setAttribute('aria-label', 'Fasilitas tambahan');
  row.append(input);
  for (const [text, title, action] of [
    ['↑', 'Naikkan fasilitas', () => { if (row.previousElementSibling) list.insertBefore(row, row.previousElementSibling); }],
    ['↓', 'Turunkan fasilitas', () => { if (row.nextElementSibling) list.insertBefore(row.nextElementSibling, row); }],
    ['Hapus', 'Hapus fasilitas', () => { const next = row.nextElementSibling || row.previousElementSibling; row.remove(); (next?.querySelector('input') || list.parentElement.querySelector('button')).focus(); }]
  ]) { const button = field('button', { type: 'button', textContent: text, title }); button.setAttribute('aria-label', title); button.addEventListener('click', () => { action(); changeState(); }); row.append(button); }
  list.append(row);
  return input;
}
function packagePanel(data, index) {
  const section = field('section', { className: 'panel package-panel' });
  const heading = field('div', { className: 'panel-heading' });
  const titleWrap = field('div');
  titleWrap.append(field('span', { className: 'step', textContent: '0' + (index + 2) }), field('h2', { textContent: index === 0 ? 'Paket Pertama' : 'Paket Kedua' }));
  heading.append(titleWrap); section.append(heading);
  const grid = field('div', { className: 'fields' });
  const specs = [['name', 'Nama paket', 'text', 100], ['price', 'Harga kursus (rupiah, tanpa titik)', 'number'], ['duration', 'Jumlah jam / pertemuan', 'number'], ['unit', 'Satuan durasi', 'select', ['jam','pertemuan']], ['registrationIncluded', 'Biaya pendaftaran', 'boolean'], ['simIncluded', 'Pembuatan SIM A', 'boolean']];
  for (const [key, title, type, options] of specs) {
    let input;
    if (type === 'select' || type === 'boolean') {
      input = field('select');
      const values = type === 'boolean' ? [['true','Termasuk'],['false','Tidak termasuk']] : options.map(o=>[o,o]);
      values.forEach(([value,text])=>input.append(field('option',{value,textContent:text})));
      input.value = String(data[key]);
    } else {
      input = field(type === 'textarea' ? 'textarea' : 'input', { value: data[key], required: !['label','note'].includes(key) });
      if (type === 'number') { input.type = 'number'; input.min = '1'; input.max = key === 'price' ? '1000000000' : '1000'; input.step = '1'; }
      else if (options) input.maxLength = options;
      if (type === 'textarea') input.rows = 3;
    }
    input.dataset.key = key;
    input.id = `package-${index}-${key}`;
    const wrap = label(title, input);
    if (type === 'textarea') wrap.className = 'full';
    grid.append(wrap);
  }
  const trans = field('fieldset'); trans.append(field('legend', {textContent:'Transmisi (pilih minimal satu)'}));
  const choices = field('div', {className:'choices'});
  for (const t of ['manual','matic']) { const check=field('input',{type:'checkbox',value:t,checked:data.transmissions.includes(t)}); check.dataset.transmission=t; choices.append(label(t==='manual'?'Manual':'Matic',check)); }
  trans.append(choices); grid.append(trans);
  const featured = field('input', {type:'checkbox',checked:data.featured}); featured.dataset.key='featured';
  const featuredLabel=label('Tandai sebagai paket unggulan', featured); featuredLabel.className='toggle'; grid.append(featuredLabel);
  section.append(grid);
  const autoTitle = field('div', { className:'auto-card-title' });
  autoTitle.append(field('span', {className:'help', textContent:'Judul kartu otomatis'}));
  const titleOutput=field('p');titleOutput.dataset.auto='title';autoTitle.append(titleOutput);section.append(autoTitle);
  const autoDetails=field('details',{className:'auto-copy'});autoDetails.append(field('summary',{textContent:'Deskripsi, label, tombol, dan catatan otomatis'}));
  const autoList=field('dl');
  for(const [key,title] of [['description','Deskripsi'],['label','Label'],['buttonText','Tombol'],['note','Catatan']]) {
    const value=field('dd');value.dataset.auto=key;autoList.append(field('dt',{textContent:title}),value);
  }
  autoDetails.append(autoList);section.append(autoDetails);
  const editor=field('div',{className:'feature-editor'}), list=field('div',{className:'feature-list'});
  editor.append(field('h3',{textContent:'Fasilitas tambahan'}),field('p',{className:'help',textContent:'Maksimal 12 fasilitas. Pendaftaran dan SIM A otomatis mengikuti pilihan di atas; tidak perlu ditulis ulang.'}));
  data.features.forEach(f=>addFeature(list,f));
  const add=field('button',{type:'button',textContent:'+ Tambah fasilitas'});
  add.addEventListener('click',()=>{if(list.children.length>=12) {message('Maksimal 12 fasilitas per paket.','error');return;} addFeature(list).focus(); changeState();});
  editor.append(list,add); section.append(editor); return section;
}
function readForm() {
  const data={active:form.elements.active.checked,quotaLimited:form.elements.quotaLimited.checked};
  for(const key of ['startDate','endDate']) data[key]=form.elements[key].value;
  data.packages=[...packages.querySelectorAll('.package-panel')].map(panel=>{
    const p={}; panel.querySelectorAll('[data-key]').forEach(input=>{p[input.dataset.key]=input.type==='checkbox'?input.checked:['price','duration'].includes(input.dataset.key)?Number(input.value):['registrationIncluded','simIncluded'].includes(input.dataset.key)?input.value==='true':input.value;});
    p.transmissions=[...panel.querySelectorAll('[data-transmission]:checked')].map(i=>i.value);
    p.features=[...panel.querySelectorAll('.feature-list input')].map(i=>i.value);
    return p;
  }); return data;
}
function populate(data) {
  form.elements.active.checked=data.active;
  form.elements.quotaLimited.checked=data.quotaLimited;
  for(const key of ['startDate','endDate']) form.elements[key].value=data[key];
  packages.replaceChildren(...data.packages.map(packagePanel));
  savedSnapshot=JSON.stringify(readForm()); changeState();
}
form.addEventListener('input',changeState); form.addEventListener('change',changeState);
window.addEventListener('beforeunload',event=>{if(dirty||saving){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',async event=>{
  event.preventDefault(); if(saving)return;
  const data=readForm();
  if(data.packages.some(p=>!p.transmissions.length)){message('Pilih minimal satu transmisi pada setiap paket.','error');status.scrollIntoView({block:'center'});return;}
  saving=true; save.disabled=true; save.textContent='Menyimpan…';
  const controls=[...form.querySelectorAll('input,select,textarea,button')];
  controls.forEach(e=>e.disabled=true);
  try {
    const res=await fetch('/api/promo',{method:'POST',headers:{'Content-Type':'application/json','X-Promo-Token':token},body:JSON.stringify(data)});
    const result=await res.json(); if(!res.ok)throw new Error(result.error||'Gagal menyimpan data.');
    populate(result.data); message(result.message,'success');
  } catch(error) {message(error.message||'Server lokal tidak terhubung. Periksa jendela dashboard lalu coba lagi.','error');}
  finally {saving=false; controls.forEach(e=>e.disabled=false); save.disabled=false; save.textContent='Simpan & Generate';status.scrollIntoView({block:'center',behavior:'smooth'});}
});
try {
  const res=await fetch('/api/promo');const result=await res.json();if(!res.ok)throw new Error(result.error);
  token=result.token;populate(result.data);form.hidden=false;message('Data lokal siap diedit. Perubahan belum otomatis diterbitkan ke internet.');
} catch(error){message('Tidak dapat memuat dashboard: '+error.message+'. Mulai ulang server lokal dan muat ulang halaman.','error');}
