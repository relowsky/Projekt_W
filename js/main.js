import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ===== 1. Elementy interfejsu =====
const lengthInput = document.getElementById("boxLength");
const widthInput = document.getElementById("boxWidth");
const depthInput = document.getElementById("boxDepth");
const materialSelect = document.getElementById("boxMaterial");
const qtyInput = document.getElementById("boxQty");

const uploadBtn = document.getElementById("btnUpload");
const downloadBtn = document.getElementById("btnDownloadUV");
const uvPreview = document.getElementById("uvPreview");

const unitPriceEl = document.getElementById("unitPrice");
const totalPriceEl = document.getElementById("totalPrice");

const finishMatteBtn = document.getElementById("finishMatte");
const finishGlossyBtn = document.getElementById("finishGlossy");
const viewport = document.getElementById("viewport");

const langSelect = document.getElementById("langSelect");
const currencySelect = document.getElementById("currencySelect");
const mainEl = document.getElementById("main");
const templatesGrid = document.getElementById("templatesGrid");

const steps = [...document.querySelectorAll(".step")].filter((s) =>
  s.querySelector("b")
);

// ===== 2. Konfiguracja =====
const materialRates = [48, 56, 40];
const fixedSetupCost = 2.0;
const glossyExtraCharge = 0.1;

// Bazowa cena liczona w USD, przeliczana na wybraną walutę
const currencyRates = { PLN: 4.0, EUR: 0.92, USD: 1 };

let currentFinish = "matte";
let uploadedImageUrl = null;
let currentLang = localStorage.getItem("lang") || "pl";
let currentCurrency = localStorage.getItem("currency") || "PLN";

// ===== 2b. Tłumaczenia =====
const locales = { pl: "pl-PL", en: "en-GB", de: "de-DE" };

