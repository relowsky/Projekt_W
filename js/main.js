// ===== 1. Elementy interfejsu =====
const $ = (id) => document.getElementById(id);

const lengthInput = $("boxLength");
const widthInput = $("boxWidth");
const depthInput = $("boxDepth");
const materialSelect = $("boxMaterial");
const qtyInput = $("boxQty");
const uploadBtn = $("btnUpload");
const downloadBtn = $("btnDownloadUV");
const uvPreview = $("uvPreview");
const unitPriceEl = $("unitPrice");
const totalPriceEl = $("totalPrice");
const finishMatteBtn = $("finishMatte");
const finishGlossyBtn = $("finishGlossy");
const viewport = $("viewport");
const langSelect = $("langSelect");
const currencySelect = $("currencySelect");
const mainEl = $("main");
const templatesGrid = $("templatesGrid");
const rotateBtn = $("btnRotate");

const steps = [...document.querySelectorAll(".step")].filter((s) =>
  s.querySelector("b")
);

// ===== 2. Konfiguracja =====
const materialRates = [48, 56, 40];
const fixedSetupCost = 2.0;
const glossyExtraCharge = 0.1;

// Cena bazowa liczona w USD, przeliczana na wybraną walutę
const currencyRates = { PLN: 4.0, EUR: 0.92, USD: 1 };
const locales = { pl: "pl-PL", en: "en-GB", de: "de-DE" };

let currentFinish = "matte";
let uploadedImageUrl = null;
let currentLang = localStorage.getItem("lang") || "pl";
let currentCurrency = localStorage.getItem("currency") || "PLN";
if (!locales[currentLang]) currentLang = "pl";
if (!currencyRates[currentCurrency]) currentCurrency = "PLN";

let viewer = null; // API sceny 3D (null, jeśli 3D się nie załadowało)

// ===== 3. Tłumaczenia =====
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

const t = (key) => (i18n[currentLang] && i18n[currentLang][key]) || key;

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

// ===== 4. Wymiary i układ siatki UV =====
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

// ===== 5. Język =====
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

// ===== 6. Cena =====
function calculatePrice() {
  const { L, W, H } = getDims();
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);

  const areaM2 = (2 * (L * W + L * H + W * H)) / 1000000;
  let unit =
    areaM2 * materialRates[parseInt(materialSelect.value) || 0] +
    fixedSetupCost;

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

// ===== 7. Miniatura UV w panelu =====
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
    if (!face) continue;
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

// ===== 8. Odświeżanie wszystkiego po zmianie pól =====
function refreshAll() {
  calculatePrice();
  updateUVPreviewLayout();
  applyUploadedImageToUVPreview();
  if (viewer) viewer.updateBox(getNetLayout());
}

[lengthInput, widthInput, depthInput, materialSelect, qtyInput].forEach(
  (input) => input.addEventListener("input", refreshAll)
);

// ===== 9. Mat / połysk =====
function setFinish(finish) {
  currentFinish = finish;
  finishMatteBtn.classList.toggle("active", finish === "matte");
  finishGlossyBtn.classList.toggle("active", finish === "glossy");
  if (viewer) viewer.setFinish(finish);
  calculatePrice();
}
finishMatteBtn.addEventListener("click", () => setFinish("matte"));
finishGlossyBtn.addEventListener("click", () => setFinish("glossy"));

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
  if (viewer) viewer.setTexture(uploadedImageUrl);
});

// ===== 11. Pobieranie siatki UV (PNG) =====
downloadBtn.addEventListener("click", () => {
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
});

// ===== 12. Kroki na dole =====
steps.forEach((step) => {
  step.style.cursor = "pointer";
  step.addEventListener("click", () => {
    steps.forEach((s) => s.classList.remove("active"));
    step.classList.add("active");
  });
});

// ===== 13. Zakładki (sidebar) =====
const tabButtons = [...document.querySelectorAll(".sidebar button")];

function switchTab(tab) {
  tabButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );
  mainEl.classList.toggle("templates-mode", tab === "templates");
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    if (tab === "box" || tab === "templates") switchTab(tab);
  });
});

