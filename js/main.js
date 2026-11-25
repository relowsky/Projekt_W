// ===== 1. Pomocnicze =====
const $ = (id) => document.getElementById(id);
const num = (id) => parseFloat($(id).value) || 0;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const lengthInput = $("boxLength");
const widthInput = $("boxWidth");
const depthInput = $("boxDepth");
const materialSelect = $("boxMaterial");
const qtyInput = $("boxQty");
const unitPriceEl = $("unitPrice");
const totalPriceEl = $("totalPrice");
const viewport = $("viewport");
const uvCanvas = $("uvCanvas");
const mainEl = $("main");
const templatesGrid = $("templatesGrid");
const rotateBtn = $("btnRotate");
const winEnabled = $("winEnabled");
const foilEnabled = $("foilEnabled");

// ===== 2. Konfiguracja =====
const materialRates = [48, 56, 40];
const fixedSetupCost = 2.0;
const glossyExtraCharge = 0.1;
const currencyRates = { PLN: 4.0, EUR: 0.92, USD: 1 };
const locales = { pl: "pl-PL", en: "en-GB", de: "de-DE" };

const baseColors = ["#e9e1d2", "#d8c8a6", "#b88a5a"];
const foilPalettes = {
  gold: ["#fff1b8", "#d4a82a", "#8a6414", "#f5d76e"],
  silver: ["#ffffff", "#b8bcc4", "#6e737c", "#e8eaee"],
  rose: ["#ffe0d6", "#d99a86", "#8f5546", "#f1c0b0"],
};

let currentFinish = "matte";
let artwork = null;
let foilArtwork = null;
let foilArtworkUrl = null;
let uploadedImageUrl = null;
let viewMode = "3d";
let currentLang = localStorage.getItem("lang") || "pl";
let currentCurrency = localStorage.getItem("currency") || "PLN";
let currentTheme = localStorage.getItem("theme") || "light";
if (!locales[currentLang]) currentLang = "pl";
if (!currencyRates[currentCurrency]) currentCurrency = "PLN";

let viewer = null;

