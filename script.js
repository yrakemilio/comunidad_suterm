// === CONFIG ===
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBAuMdD25rU-PCyLnn_6nOeb_NHRQtOHglGFL2QqMN7BD98JmWvJ1O2o6LkOjhwP0KCxYzTY_V3u9R/pub?gid=0&single=true&output=csv";

const SHOW_ALL_BY_DEFAULT = false; // si quieres mostrar todo aunque no haya filtros

// === STATE ===
let DATA = [];

// === FETCH Y PARSE ===
async function fetchData() {
  try {
    const res = await fetch(CSV_URL);
    const text = await res.text();
    const rows = text.split("\n").map((r) => r.split(","));

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    DATA = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i] ? row[i].trim() : ""));
      return obj;
    });

    renderOptions();
    renderResults();
  } catch (err) {
    console.error(err);
    document.querySelector("#results").innerHTML =
      "<p style='color:red'>⚠️ No se pudo cargar la base.</p>";
  }
}

// === RENDER DE OPCIONES ===
function renderOptions() {
  const seccionSelect = document.getElementById("filter-seccion");
  const ciudadSelect = document.getElementById("filter-ciudad");
  const categoriaSelect = document.getElementById("filter-categoria");

  const secciones = [...new Set(DATA.map((d) => d["seccion"]).filter(Boolean))];
  const ciudades = [...new Set(DATA.map((d) => d["ciudad"]).filter(Boolean))];
  const categorias = [...new Set(DATA.map((d) => d["categoria"]).filter(Boolean))];

  secciones.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    seccionSelect.appendChild(opt);
  });

  ciudades.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    ciudadSelect.appendChild(opt);
  });

  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoriaSelect.appendChild(opt);
  });
}

// === RENDER DE RESULTADOS ===
function renderResults() {
  const search = document
    .getElementById("search")
    .value.toLowerCase()
    .trim();
  const seccion = document.getElementById("filter-seccion").value;
  const ciudad = document.getElementById("filter-ciudad").value;
  const categoria = document.getElementById("filter-categoria").value;

  let filtered = DATA.filter((item) => {
    const matchSearch =
      !search ||
      item["nombre"].toLowerCase().includes(search) ||
      item["descripcion"].toLowerCase().includes(search);
    const matchSeccion = !seccion || item["seccion"] === seccion;
    const matchCiudad = !ciudad || item["ciudad"] === ciudad;
    const matchCategoria = !categoria || item["categoria"] === categoria;

    return matchSearch && matchSeccion && matchCiudad && matchCategoria;
  });

  if (!SHOW_ALL_BY_DEFAULT && !search && !seccion && !ciudad && !categoria) {
    filtered = [];
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (filtered.length === 0) {
    resultsDiv.innerHTML =
      "<p>No hay resultados. Intenta otra búsqueda o filtros.</p>";
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item["logo"] || "imagenes/default.png"}" alt="logo" class="logo">
      <h3>${item["nombre"]}</h3>
      <p><strong>${item["categoria"]}</strong> - ${item["ciudad"]}, Sección ${item["seccion"]}</p>
      <p>${item["descripcion"]}</p>
      <a href="detalle.html?id=${item["id"]}" class="btn">Ver más</a>
    `;

    resultsDiv.appendChild(card);
  });
}

// === EVENTOS ===
document.getElementById("search").addEventListener("input", renderResults);
document
  .getElementById("filter-seccion")
  .addEventListener("change", renderResults);
document
  .getElementById("filter-ciudad")
  .addEventListener("change", renderResults);
document
  .getElementById("filter-categoria")
  .addEventListener("change", renderResults);

// === INIT ===
fetchData();
