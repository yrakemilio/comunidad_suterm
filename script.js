// === CONFIG ===
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";
const SHOW_ALL_BY_DEFAULT = false; // inicio vacío si no hay búsqueda/filtros

// === STATE ===
let DATA = [];

// === UTILS ===
function uniq(arr){ return [...new Set(arr.filter(Boolean).map(x=>String(x).trim()))].sort(); }
function opt(v){ return `<option>${escapeHtml(v)}</option>`; }
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
function normalizeUrl(u){
  if (!u) return '';
  u = String(u).trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (/^\/\//.test(u)) return 'https:' + u;
  if (/^(www\.|wa\.me|api\.whatsapp\.com|facebook\.com|instagram\.com|linktr\.ee|t\.me)/i.test(u)) return 'https://' + u;
  return 'https://' + u;
}
function waLink(link_whatsapp, telefonoPlano){
  let w = (link_whatsapp || '').toString().trim();
  if (w) return normalizeUrl(w);
  const num = (telefonoPlano || '').toString().replace(/\D/g,'');
  if (!num) return '';
  const mx = num.startsWith('52') ? num : '52' + num;
  return `https://wa.me/${mx}`;
}
function slugify(s){
  return String(s||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

// === ELEMENTS ===
const $q   = document.getElementById('q');
const $sec = document.getElementById('fSeccion');
const $ciu = document.getElementById('fCiudad');
const $cat = document.getElementById('fCategoria');
const $controls = document.querySelector('.controls');
const $grid = document.getElementById('grid');

// === LOAD CSV ===
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (res) => {
    DATA = res.data
      .filter(r => (r.Nombre||'').trim().length>0)
      .map(r => {
        const base = `${r.Nombre || ''}-${r.Seccion || r.Ciudad || ''}`;
        r._id = (r.Id && String(r.Id).trim()) || (r.ID && String(r.ID).trim()) || slugify(base);
        return r;
      });
    initUI();
  },
  error: (err) => {
    console.error("Error CSV:", err);
    $grid.innerHTML = "<p>⚠️ No se pudo cargar la base.</p>";
  }
});

// === INIT ===
function initUI(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (id) {
    const item = DATA.find(x => x._id === id) || DATA.find(x => slugify(x.Nombre) === id);
    if (item) {
      $controls.style.display = 'none';
      renderDetail(item);
      return;
    } else {
      const base = location.href.split('?')[0];
      history.replaceState({}, '', base); // id inválido -> listado
    }
  }

  llenarFiltros();
  [$q, $sec, $ciu, $cat].forEach(el => el.addEventListener('input', render));
  [$sec, $ciu, $cat].forEach(el => el.addEventListener('change', render));
  render();
}

// === FILTERS ===
function llenarFiltros(){
  $sec.innerHTML += uniq(DATA.map(d=>d.Seccion)).map(opt).join('');
  $ciu.innerHTML += uniq(DATA.map(d=>d.Ciudad)).map(opt).join('');
  $cat.innerHTML += uniq(DATA.map(d=>d.Categoria)).map(opt).join('');
}

// === LIST VIEW ===
function render(){
  const q = ($q.value || '').toLowerCase();
  const s = $sec.value, c = $ciu.value, k = $cat.value;

  const hasInput = (q && q.trim().length > 0) || s || c || k;

  if (!hasInput && !SHOW_ALL_BY_DEFAULT) {
    $grid.innerHTML = `
      <div class="empty">
        Escribe algo en <b>Buscar</b> o elige <b>Sección/Ciudad/Categoría</b> para ver resultados.
      </div>`;
    return;
  }

  const list = DATA.filter(d =>
    (!q || (String(d.Nombre||'').toLowerCase().includes(q) ||
            String(d.Descripcion||'').toLowerCase().includes(q))) &&
    (!s || String(d.Seccion||'') === s) &&
    (!c || String(d.Ciudad||'') === c) &&
    (!k || String(d.Categoria||'') === k)
  );

  $grid.innerHTML = list.map(card).join('') || `<p>Sin resultados.</p>`;
}

function card(item){
  const img  = item.Logo1 || item.Imagen1 || item.Imagen2 || item.Imagen3 || item.Imagen4 || '';
  const base = location.href.split('?')[0];
  const url  = `${base}?id=${encodeURIComponent(item._id)}`;

  // Usamos onclick para forzar la navegación fuera del sandbox de CodePen
  return `
  <a class="card" href="${url}" onclick="event.preventDefault(); window.top.location.href='${url}';">
    ${img ? `<img src="${img}" alt="${escapeHtml(item.Nombre||'')}">` : ``}
    <h3>${escapeHtml(item.Nombre || '')}</h3>
    <p class="meta">
      ${escapeHtml(item.Categoria || '')}
      ${item.Ciudad ? ` · ${escapeHtml(item.Ciudad)}` : ''}
      ${item.Seccion ? ` · Sección ${escapeHtml(item.Seccion)}` : ''}
    </p>
    <p>${escapeHtml(item.Descripcion || '').slice(0,150)}${(item.Descripcion||'').length>150?'…':''}</p>
    <div class="actions"><span>Ver más</span></div>
  </a>`;
}

// === DETAIL VIEW ===
function renderDetail(item){
  const title   = item.Nombre || '';
  const subtitle= "Comunidad SUTERM";
  const desc    = item.Descripcion || '';
  const logo    = item.Logo1 || '';
  const imgsArr = [item.Imagen1,item.Imagen2,item.Imagen3,item.Imagen4].filter(Boolean);
  const wa      = waLink(item.link_whatsapp, item.telefono);
  const page    = item.link_pagina ? normalizeUrl(item.link_pagina) : '';
  const contact = wa || page;

  const gallery = imgsArr.length
    ? imgsArr.map(src => `<img src="${src}" alt="${escapeHtml(title)}">`).join('')
    : '<div class="noimg">Sin imágenes adicionales</div>';

  const base = location.href.split('?')[0];

  $grid.innerHTML = `
    <div class="detail">
      ${logo ? `<img class="detail-hero" src="${logo}" alt="${escapeHtml(title)}">` : ``}
      <div class="detail-body">
        <h2 class="detail-title">${escapeHtml(title)}</h2>
        <div class="detail-sub">${escapeHtml(subtitle)}</div>
        <p class="detail-desc">${escapeHtml(desc)}</p>

        <div class="detail-gallery">${gallery}</div>

        ${contact ? `
          <a class="detail-cta" href="${contact}" target="_blank" rel="noopener">
            Contactar por aquí y obtén 10%
          </a>
        ` : ''}

        <div class="detail-meta">
          ${item.Categoria ? `<span>${escapeHtml(item.Categoria)}</span>`:''}
          ${item.Ciudad ? `<span>${escapeHtml(item.Ciudad)}</span>`:''}
          ${item.Seccion ? `<span>Sección ${escapeHtml(item.Seccion)}</span>`:''}
        </div>

        <div class="detail-nav">
          <a href="${base}" class="back" onclick="event.preventDefault(); window.top.location.href='${base}';">← Volver al buscador</a>
          ${page ? `<a href="${page}" target="_blank" rel="noopener">Página oficial</a>`:''}
        </div>
      </div>
    </div>
  `;
}