// ===== 3. Tłumaczenia =====
const i18n = {
  pl: {
    account: "Moje konto",
    navView: "Podgląd 3D",
    navTemplates: "Szablony",
    navProjects: "Projekty",
    navSettings: "Ustawienia",
    navHelp: "Pomoc",
    promoTitle: "Twórz idealne opakowania",
    promoSub: "Szybko · Precyzyjnie · Online",
    contact: "Skontaktuj się",
    hint: "Obracaj, przybliżaj i przesuwaj model",
    autoRotate: "Auto-obrót",
    resetView: "Reset widoku",
    fullscreen: "Pełny ekran",
    hDims: "Wymiary pudełka",
    length: "Długość (mm)",
    width: "Szerokość (mm)",
    depth: "Głębokość (mm)",
    boxType: "Rodzaj pudełka",
    typeFason: "Pudełko fasonowe",
    typeFlap: "Pudełko klapowe",
    material: "Materiał",
    mat0: "Tektura Fala E (Cienka)",
    mat1: "Tektura Fala B (Gruba)",
    mat2: "Papier Kraft (Brązowy)",
    matte: "Matowe",
    glossy: "Błyszczące",
    hShape: "Kształt i zaokrąglenia",
    edgeRadius: "Zaokrąglenie krawędzi (mm)",
    hWindow: "Okienko",
    winEnable: "Dodaj okienko",
    winFace: "Ściana",
    winShape: "Kształt",
    shapeRounded: "Zaokrąglone",
    shapeRect: "Prostokąt",
    shapeOval: "Owal",
    winW: "Szer. (mm)",
    winH: "Wys. (mm)",
    winX: "Przesun. X (mm)",
    winY: "Przesun. Y (mm)",
    winR: "Promień (mm)",
    winFilm: "Folia okienkowa (PET)",
    hFoil: "Złocenie",
    foilEnable: "Dodaj złocenie",
    foilText: "Tekst / logo",
    foilFace: "Ściana",
    foilColor: "Kolor folii",
    foilSize: "Rozmiar (%)",
    foilGold: "Złoto",
    foilSilver: "Srebro",
    foilRose: "Różowe złoto",
    foilFrame: "Złota ramka wokół okienka",
    foilMapDl: "Pobierz mapę złocenia (.png)",
    foilNone: "Najpierw włącz złocenie.",
    hDesign: "Projekt i grafika",
    downloadT: "Pobierz wzór",
    uploadT: "Wgraj własny projekt",
    uploadSub: "lub wybierz z galerii",
    hSummary: "Podsumowanie i zamówienie",
    qty: "Ilość sztuk:",
    unitNet: "Cena jedn. (netto)",
    totalNet: "Razem (netto):",
    addToCart: "DODAJ DO KOSZYKA",
    pcs: "szt.",
    faceTop: "Góra",
    faceLeft: "Bok L",
    faceFront: "Przód",
    faceRight: "Bok P",
    faceBack: "Tył",
    faceBottom: "Spód",
    helpTitle: "Informacja",
    helpText: "To jest wersja testowa aplikacji.",
    soonText: "Ta sekcja będzie dostępna wkrótce.",
    cartText: "Dodano do koszyka (wersja testowa).",
    close: "Zamknij",
  },
  en: {
    account: "My account",
    navView: "3D View",
    navTemplates: "Templates",
    navProjects: "Projects",
    navSettings: "Settings",
    navHelp: "Help",
    promoTitle: "Create perfect packaging",
    promoSub: "Fast · Precise · Online",
    contact: "Contact us",
    hint: "Rotate, zoom and pan the model",
    autoRotate: "Auto-rotate",
    resetView: "Reset view",
    fullscreen: "Fullscreen",
    hDims: "Box dimensions",
    length: "Length (mm)",
    width: "Width (mm)",
    depth: "Depth (mm)",
    boxType: "Box type",
    typeFason: "Shaped box",
    typeFlap: "Flap box",
    material: "Material",
    mat0: "Corrugated E-Flute (Thin)",
    mat1: "Corrugated B-Flute (Thick)",
    mat2: "Kraft Paper (Brown)",
    matte: "Matte",
    glossy: "Glossy",
    hShape: "Shape & rounding",
    edgeRadius: "Edge radius (mm)",
    hWindow: "Window",
    winEnable: "Add window",
    winFace: "Face",
    winShape: "Shape",
    shapeRounded: "Rounded",
    shapeRect: "Rectangle",
    shapeOval: "Oval",
    winW: "Width (mm)",
    winH: "Height (mm)",
    winX: "Offset X (mm)",
    winY: "Offset Y (mm)",
    winR: "Radius (mm)",
    winFilm: "Window film (PET)",
    hFoil: "Hot-foil stamping",
    foilEnable: "Add foil",
    foilText: "Text / logo",
    foilFace: "Face",
    foilColor: "Foil colour",
    foilSize: "Size (%)",
    foilGold: "Gold",
    foilSilver: "Silver",
    foilRose: "Rose gold",
    foilFrame: "Foil frame around window",
    foilMapDl: "Download foil map (.png)",
    foilNone: "Enable foil stamping first.",
    hDesign: "Design & artwork",
    downloadT: "Download template",
    uploadT: "Upload your design",
    uploadSub: "or choose from gallery",
    hSummary: "Summary & order",
    qty: "Quantity:",
    unitNet: "Unit price (net)",
    totalNet: "Total (net):",
    addToCart: "ADD TO CART",
    pcs: "pc.",
    faceTop: "Top",
    faceLeft: "Left",
    faceFront: "Front",
    faceRight: "Right",
    faceBack: "Back",
    faceBottom: "Bottom",
    helpTitle: "Information",
    helpText: "This is a test version of the application.",
    soonText: "This section will be available soon.",
    cartText: "Added to cart (test version).",
    close: "Close",
  },
  de: {
    account: "Mein Konto",
    navView: "3D-Ansicht",
    navTemplates: "Vorlagen",
    navProjects: "Projekte",
    navSettings: "Einstellungen",
    navHelp: "Hilfe",
    promoTitle: "Perfekte Verpackungen gestalten",
    promoSub: "Schnell · Präzise · Online",
    contact: "Kontakt",
    hint: "Modell drehen, zoomen und verschieben",
    autoRotate: "Auto-Drehung",
    resetView: "Ansicht zurücksetzen",
    fullscreen: "Vollbild",
    hDims: "Kartonmaße",
    length: "Länge (mm)",
    width: "Breite (mm)",
    depth: "Tiefe (mm)",
    boxType: "Kartonart",
    typeFason: "Faltschachtel",
    typeFlap: "Klappkarton",
    material: "Material",
    mat0: "Wellpappe E-Welle (Dünn)",
    mat1: "Wellpappe B-Welle (Dick)",
    mat2: "Kraftpapier (Braun)",
    matte: "Matt",
    glossy: "Glänzend",
    hShape: "Form & Rundungen",
    edgeRadius: "Kantenradius (mm)",
    hWindow: "Fenster",
    winEnable: "Fenster hinzufügen",
    winFace: "Seite",
    winShape: "Form",
    shapeRounded: "Abgerundet",
    shapeRect: "Rechteck",
    shapeOval: "Oval",
    winW: "Breite (mm)",
    winH: "Höhe (mm)",
    winX: "Versatz X (mm)",
    winY: "Versatz Y (mm)",
    winR: "Radius (mm)",
    winFilm: "Fensterfolie (PET)",
    hFoil: "Heißfolienprägung",
    foilEnable: "Folie hinzufügen",
    foilText: "Text / Logo",
    foilFace: "Seite",
    foilColor: "Folienfarbe",
    foilSize: "Größe (%)",
    foilGold: "Gold",
    foilSilver: "Silber",
    foilRose: "Roségold",
    foilFrame: "Folienrahmen ums Fenster",
    foilMapDl: "Folienkarte herunterladen (.png)",
    foilNone: "Aktivieren Sie zuerst die Folienprägung.",
    hDesign: "Design & Grafik",
    downloadT: "Vorlage herunterladen",
    uploadT: "Eigenes Design hochladen",
    uploadSub: "oder aus Galerie wählen",
    hSummary: "Zusammenfassung & Bestellung",
    qty: "Menge:",
    unitNet: "Stückpreis (netto)",
    totalNet: "Gesamt (netto):",
    addToCart: "IN DEN WARENKORB",
    pcs: "Stk.",
    faceTop: "Oben",
    faceLeft: "Links",
    faceFront: "Vorne",
    faceRight: "Rechts",
    faceBack: "Hinten",
    faceBottom: "Unten",
    helpTitle: "Information",
    helpText: "Dies ist eine Testversion der Anwendung.",
    soonText: "Dieser Bereich ist bald verfügbar.",
    cartText: "In den Warenkorb gelegt (Testversion).",
    close: "Schließen",
  },
};
const t = (key) => (i18n[currentLang] && i18n[currentLang][key]) || key;

