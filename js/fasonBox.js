// js/fasonBox.js
export function createFasonBox(THREE, material) {
  const group = new THREE.Group();
  const lidPivot = new THREE.Group();
  group.add(lidPivot);
  const parts = [];

  const panel = (parent, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    parent.add(m);
    parts.push(m);
    return m;
  };

  function build({ L, W, H }, tMm, openDeg = 100) {
    // wyczyść poprzednie części
    parts.forEach((p) => {
      p.parent.remove(p);
      p.geometry.dispose();
    });
    parts.length = 0;

    const k = 3 / Math.max(L, W, H);
    const l = L * k, w = W * k, h = H * k, t = tMm * k;
    const e = t * 0.02; // mała szczelina, żeby nie migotało (z-fighting)
    const flapH = Math.min(h * 0.6, 30 * k * 3);

    // --- dno (wymiary L×W×H = wnętrze) ---
    panel(group, l + 2 * t, t, w + 2 * t, 0, t / 2, 0); // podłoga
    const wy = t + h / 2;
    panel(group, l + 2 * t, h, t, 0, wy, w / 2 + t / 2); // przód
    panel(group, l + 2 * t, h, t, 0, wy, -(w / 2 + t / 2)); // tył
    panel(group, t, h, w, l / 2 + t / 2, wy, 0); // prawa
    panel(group, t, h, w, -(l / 2 + t / 2), wy, 0); // lewa

    // --- wieko: zawias na górnej tylnej krawędzi ---
    lidPivot.position.set(0, t + h, -(w / 2 + t));
    const D = w + 2 * t; // głębokość wieka
    panel(lidPivot, l + 2 * t, t, D, 0, t / 2, D / 2); // płyta
    // przednia zakładka (chowa się za przednią ścianą)
    panel(lidPivot, l - e * 4, flapH, t, 0, -flapH / 2, D - 1.5 * t - e);
    // boczne zakładki
    const sx = l / 2 - t / 2 - e;
    panel(lidPivot, t, flapH, w - 2 * t, sx, -flapH / 2, D / 2);
    panel(lidPivot, t, flapH, w - 2 * t, -sx, -flapH / 2, D / 2);

    setOpen(openDeg);
  }

  function setOpen(deg) {
    lidPivot.rotation.x = -THREE.MathUtils.degToRad(deg);
  }

  return { group, build, setOpen };
}