const i18n = {
  pl: {
    language: "Język",
    currency: "Waluta",
    profile: "Profil (Klienta)",
    tabBox: "Pudełko",
    tabGraphics: "Grafika",
    tabTemplates: "Szablony",
    tabMaterials: "Materiały",
    tabOrders: "Zamówienia",
    tabSettings: "Ustawienia",
    autoRotate: "Auto-Obrót",
    resetView: "Reset Widoku",
    h1: "1. Wymiary Pudełka (zewnętrzne)",
    length: "Długość (mm)",
    width: "Szerokość (mm)",
    depth: "Głębokość (mm)",
    material: "Materiał",
    mat0: "Tektura Fala E (Cienka)",
    mat1: "Tektura Fala B (Gruba)",
    mat2: "Papier Kraft (Brązowy)",
    matte: "Matowe",
    glossy: "Błyszczące",
    h2: "2. Projekt i Grafika",
    upload: "⬆ Wgraj Własną Grafikę",
    download: "💾 Pobierz Siatkę UV (.png)",
    uvPreview: "Podgląd Siatki UV w panelu",
    faceTop: "Góra",
    faceLeft: "Bok L",
    faceFront: "Przód",
    faceRight: "Bok P",
    faceBack: "Tył",
    faceBottom: "Spód",
    h3: "3. Podsumowanie i Zamówienie",
    qty: "Ilość (sztuk)",
    unitNet: "Cena jedn. (netto)",
    totalNet: "Razem (netto)",
    addToCart: "DODAJ DO KOSZYKA",
    pcs: "szt.",
    step1: "Wymiary",
    step2: "Projekt",
    step3: "Podgląd 3D",
    step4: "Zamówienie",
    help: "? Pomoc",
  },
  en: {
    language: "Language",
    currency: "Currency",
    profile: "Profile (Customer)",
    tabBox: "Box",
    tabGraphics: "Artwork",
    tabTemplates: "Templates",
    tabMaterials: "Materials",
    tabOrders: "Orders",
    tabSettings: "Settings",
    autoRotate: "Auto-Rotate",
    resetView: "Reset View",
    h1: "1. Box Dimensions (external)",
    length: "Length (mm)",
    width: "Width (mm)",
    depth: "Depth (mm)",
    material: "Material",
    mat0: "Corrugated E-Flute (Thin)",
    mat1: "Corrugated B-Flute (Thick)",
    mat2: "Kraft Paper (Brown)",
    matte: "Matte",
    glossy: "Glossy",
    h2: "2. Design & Artwork",
    upload: "⬆ Upload Your Artwork",
    download: "💾 Download UV Template (.png)",
    uvPreview: "UV Template Preview",
    faceTop: "Top",
    faceLeft: "Left",
    faceFront: "Front",
    faceRight: "Right",
    faceBack: "Back",
    faceBottom: "Bottom",
    h3: "3. Summary & Order",
    qty: "Quantity (pcs)",
    unitNet: "Unit price (net)",
    totalNet: "Total (net)",
    addToCart: "ADD TO CART",
    pcs: "pc.",
    step1: "Dimensions",
    step2: "Design",
    step3: "3D Preview",
    step4: "Order",
    help: "? Help",
  },
  de: {
    language: "Sprache",
    currency: "Währung",
    profile: "Profil (Kunde)",
    tabBox: "Karton",
    tabGraphics: "Grafik",
    tabTemplates: "Vorlagen",
    tabMaterials: "Materialien",
    tabOrders: "Bestellungen",
    tabSettings: "Einstellungen",
    autoRotate: "Auto-Drehung",
    resetView: "Ansicht zurücksetzen",
    h1: "1. Kartonmaße (außen)",
    length: "Länge (mm)",
    width: "Breite (mm)",
    depth: "Tiefe (mm)",
    material: "Material",
    mat0: "Wellpappe E-Welle (Dünn)",
    mat1: "Wellpappe B-Welle (Dick)",
    mat2: "Kraftpapier (Braun)",
    matte: "Matt",
    glossy: "Glänzend",
    h2: "2. Design & Grafik",
    upload: "⬆ Eigene Grafik hochladen",
    download: "💾 UV-Netz herunterladen (.png)",
    uvPreview: "UV-Netz Vorschau",
    faceTop: "Oben",
    faceLeft: "Links",
    faceFront: "Vorne",
    faceRight: "Rechts",
    faceBack: "Hinten",
    faceBottom: "Unten",
    h3: "3. Zusammenfassung & Bestellung",
    qty: "Menge (Stück)",
    unitNet: "Stückpreis (netto)",
    totalNet: "Gesamt (netto)",
    addToCart: "IN DEN WARENKORB",
    pcs: "Stk.",
    step1: "Maße",
    step2: "Design",
    step3: "3D-Vorschau",
    step4: "Bestellung",
    help: "? Hilfe",
  },
};

// Szablony pudełek (wymiary w mm)
const templates = [
  { L: 320, W: 230, H: 100, name: { pl: "Standard", en: "Standard", de: "Standard" } },
  { L: 200, W: 150, H: 50, name: { pl: "Małe płaskie", en: "Small flat", de: "Klein flach" } },
  { L: 300, W: 300, H: 100, name: { pl: "Kwadratowe", en: "Square", de: "Quadratisch" } },
  { L: 400, W: 300, H: 150, name: { pl: "Wysyłkowe M", en: "Shipping M", de: "Versand M" } },
  { L: 500, W: 350, H: 200, name: { pl: "Wysyłkowe L", en: "Shipping L", de: "Versand L" } },
  { L: 250, W: 250, H: 250, name: { pl: "Sześcian", en: "Cube", de: "Würfel" } },
  { L: 150, W: 100, H: 60, name: { pl: "Na kosmetyki", en: "Cosmetics", de: "Kosmetik" } },
  { L: 350, W: 250, H: 80, name: { pl: "Na odzież", en: "Apparel", de: "Bekleidung" } },
  { L: 220, W: 160, H: 40, name: { pl: "Na książki", en: "Books", de: "Bücher" } },
];