// ===== 14. Szablony =====
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

    const thumb = document.createElement("div");
    thumb.className = "tpl-thumb";
    thumb.appendChild(canvas);

    const name = document.createElement("div");
    name.className = "tpl-name";
    name.textContent = tpl.name[currentLang];

    const dim = document.createElement("div");
    dim.className = "tpl-dim";
    dim.textContent = `${tpl.L} × ${tpl.W} × ${tpl.H} mm`;

    card.append(thumb, name, dim);
    card.addEventListener("click", () => applyTemplate(tpl));
    templatesGrid.appendChild(card);
  });
}

function applyTemplate(tpl) {
  lengthInput.value = tpl.L;
  widthInput.value = tpl.W;
  depthInput.value = tpl.H;
  refreshAll();
  switchTab("box");
}

// ===== 15. Język i waluta =====
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

// ===== 16. Scena 3D (ładowana osobno, żeby błąd nie psuł reszty) =====
async function init3D() {
  const THREE = await import("three");
  const { OrbitControls } = await import(
    "three/addons/controls/OrbitControls.js"
  );
  const { RoomEnvironment } = await import(
    "three/addons/environments/RoomEnvironment.js"
  );

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const defaultCameraPos = new THREE.Vector3(3.5, 2.5, 4.5);
  camera.position.copy(defaultCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewport.prepend(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(3, 5, 4);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2;
  controls.maxDistance = 15;
  controls.autoRotateSpeed = 2;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xe6dccb });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.25,
      })
    )
  );

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

  // Kolejność ścian w BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
  const faceOrder = ["right", "left", "top", "bottom", "front", "back"];

  function updateBox({ L, W, H, TW, TH, rects }) {
    const k = 3 / Math.max(L, W, H);
    mesh.scale.set(L * k, H * k, W * k);

    const uv = geometry.attributes.uv;
    faceOrder.forEach((name, f) => {
      const [x, y, w, h] = rects[name];
      for (let i = 0; i < 4; i++) {
        const u = (x + (i % 2) * w) / TW;
        const v = 1 - (y + (i < 2 ? 0 : h)) / TH;
        uv.setXY(f * 4 + i, u, v);
      }
    });
    uv.needsUpdate = true;
  }

  function setFinish(finish) {
    if (finish === "glossy") {
      material.roughness = 0.12;
      material.clearcoat = 1.0;
      material.clearcoatRoughness = 0.05;
      material.envMapIntensity = 1.2;
    } else {
      material.roughness = 0.9;
      material.clearcoat = 0.0;
      material.envMapIntensity = 0.4;
    }
    material.needsUpdate = true;
  }

  function setTexture(url) {
    new THREE.TextureLoader().load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (material.map) material.map.dispose();
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    });
  }

  function zoom(factor) {
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

  function toggleRotate() {
    controls.autoRotate = !controls.autoRotate;
    return controls.autoRotate;
  }

  function resetView() {
    camera.position.copy(defaultCameraPos);
    controls.target.set(0, 0, 0);
    controls.autoRotate = false;
  }

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();

  return { updateBox, setFinish, setTexture, zoom, toggleRotate, resetView };
}

// Przyciski widoku 3D
$("btnPlus").addEventListener("click", () => viewer && viewer.zoom(0.8));
$("btnMinus").addEventListener("click", () => viewer && viewer.zoom(1.25));
rotateBtn.addEventListener("click", () => {
  if (!viewer) return;
  rotateBtn.classList.toggle("active", viewer.toggleRotate());
});
$("btnReset").addEventListener("click", () => {
  if (!viewer) return;
  viewer.resetView();
  rotateBtn.classList.remove("active");
});

// ===== Popup pomocy =====
const helpOverlay = $("helpOverlay");

function openHelp() {
  helpOverlay.classList.add("active");
  helpOverlay.setAttribute("aria-hidden", "false");
  $("helpClose").focus();
}

function closeHelp() {
  helpOverlay.classList.remove("active");
  helpOverlay.setAttribute("aria-hidden", "true");
}

$("btnHelp").addEventListener("click", openHelp);
$("helpClose").addEventListener("click", closeHelp);
helpOverlay.addEventListener("click", (e) => {
  if (e.target === helpOverlay) closeHelp();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeHelp();
});

// ===== 17. Start =====
applyLanguage();
updateUVPreviewLayout();

init3D()
  .then((api) => {
    viewer = api;
    viewer.setFinish(currentFinish);
    viewer.updateBox(getNetLayout());
    if (uploadedImageUrl) viewer.setTexture(uploadedImageUrl);
  })
  .catch((err) => {
    console.error("Nie udało się uruchomić widoku 3D:", err);
  });
