// =====================
// CONFIG
// =====================
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";

// Arrancar SIN resultados hasta que escriban/filtren:
const SHOW_ALL_BY_DEFAULT = false;

let DATA = [];

// =====================
// HELPERS
// =====================
function norm(row){
  const out = {};
  Object.keys(row).forEach(k=>{
    const nk = String(k||"").trim();
    out[nk] = String(row[k] ?? "").trim();
  });
  return out;
}
const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();

// prioriza ruta del Sheet; si no, intenta por carpeta/Id; si no, placeholder
function pickLogo(it){
  const fromSheet = it.Logo1 || it.Logo || it.logo;
  if (fromSheet) return fromSheet;
  if (it.Id) return `imagenes/${it.Id}/logo.png`;
  return "https://via.placeholder.com/600x400?text=Sin+imagen";
}

// arma la galería: Logo1/Imagen1..3; si faltan, intenta /imagenes/{Id}/imagenX.jpg
function pickImages(it){
  const id = it.Id || "";
  const imgs = [];

  const logo = it.Logo1 || it.Logo || it.logo || (id ? `imagenes/${id}/logo.png` : "");
  if (logo) imgs.push(logo);

  ["Imagen1","Imagen2","Imagen3","imagen1","imagen2","imagen3"].forEach(k=>{
    const v = it[k]; if (v) imgs.push(v);
  });

  if (id){
    // fallbacks (si existen en tu repo)
    ["imagen1.jpg","imagen2.jpg","imagen3.jpg"].forEach(fn=>{
      imgs.push(`imagenes/${id}/${fn}`);
    });
  }
  // quita duplicados
  return [...new Set(imgs)];
}

// =====================
// CARGA CSV
// =====================
function loadData(){
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({data})=>{
      DATA = data.map(norm);
      populateFilters();
      renderList(); // muestra lista (vacía si SHOW_ALL_BY_DEFAULT=false)
    },
    error: (err)=>{
      console.error("PapaParse error:", err);
      document.getElementById("results").innerHTML =
        `<p style="color:red">⚠️ No se pudo cargar la base.</p>`;
    }
  });
}

// =====================
// LISTA (INDEX)
// =====================
function populateFilters(){
  fill("seccionFilter",  unique(DATA.map(i=>i.Seccion)));
  fill("ciudadFilter",   unique(DATA.map(i=>i.Ciudad)));
  fill("categoriaFilter",unique(DATA.map(i=>i.Categoria)));
}
function fill(id, options){
  const sel = document.getElementById(id);
  options.forEach(v=>{
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
}

function getFilters(){
  return {
    q:   document.getElementById("searchInput").value.toLowerCase().trim(),
    sec: document.getElementById("seccionFilter").value,
    cdd: document.getElementById("ciudadFilter").value,
    cat: document.getElementById("categoriaFilter").value
  };
}

function filterData(){
  const {q,sec,cdd,cat} = getFilters();
  return DATA.filter(it=>{
    const mq = !q || (it.Nombre && it.Nombre.toLowerCase().includes(q)) ||
                     (it.Descripcion && it.Descripcion.toLowerCase().includes(q));
    const ms = !sec || it.Seccion===sec;
    const mc = !cdd || it.Ciudad===cdd;
    const mcat= !cat || it.Categoria===cat;
    return mq && ms && mc && mcat;
  });
}

function renderList(){
  const box = document.getElementById("results");
  const {q,sec,cdd,cat} = getFilters();
  const list = filterData();

  box.innerHTML = "";

  if (!SHOW_ALL_BY_DEFAULT && !q && !sec && !cdd && !cat){
    box.innerHTML = `<p style="color:#666">Escribe algo en <b>Buscar</b> o usa los filtros.</p>`;
    return;
  }
  if (!list.length){
    box.innerHTML = `<p style="color:#666">No hay resultados.</p>`;
    return;
  }

  list.forEach(it=>{
    const card = document.createElement("div");
    card.className = "card";
    const logo = pickLogo(it);
    card.innerHTML = `
      <img src="${logo}" alt="logo ${it.Nombre||''}"
           onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Sin+imagen'">
      <h3>${it.Nombre||""}</h3>
      <p><b>${it.Categoria||""}</b> - ${it.Ciudad||""}, Sección ${it.Seccion||""}</p>
      <p>${it.Descripcion||""}</p>
      <a class="btn" href="#" data-id="${it.Id||''}">Ver más</a>
    `;
    box.appendChild(card);
  });
}

// =====================
// DETALLE (MISMA PÁGINA)
// =====================
function renderDetail(it){
  const box = document.getElementById("results");
  const imgs = pickImages(it);

  box.innerHTML = `
    <a class="back" href="#" style="text-decoration:none;color:#374151;display:inline-block;margin-bottom:10px">&larr; Volver</a>
    <div class="detail" style="max-width:920px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.05)">
      <h2 style="margin:0 0 .4em 0">${it.Nombre||""}</h2>
      <div style="color:#556;margin-bottom:10px"><b>${it.Categoria||""}</b> — ${it.Ciudad||""}, Sección ${it.Seccion||""}</div>
      <p>${it.Descripcion||""}</p>

      <div class="gallery" style="display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px">
        ${imgs.map(src=>`<img src="${src}" alt="" style="width:100%;border-radius:12px;display:block"
          onerror="this.style.display='none'">`).join("")}
      </div>

      <div class="cta" style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
        ${it.link_whatsapp ? `<a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/52${it.link_whatsapp.replace(/\D/g,'')}">WhatsApp</a>` : ``}
        ${it.link_pagina   ? `<a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="${it.link_pagina}">Página</a>` : ``}
      </div>
    </div>
  `;

  // back
  const back = box.querySelector(".back");
  back.addEventListener("click", (e)=>{
    e.preventDefault();
    renderList();
    attachListHandlers(); // reatachar eventos
  });

  // responsivo de la galería (2 columnas en ancho)
  const style = document.createElement("style");
  style.textContent = `
    @media (min-width:700px){
      .gallery{ grid-template-columns: repeat(2,1fr) !important; }
    }
  `;
  document.head.appendChild(style);
}

// =====================
// EVENTOS
// =====================
function attachListHandlers(){
  document.querySelectorAll('#results .btn[data-id]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      const id = a.getAttribute("data-id");
      const item = DATA.find(r => (r.Id||"") === id);
      if (item) renderDetail(item);
    });
  });
}

["searchInput","seccionFilter","ciudadFilter","categoriaFilter"].forEach(id=>{
  document.getElementById(id).addEventListener(id==="searchInput"?"input":"change", ()=>{
    renderList();
    attachListHandlers();
  });
});

// =====================
// INIT
// =====================
loadData();