const t = (key) => i18n[currentLang][key] ?? key;

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  renderTemplates();
  calculatePrice();
}

// ===== 3. Scena 3D =====
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
const defaultCameraPos = new THREE.Vector3(3.5, 2.5, 4.5);
camera.position.copy(defaultCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
viewport.prepend(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(3, 5, 4);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.autoRotateSpeed = 2;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe6dccb });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

const boxEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(boxGeometry),
  new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.25,
  })
);
boxMesh.add(boxEdges);

function onResize() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(onResize).observe(viewport);
onResize();

// ===== 4. Układ siatki (wspólny dla 3D, miniatury i PNG) =====
function getDims() {
  return {
    L: Math.max(1, parseFloat(lengthInput.value) || 1),
    W: Math.max(1, parseFloat(widthInput.value) || 1),
    H: Math.max(1, parseFloat(depthInput.value) || 1),
  };
}

function computeNetLayout(L, W, H) {
  return {
    L,
    W,
    H,
    TW: 2 * W + 2 * L,
    TH: 2 * W + H,
    rects: {
      top: [W, 0, L, W],
      left: [0, W, W, H],
      front: [W, W, L, H],
      right: [W + L, W, W, H],
      back: [2 * W + L, W, L, H],
      bottom: [W, W + H, L, W],
    },
  };
}

function getNetLayout() {
  const { L, W, H } = getDims();
  return computeNetLayout(L, W, H);
}

// Kolejność ścian w BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
const faceOrder = ["right", "left", "top", "bottom", "front", "back"];

function updateBoxUV() {
  const { TW, TH, rects } = getNetLayout();
  const uv = boxGeometry.attributes.uv;

  faceOrder.forEach((name, f) => {
    const [x, y, w, h] = rects[name];
    for (let k = 0; k < 4; k++) {
      const ou = k % 2;
      const top = k < 2;
      const u = (x + ou * w) / TW;
      const v = 1 - (y + (top ? 0 : h)) / TH;
      uv.setXY(f * 4 + k, u, v);
    }
  });
  uv.needsUpdate = true;
}

// ===== 5. Aktualizacja modelu 3D =====
function updateBoxScale() {
  const { L, W, H } = getDims();
  const k = 3 / Math.max(L, W, H);
  boxMesh.scale.set(L * k, H * k, W * k);
  updateBoxUV();
}

function updateMaterialFinish() {
  if (currentFinish === "glossy") {
    boxMaterial.roughness = 0.12;
    boxMaterial.clearcoat = 1.0;
    boxMaterial.clearcoatRoughness = 0.05;
    boxMaterial.envMapIntensity = 1.2;
  } else {
    boxMaterial.roughness = 0.9;
    boxMaterial.clearcoat = 0.0;
    boxMaterial.envMapIntensity = 0.4;
  }
  boxMaterial.needsUpdate = true;
}

function applyTextureToBox() {
  if (!uploadedImageUrl) return;
  new THREE.TextureLoader().load(uploadedImageUrl, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (boxMaterial.map) boxMaterial.map.dispose();
    boxMaterial.map = texture;
    boxMaterial.color.set(0xffffff);
    boxMaterial.needsUpdate = true;
  });
}