const templates = [
  { L: 200, W: 150, H: 100, name: { pl: "Standard", en: "Standard", de: "Standard" } },
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

function faceSize(face) {
  const { L, W, H } = getDims();
  if (face === "top" || face === "bottom") return [L, W];
  if (face === "left" || face === "right") return [W, H];
  return [L, H];
}

// ===== 5. Okienko, złocenie, malowanie powierzchni =====
function getWindow() {
  const face = $("winFace").value;
  const [fw, fh] = faceSize(face);
  const w = clamp(num("winW"), 5, Math.max(5, fw - 10));
  const h = clamp(num("winH"), 5, Math.max(5, fh - 10));
  const mx = Math.max(0, (fw - w) / 2 - 5);
  const my = Math.max(0, (fh - h) / 2 - 5);
  return {
    enabled: winEnabled.checked,
    film: $("winFilm").checked,
    face,
    shape: $("winShape").value,
    w,
    h,
    x: clamp(num("winX"), -mx, mx),
    y: clamp(num("winY"), -my, my),
    r: clamp(num("winR"), 0, Math.min(w, h) / 2),
  };
}

function getFoil() {
  return {
    enabled: foilEnabled.checked,
    text: $("foilText").value.trim(),
    face: $("foilFace").value,
    color: $("foilColor").value,
    size: num("foilSize"),
    frame: $("foilFrame").checked,
  };
}

// s = px na mm, grow = powiększenie w mm
function windowPath(ctx, win, rects, s, grow = 0) {
  const [x, y, w, h] = rects[win.face];
  const cx = (x + w / 2 + win.x) * s;
  const cy = (y + h / 2 - win.y) * s;
  const ww = (win.w + grow * 2) * s;
  const hh = (win.h + grow * 2) * s;
  ctx.beginPath();
  if (win.shape === "oval") {
    ctx.ellipse(cx, cy, ww / 2, hh / 2, 0, 0, Math.PI * 2);
  } else {
    const r = win.shape === "rounded" ? (win.r + grow) * s : 0;
    ctx.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, r);
  }
}

