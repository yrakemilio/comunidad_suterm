/// ⚠️ Cambia por tu URL pública CSV
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/TU-ID/export?format=csv";
const $ = (s)=>document.querySelector(s);

function getParam(name){ return new URL(location.href).searchParams.get(name); }
function parseCSV(text){
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h=>h.trim().toLowerCase());
  return lines.map(l=>{
    const cells = l.split(",");
    const obj={}; headers.forEach((h,i)=>obj[h]=cells[i]?.trim()); return obj;
  });
}

function render(row){
  $("#detailLogo").src = row.logo || "";
  $("#detailName").textContent = row.nombre;
  $("#detailMeta").textContent = [row.categoria,row.ciudad,row.seccion].filter(Boolean).join(" • ");
  $("#detailDesc").textContent = row.descripcion;
  $("#btnWhatsApp").href = row.whatsapp || "#";
  $("#btnWeb").href = row.pagina || "#";
  let imgs=[row.imagen1,row.imagen2,row.imagen3,row.imagen4,row.imagen5].filter(Boolean);
  $("#detailGallery").innerHTML = imgs.map((src,i)=>`<img src="${src}" alt="Foto ${i+1}">`).join("");
  $("#detailLoading").classList.add("hidden");
  $("#detail").classList.remove("hidden");
}

async function load(){
  const id=getParam("id");
  if(!id){ $("#detailError").classList.remove("hidden"); return; }
  try{
    const res=await fetch(SHEET_CSV_URL);
    const text=await res.text();
    const rows=parseCSV(text);
    const row=rows.find(r=>r.id===id);
    if(!row) throw "No encontrado";
    render(row);
  }catch(e){
    console.error(e);
    $("#detailLoading").classList.add("hidden");
    $("#detailError").classList.remove("hidden");
  }
}
load();