// ===== 6. Pętla renderowania =====
(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();

// ===== 7. Przyciski podglądu 3D =====
function zoomByFactor(factor) {
  const offset = camera.position.clone().sub(controls.target);
  offset.multiplyScalar(factor);
  offset.setLength(
    THREE.MathUtils.clamp(
      offset.length(),
      controls.minDistance,
      controls.maxDistance
    )
  );
  camera.position.copy(controls.target).add(offset);
}

document.getElementById("btnPlus").onclick = () => zoomByFactor(0.8);
document.getElementById("btnMinus").onclick = () => zoomByFactor(1.25);

const rotateBtn = document.getElementById("btnRotate");
rotateBtn.onclick = () => {
  controls.autoRotate = !controls.autoRotate;
  rotateBtn.classList.toggle("active", controls.autoRotate);
};

document.getElementById("btnReset").onclick = () => {
  camera.position.copy(defaultCameraPos);
  controls.target.set(0, 0, 0);
  controls.autoRotate = false;
  rotateBtn.classList.remove("active");
};

// ===== 8. Cena =====
function calculatePrice() {
  const { L, W, H } = getDims();
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);

  const areaM2 = (2 * (L * W + L * H + W * H)) / 1000000;
  let unit =
    areaM2 * materialRates[parseInt(materialSelect.value)] + fixedSetupCost;

  if (currentFinish === "glossy") unit *= 1 + glossyExtraCharge;

  let discount = 0;
  if (qty >= 1000) discount = 0.15;
  else if (qty >= 500) discount = 0.08;
  else if (qty >= 100) discount = 0.03;
  unit *= 1 - discount;

  const unitConverted = unit * currencyRates[currentCurrency];
  const fmt = new Intl.NumberFormat(locales[currentLang], {
    style: "currency",
    currency: currentCurrency,
  });

  unitPriceEl.textContent = `${fmt.format(unitConverted)} / ${t("pcs")}`;
  totalPriceEl.textContent = fmt.format(unitConverted * qty);
}

// ===== 9. Miniatura UV w panelu =====
function updateUVPreviewLayout() {
  const { L, W, H, TW, TH } = getNetLayout();
  uvPreview.style.gridTemplateColumns = `${W}fr ${L}fr ${W}fr ${L}fr`;
  uvPreview.style.gridTemplateRows = `${W}fr ${H}fr ${W}fr`;
  uvPreview.style.height = "auto";
  uvPreview.style.aspectRatio = `${TW} / ${TH}`;
}

function applyUploadedImageToUVPreview() {
  if (!uploadedImageUrl) return;

  const { TW, TH, rects } = getNetLayout();
  const map = {
    ".face-top": rects.top,
    ".face-ls": rects.left,
    ".face-front": rects.front,
    ".face-rs": rects.right,
    ".face-back": rects.back,
    ".face-bottom": rects.bottom,
  };

  for (const [selector, [x, y, w, h]] of Object.entries(map)) {
    const face = uvPreview.querySelector(selector);
    face.style.backgroundImage = `url(${uploadedImageUrl})`;
    face.style.backgroundRepeat = "no-repeat";
    face.style.backgroundSize = `${(TW / w) * 100}% ${(TH / h) * 100}%`;
    face.style.backgroundPosition = `${(x / (TW - w)) * 100}% ${
      (y / (TH - h)) * 100
    }%`;
    face.style.color = "transparent";
    face.style.borderColor = "transparent";
  }
}

// ===== 10. Wgrywanie grafiki =====
const hiddenFileInput = document.createElement("input");
hiddenFileInput.type = "file";
hiddenFileInput.accept = "image/*";
hiddenFileInput.style.display = "none";
document.body.appendChild(hiddenFileInput);

uploadBtn.addEventListener("click", () => hiddenFileInput.click());

hiddenFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageUrl = URL.createObjectURL(file);

  applyUploadedImageToUVPreview();
  applyTextureToBox();
});

// ===== 11. Mat / połysk =====
function setFinish(finish) {
  currentFinish = finish;
  finishMatteBtn.classList.toggle("active", finish === "matte");
  finishGlossyBtn.classList.toggle("active", finish === "glossy");
  updateMaterialFinish();
  calculatePrice();
}
finishMatteBtn.onclick = () => setFinish("matte");
finishGlossyBtn.onclick = () => setFinish("glossy");

// ===== 12. Kroki na dole =====
steps.forEach((step) => {
  step.style.cursor = "pointer";
  step.addEventListener("click", () => {
    steps.forEach((s) => s.classList.remove("active"));
    step.classList.add("active");
  });
});

// ===== 13. Reakcja na zmiany pól =====
function refreshAll() {
  calculatePrice();
  updateUVPreviewLayout();
  updateBoxScale();
  applyUploadedImageToUVPreview();
}