// Rysuje kształty złocenia aktualnym fillStyle / strokeStyle
function drawFoilShapes(ctx, layout, s, win, foil) {
  const [x, y, w, h] = layout.rects[foil.face];
  if (foil.text) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let fs = h * s * (foil.size / 100);
    ctx.font = `700 ${fs}px sans-serif`;
    const maxW = w * s * 0.9;
    const mw = ctx.measureText(foil.text).width;
    if (mw > maxW) {
      fs *= maxW / mw;
      ctx.font = `700 ${fs}px sans-serif`;
    }
    ctx.fillText(foil.text, (x + w / 2) * s, (y + h / 2) * s);
  }
  if (foil.frame && win.enabled) {
    ctx.lineWidth = 2.5 * s;
    windowPath(ctx, win, layout.rects, s, 4);
    ctx.stroke();
  }
}

// Zamienia obrazek na maskę: czarne/nieprzezroczyste = złocenie
let maskCache = { img: null, w: 0, h: 0, canvas: null };
function makeFoilMask(img, w, h) {
  if (maskCache.img === img && maskCache.w === w && maskCache.h === h) {
    return maskCache.canvas;
  }
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const lum = (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) / 255;
    p[i] = p[i + 1] = p[i + 2] = 0;
    p[i + 3] = Math.round(p[i + 3] * (1 - lum));
  }
  ctx.putImageData(d, 0, 0);
  maskCache = { img, w, h, canvas: cv };
  return cv;
}

// Maluje mapy: kolor, alfa (dziury), ORM (G = roughness, B = metalness), szybka
function paintSurface(layout) {
  const { TW, TH, rects } = layout;
  const s = Math.min(8, 2048 / TW);
  const cw = Math.round(TW * s);
  const ch = Math.round(TH * s);
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    return c;
  };
  const color = mk();
  const alpha = mk();
  const orm = mk();
  const c = color.getContext("2d");
  const a = alpha.getContext("2d");
  const o = orm.getContext("2d");
  const glass = mk();
  const g = glass.getContext("2d");

  c.fillStyle = baseColors[parseInt(materialSelect.value) || 0];
  c.fillRect(0, 0, cw, ch);
  if (artwork && artwork.complete) c.drawImage(artwork, 0, 0, cw, ch);
  a.fillStyle = "#fff";
  a.fillRect(0, 0, cw, ch);
  o.fillStyle = "rgb(255,255,0)"; // matowy, niemetaliczny
  o.fillRect(0, 0, cw, ch);
  g.fillStyle = "#000";
  g.fillRect(0, 0, cw, ch);

  const win = getWindow();
  const foil = getFoil();

  if (foil.enabled) {
    const grad = c.createLinearGradient(0, 0, cw, ch);
    foilPalettes[foil.color].forEach((col, i, arr) =>
      grad.addColorStop(i / (arr.length - 1), col)
    );
    c.fillStyle = c.strokeStyle = grad;
    drawFoilShapes(c, layout, s, win, foil);
    o.fillStyle = o.strokeStyle = "rgb(255,70,255)"; // gładki metal
    drawFoilShapes(o, layout, s, win, foil);
    if (foilArtwork && foilArtwork.complete) {
      const mask = makeFoilMask(foilArtwork, cw, ch);
      const tint = (fill) => {
        const tmp = mk();
        const tc = tmp.getContext("2d");
        tc.fillStyle = fill;
        tc.fillRect(0, 0, cw, ch);
        tc.globalCompositeOperation = "destination-in";
        tc.drawImage(mask, 0, 0);
        return tmp;
      };
      c.drawImage(tint(grad), 0, 0);
      o.drawImage(tint("rgb(255,70,255)"), 0, 0);
    }
  }

  const hasGlass = win.enabled && win.film;
  if (win.enabled) {
    a.fillStyle = "#000"; // dziura
    windowPath(a, win, rects, s);
    a.fill();
  }
  if (hasGlass) {
    g.fillStyle = "#fff"; // tu będzie szybka
    windowPath(g, win, rects, s);
    g.fill();
  }

  return { color, alpha, orm, glass, hasGlass };
}

// ===== 6. Rysowanie siatki (UV, pobieranie, szablony) =====
const faceKeys = {
  top: "faceTop",
  left: "faceLeft",
  front: "faceFront",
  right: "faceRight",
  back: "faceBack",
  bottom: "faceBottom",
};