[lengthInput, widthInput, depthInput, materialSelect, qtyInput].forEach(
  (input) => input.addEventListener("input", refreshAll)
);

// ===== 14. Pobieranie szablonu UV (PNG) =====
function downloadUV() {
  const { L, W, H, TW, TH, rects } = getNetLayout();

  const scale = 10; // 1 mm = 10 px
  const canvas = document.createElement("canvas");
  canvas.width = TW * scale;
  canvas.height = TH * scale;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.setLineDash([25, 15]);

  const labels = {
    top: t("faceTop"),
    left: t("faceLeft"),
    front: t("faceFront"),
    right: t("faceRight"),
    back: t("faceBack"),
    bottom: t("faceBottom"),
  };

  ctx.fillStyle = "#9ca3af";
  ctx.font = `${Math.min(W, H) * scale * 0.2}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const [name, [x, y, w, h]] of Object.entries(rects)) {
    ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
    ctx.fillText(
      labels[name].toUpperCase(),
      (x + w / 2) * scale,
      (y + h / 2) * scale
    );
  }

  const link = document.createElement("a");
  link.download = `szablon-uv-${L}x${W}x${H}mm.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
downloadBtn.addEventListener("click", downloadUV);

// ===== 15. Zakładki (sidebar) =====
const tabButtons = [...document.querySelectorAll(".sidebar button")];

function switchTab(tab) {
  tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  mainEl.classList.toggle("templates-mode", tab === "templates");
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    if (tab === "box" || tab === "templates") switchTab(tab);
  });
});

// ===== 16. Szablony =====
function drawNet(canvas, L, W, H) {
  const { TW, TH, rects } = computeNetLayout(L, W, H);
  const pad = 14;
  const cw = 480;
  const scale = (cw - pad * 2) / TW;
  canvas.width = cw;
  canvas.height = Math.round(TH * scale + pad * 2);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 5]);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const names = {
    top: "faceTop",
    left: "faceLeft",
    front: "faceFront",
    right: "faceRight",
    back: "faceBack",
    bottom: "faceBottom",
  };

  for (const [name, [x, y, w, h]] of Object.entries(rects)) {
    const px = pad + x * scale;
    const py = pad + y * scale;
    ctx.strokeRect(px, py, w * scale, h * scale);
    ctx.fillText(t(names[name]), px + (w * scale) / 2, py + (h * scale) / 2);
  }
}

function renderTemplates() {
  templatesGrid.innerHTML = "";
  templates.forEach((tpl) => {
    const card = document.createElement("button");
    card.className = "tpl-card";
    card.type = "button";

    const canvas = document.createElement("canvas");
    drawNet(canvas, tpl.L, tpl.W, tpl.H);

    const name = document.createElement("div");
    name.className = "tpl-name";
    name.textContent = tpl.name[currentLang];

    const dim = document.createElement("div");
    dim.className = "tpl-dim";
    dim.textContent = `${tpl.L} × ${tpl.W} × ${tpl.H} mm`;

    const thumb = document.createElement("div");
    thumb.className = "tpl-thumb";
    thumb.appendChild(canvas);
    card.append(thumb, name, dim);
}

function applyTemplate(tpl) {
  lengthInput.value = tpl.L;
  widthInput.value = tpl.W;
  depthInput.value = tpl.H;
  refreshAll();
  switchTab("box");
}

// ===== 17. Język i waluta =====
langSelect.value = currentLang;
currencySelect.value = currentCurrency;

langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  localStorage.setItem("lang", currentLang);
  applyLanguage();
});

currencySelect.addEventListener("change", () => {
  currentCurrency = currencySelect.value;
  localStorage.setItem("currency", currentCurrency);
  calculatePrice();
});

// ===== 18. Start =====
applyLanguage();
updateUVPreviewLayout();
updateBoxScale();
updateMaterialFinish();