function drawNetOverlay(ctx, layout, s, opts) {
  const { rects } = layout;
  ctx.save();
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = opts.lw;
  ctx.setLineDash([opts.lw * 6, opts.lw * 4]);
  ctx.fillStyle = opts.labelColor;
  ctx.font = `600 ${opts.fontPx}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [name, [x, y, w, h]] of Object.entries(rects)) {
    ctx.strokeRect(x * s, y * s, w * s, h * s);
    ctx.fillText(t(faceKeys[name]), (x + w / 2) * s, (y + h / 2) * s);
  }
  if (opts.win && opts.win.enabled) {
    ctx.setLineDash([]);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = opts.lw * 1.5;
    windowPath(ctx, opts.win, rects, s);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUVView(layout, surface) {
  const cv = uvCanvas;
  cv.width = surface.color.width;
  cv.height = surface.color.height;
  const ctx = cv.getContext("2d");
  const s = cv.width / layout.TW;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(surface.color, 0, 0);
  const win = getWindow();
  if (win.enabled) {
    ctx.save();
    windowPath(ctx, win, layout.rects, s);
    ctx.fillStyle = "#ffffff"; // dziura = białe tło
    ctx.fill();
    ctx.restore();
  }
  drawNetOverlay(ctx, layout, s, {
    lw: Math.max(2, s * 0.35),
    fontPx: Math.max(14, s * 3),
    labelColor: "rgba(60,60,80,0.55)",
    win,
  });
}

function drawThumb(canvas, L, W, H) {
  const layout = computeNetLayout(L, W, H);
  const pad = 14;
  const cw = 480;
  const s = (cw - pad * 2) / layout.TW;
  canvas.width = cw;
  canvas.height = Math.round(layout.TH * s + pad * 2);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(pad, pad);
  drawNetOverlay(ctx, layout, s, {
    lw: 2,
    fontPx: 14,
    labelColor: "#9ca3af",
    win: null,
  });
  ctx.restore();
}

// ===== 7. Język i motyw =====
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
  if (viewMode === "uv") refreshAll();
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  $("themeLight").classList.toggle("active", currentTheme === "light");
  $("themeDark").classList.toggle("active", currentTheme === "dark");
  localStorage.setItem("theme", currentTheme);
}
$("themeLight").addEventListener("click", () => {
  currentTheme = "light";
  applyTheme();
});
$("themeDark").addEventListener("click", () => {
  currentTheme = "dark";
  applyTheme();
});

$("langSelect").value = currentLang;
$("currencySelect").value = currentCurrency;
$("langSelect").addEventListener("change", (e) => {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang);
  applyLanguage();
});
$("currencySelect").addEventListener("change", (e) => {
  currentCurrency = e.target.value;
  localStorage.setItem("currency", currentCurrency);
  calculatePrice();
});

// ===== 8. Cena =====
function calculatePrice() {
  const { L, W, H } = getDims();
  const qty = Math.max(1, parseInt(qtyInput.value) || 1);

  const areaM2 = (2 * (L * W + L * H + W * H)) / 1000000;
  let unit =
    areaM2 * materialRates[parseInt(materialSelect.value) || 0] +
    fixedSetupCost;

  const win = getWindow();
  if (win.enabled) {
    unit += 0.2; // wykrojnik
    if (win.film) unit += ((win.w * win.h) / 1e6) * 6; // folia PET
  }
  const foil = getFoil();
  if (foil.enabled) unit += 0.35 + (foil.frame && win.enabled ? 0.1 : 0);

  if (currentFinish === "glossy") unit *= 1 + glossyExtraCharge;

  let discount = 0;
  if (qty >= 1000) discount = 0.15;
  else if (qty >= 500) discount = 0.08;
  else if (qty >= 100) discount = 0.03;
  unit *= 1 - discount;

  const conv = unit * currencyRates[currentCurrency];
  const fmt = new Intl.NumberFormat(locales[currentLang], {
    style: "currency",
    currency: currentCurrency,
  });
  unitPriceEl.textContent = `${fmt.format(conv)} / ${t("pcs")}`;
  totalPriceEl.textContent = fmt.format(conv * qty);
}

// ===== 9. Odświeżanie =====
function refreshAll() {
  $("winFields").hidden = !winEnabled.checked;
  $("foilFields").hidden = !foilEnabled.checked;
  calculatePrice();
  const layout = getNetLayout();
  const surface = paintSurface(layout);
  if (viewer) {
    viewer.updateBox(layout, num("edgeRadius"));
    viewer.setSurface(surface);
  }
  if (viewMode === "uv") drawUVView(layout, surface);
}

// Okienko od razu na górze (musi odpalić przed refreshAll)
winEnabled.addEventListener("input", () => {
  if (winEnabled.checked) $("winFace").value = "top";
});

const extraIds = [
  "edgeRadius", "winEnabled", "winFace", "winShape", "winW", "winH", "winX",
  "winY", "winR", "winFilm", "foilEnabled", "foilText", "foilFace",
  "foilColor", "foilSize", "foilFrame", "boxLength", "boxWidth", "boxDepth",
  "boxMaterial", "boxQty",
];
extraIds.forEach((id) => $(id).addEventListener("input", refreshAll));

// ===== 10. Mat / połysk =====
function setFinish(finish) {
  currentFinish = finish;
  $("finishMatte").classList.toggle("active", finish === "matte");
  $("finishGlossy").classList.toggle("active", finish === "glossy");
  if (viewer) viewer.setFinish(finish);
  calculatePrice();
}
$("finishMatte").addEventListener("click", () => setFinish("matte"));
$("finishGlossy").addEventListener("click", () => setFinish("glossy"));

// ===== 11. Wgrywanie grafiki =====
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

$("btnUpload").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageUrl = URL.createObjectURL(file);
  artwork = new Image();
  artwork.onload = refreshAll;
  artwork.src = uploadedImageUrl;
});

// ===== 11b. Wgrywanie grafiki złocenia =====
const foilFileInput = document.createElement("input");
foilFileInput.type = "file";
foilFileInput.accept = "image/*";
foilFileInput.style.display = "none";
document.body.appendChild(foilFileInput);

$("btnFoilUpload").addEventListener("click", () => foilFileInput.click());
foilFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (foilArtworkUrl) URL.revokeObjectURL(foilArtworkUrl);
  foilArtworkUrl = URL.createObjectURL(file);
  foilArtwork = new Image();
  foilArtwork.onload = () => {
    $("btnFoilClear").hidden = false;
    refreshAll();
  };
  foilArtwork.src = foilArtworkUrl;
  foilFileInput.value = "";
});
$("btnFoilClear").addEventListener("click", () => {
  foilArtwork = null;
  $("btnFoilClear").hidden = true;
  refreshAll();
});

// ===== 12. Pobieranie wzoru =====
$("btnDownloadUV").addEventListener("click", () => {
  const layout = getNetLayout();
  const { L, W, H, TW, TH } = layout;
  const scale = 10;
  const canvas = document.createElement("canvas");
  canvas.width = TW * scale;
  canvas.height = TH * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (artwork && artwork.complete) {
    ctx.drawImage(artwork, 0, 0, canvas.width, canvas.height);
  }
  drawNetOverlay(ctx, layout, scale, {
    lw: 3,
    fontPx: Math.min(W, H) * scale * 0.2,
    labelColor: "#9ca3af",
    win: getWindow(),
  });
  const link = document.createElement("a");
  link.download = `wzor-${L}x${W}x${H}mm.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Linie zgnieceń – czarne, przerywane
function drawCreaseLines(ctx, layout, s, lw = 2) {
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = lw;
  ctx.setLineDash([lw * 6, lw * 4]);
  for (const [x, y, w, h] of Object.values(layout.rects)) {
    ctx.strokeRect(x * s, y * s, w * s, h * s);
  }
  ctx.restore();
}

// ===== 12b. Pobieranie mapy złocenia =====
$("btnDownloadFoil").addEventListener("click", () => {
  const foil = getFoil();
  if (!foil.enabled) {
    openPopup(t("helpTitle"), t("foilNone"));
    return;
  }
  const layout = getNetLayout();
  const { L, W, H, TW, TH } = layout;
  const scale = 10;
  const canvas = document.createElement("canvas");
  canvas.width = TW * scale;
  canvas.height = TH * scale;
  const ctx = canvas.getContext("2d"); // tło przezroczyste

  drawCreaseLines(ctx, layout, scale, 2); // linie zgnieceń

  ctx.fillStyle = ctx.strokeStyle = "#000"; // czarne = złocone
  drawFoilShapes(ctx, layout, scale, getWindow(), foil);

  // wgrana grafika złocenia
  if (foilArtwork && foilArtwork.complete) {
    ctx.drawImage(makeFoilMask(foilArtwork, canvas.width, canvas.height), 0, 0);
  }

  const link = document.createElement("a");
  link.download = `zlocenie-${L}x${W}x${H}mm.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// ===== 13. Przełącznik 3D / UV =====
function setViewMode(mode) {
  viewMode = mode;
  viewport.classList.toggle("uv-mode", mode === "uv");
  $("btnView3D").classList.toggle("active", mode === "3d");
  $("btnViewUV").classList.toggle("active", mode === "uv");
  if (mode === "uv") refreshAll();
}
$("btnView3D").addEventListener("click", () => setViewMode("3d"));
$("btnViewUV").addEventListener("click", () => setViewMode("uv"));

// ===== 14. Popup =====
const overlay = $("popupOverlay");
function openPopup(title, text) {
  $("popupTitle").textContent = title;
  $("popupText").textContent = text;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}
function closePopup() {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
}
$("popupClose").addEventListener("click", closePopup);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closePopup();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});
$("btnContact").addEventListener("click", () =>
  openPopup(t("helpTitle"), t("soonText"))
);
$("btnAccount").addEventListener("click", () =>
  openPopup(t("helpTitle"), t("soonText"))
);
$("btnCart").addEventListener("click", () =>
  openPopup(t("helpTitle"), t("cartText"))
);
$("btnFull").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else viewport.requestFullscreen?.();
});

// ===== 15. Zakładki =====
const navButtons = [...document.querySelectorAll(".nav-btn")];
function switchTab(tab) {
  if (tab === "projects" || tab === "settings") {
    openPopup(t("helpTitle"), t("soonText"));
    return;
  }
  if (tab === "help") {
    openPopup(t("helpTitle"), t("helpText"));
    return;
  }
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  mainEl.classList.toggle("templates-mode", tab === "templates");
}
navButtons.forEach((b) =>
  b.addEventListener("click", () => switchTab(b.dataset.tab))
);

// ===== 15b. Zwijanie kart =====
document.querySelectorAll(".card h3").forEach((h) => {
  h.addEventListener("click", () =>
    h.parentElement.classList.toggle("collapsed")
  );
});

// ===== 16. Szablony =====
function renderTemplates() {
  templatesGrid.innerHTML = "";
  templates.forEach((tpl) => {
    const card = document.createElement("button");
    card.className = "tpl-card";
    card.type = "button";

    const canvas = document.createElement("canvas");
    drawThumb(canvas, tpl.L, tpl.W, tpl.H);
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
    card.addEventListener("click", () => {
      lengthInput.value = tpl.L;
      widthInput.value = tpl.W;
      depthInput.value = tpl.H;
      refreshAll();
      switchTab("view");
    });
    templatesGrid.appendChild(card);
  });
}

// ===== 17. Scena 3D =====
async function init3D() {
  const THREE = await import("three");
  const { OrbitControls } = await import(
    "three/addons/controls/OrbitControls.js"
  );
  const { RoomEnvironment } = await import(
    "three/addons/environments/RoomEnvironment.js"
  );
  const { RoundedBoxGeometry } = await import(
    "three/addons/geometries/RoundedBoxGeometry.js"
  );

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const defaultCameraPos = new THREE.Vector3(3.5, 2.5, 4.5);
  camera.position.copy(defaultCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.id = "glCanvas";
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

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xe6dccb,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  scene.add(mesh);
  let edges = null;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xb9c4cc, // lekko przyciemniony plastik
    transmission: 1,
    thickness: 0.05,
    ior: 1.45,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.6,
    side: THREE.DoubleSide,
    alphaTest: 0.5, // tylko w obrysie okienka
  });
  const glassMesh = new THREE.Mesh(mesh.geometry, glassMat);
  glassMesh.visible = false;
  scene.add(glassMesh);

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

  function mapUV(geo, sx, sy, sz, { TW, TH, rects }) {
    const pos = geo.attributes.position;
    const nor = geo.attributes.normal;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / sx + 0.5;
      const y = pos.getY(i) / sy + 0.5;
      const z = pos.getZ(i) / sz + 0.5;
      const nx = nor.getX(i), ny = nor.getY(i), nz = nor.getZ(i);
      const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
      let face, fu, fd;
      if (ay >= ax && ay >= az) {
        if (ny > 0) { face = "top"; fu = x; fd = z; }
        else { face = "bottom"; fu = x; fd = 1 - z; }
      } else if (az >= ax) {
        if (nz > 0) { face = "front"; fu = x; fd = 1 - y; }
        else { face = "back"; fu = 1 - x; fd = 1 - y; }
      } else if (nx > 0) { face = "right"; fu = 1 - z; fd = 1 - y; }
      else { face = "left"; fu = z; fd = 1 - y; }
      const [rx, ry, rw, rh] = rects[face];
      uv.setXY(i, (rx + fu * rw) / TW, 1 - (ry + fd * rh) / TH);
    }
    uv.needsUpdate = true;
  }

  function updateBox(layout, edgeMm = 0) {
    const { L, W, H } = layout;
    const k = 3 / Math.max(L, W, H);
    const sx = L * k, sy = H * k, sz = W * k;
    const r = Math.min(edgeMm * k, (Math.min(sx, sy, sz) / 2) * 0.99);

    mesh.geometry.dispose();
    mesh.geometry =
      r > 0
        ? new RoundedBoxGeometry(sx, sy, sz, 5, r)
        : new THREE.BoxGeometry(sx, sy, sz);
    mapUV(mesh.geometry, sx, sy, sz, layout);
    glassMesh.geometry = mesh.geometry;

    if (edges) {
      mesh.remove(edges);
      edges.geometry.dispose();
      edges = null;
    }
    if (r === 0) {
      edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.25,
        })
      );
      mesh.add(edges);
    }
  }

  function setSurface({ color, alpha, orm, glass, hasGlass }) {
    ["map", "alphaMap", "metalnessMap", "roughnessMap"].forEach((k) => {
      if (material[k]) material[k].dispose();
    });
    if (glassMat.alphaMap) glassMat.alphaMap.dispose();

    const colorTex = new THREE.CanvasTexture(color);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    const ormTex = new THREE.CanvasTexture(orm);
    material.color.set(0xffffff);
    material.map = colorTex;
    material.alphaMap = new THREE.CanvasTexture(alpha);
    material.metalnessMap = ormTex;
    material.roughnessMap = ormTex;
    material.metalness = 1;
    material.needsUpdate = true;

    glassMat.alphaMap = new THREE.CanvasTexture(glass);
    glassMesh.visible = hasGlass;
    glassMat.needsUpdate = true;
  }

  function setFinish(finish) {
    if (finish === "glossy") {
      material.roughness = 0.5;
      material.clearcoat = 1.0;
      material.clearcoatRoughness = 0.05;
      material.envMapIntensity = 1.2;
    } else {
      material.roughness = 1;
      material.clearcoat = 0.0;
      material.envMapIntensity = 0.5;
    }
    material.needsUpdate = true;
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

  // Gizmo osi
  const gctx = $("gizmo").getContext("2d");
  const axes = [
    ["X", new THREE.Vector3(1, 0, 0), "#e11d48"],
    ["Y", new THREE.Vector3(0, 1, 0), "#16a34a"],
    ["Z", new THREE.Vector3(0, 0, 1), "#2563eb"],
  ];
  function drawGizmo() {
    gctx.clearRect(0, 0, 88, 88);
    const q = camera.quaternion.clone().invert();
    axes
      .map(([n, v, c]) => [n, v.clone().applyQuaternion(q), c])
      .sort((a, b) => a[1].z - b[1].z)
      .forEach(([n, v, c]) => {
        const x = 44 + v.x * 28;
        const y = 44 - v.y * 28;
        gctx.strokeStyle = c;
        gctx.fillStyle = c;
        gctx.lineWidth = 2;
        gctx.beginPath();
        gctx.moveTo(44, 44);
        gctx.lineTo(x, y);
        gctx.stroke();
        gctx.beginPath();
        gctx.arc(x, y, 8, 0, Math.PI * 2);
        gctx.fill();
        gctx.fillStyle = "#fff";
        gctx.font = "bold 10px sans-serif";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        gctx.fillText(n, x, y);
      });
  }

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    drawGizmo();
  })();

  return { updateBox, setSurface, setFinish, toggleRotate, resetView };
}

rotateBtn.addEventListener("click", () => {
  if (!viewer) return;
  rotateBtn.classList.toggle("active", viewer.toggleRotate());
});
$("btnReset").addEventListener("click", () => {
  if (!viewer) return;
  viewer.resetView();
  rotateBtn.classList.remove("active");
});

// ===== 18. Start =====
applyTheme();
applyLanguage();
refreshAll();

init3D()
  .then((api) => {
    viewer = api;
    viewer.setFinish(currentFinish);
    refreshAll();
  })
  .catch((err) => console.error("Nie udało się uruchomić widoku 3D:", err));
