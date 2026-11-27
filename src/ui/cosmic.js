/* ============================================================
   COSMIC ORIGINS — application shell
   Data comes from BGAPI (src/core/api-config.js has the address).
   If BGAPI does not answer, the page shows a short notice and no cards.
   The plan for BGAPI is in docs/briefs/cosmic-origins-platform.md.
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   1. CATEGORIES
   ph = placeholder tint per category (shown while a picture loads).
   ------------------------------------------------------------ */
const CATEGORY_TINTS = {
  galaxy:       "rgba(120, 90, 200, 0.26)",
  nebula:       "rgba(200, 90, 120, 0.24)",
  cluster:      "rgba(90, 140, 210, 0.26)",
  star:         "rgba(230, 170, 80, 0.22)",
  exoplanet:    "rgba(80, 190, 160, 0.22)",
  solar_system: "rgba(190, 140, 90, 0.24)",
  exotic:       "rgba(160, 200, 230, 0.20)",
};

const CATEGORY_LABELS = {
  galaxy: "Galaxies", nebula: "Nebulae", cluster: "Clusters", star: "Stars",
  exoplanet: "Exoplanets", solar_system: "Solar System", exotic: "Exotic",
};

/* ------------------------------------------------------------
   2. STATE
   ------------------------------------------------------------ */
function loadFavorites() {
  return new Set(JSON.parse(localStorage.getItem("co-favs") || "[]"));
}

const state = {
  active: new Set(Object.keys(CATEGORY_LABELS)),   // all on
  query: "",
  favOnly: false,                                   // "★ Favorites" pill; starts off on every visit
  favs: loadFavorites(),
};

/* The objects the page shows, from BGAPI's /catalog */
let objects = [];

const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/* ------------------------------------------------------------
   3. STARFIELD — three.js WebGL scene: a deep 3D star cloud the
   camera slowly falls through, with soft nebula sprites drifting
   behind the UI. Degrades to a 2D canvas field, and is skipped
   entirely under reduced motion or when ambience is off.
   ------------------------------------------------------------ */
function initStarfield() {
  const canvas = $("#starfield");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || reduced) return;
  if (window.THREE) {
    try {
      return starfield3D(canvas);
    } catch (e) {
      /* a failed WebGL start can lock the canvas, so the 2D field gets a fresh one */
      const fresh = canvas.cloneNode();
      canvas.replaceWith(fresh);
      return starfield2D(fresh);
    }
  }
  starfield2D(canvas);
}

function starfield3D(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1400);
  const DEPTH = 900;

  /* A "seeded" random number maker: it always gives the same numbers in the
     same order. So every browser, on every visit, draws the exact same sky. */
  let seed = 20261124;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;           // a number from 0 to 1
  }

  /* real star colors, from hot blue to cool red; white and yellow are most common */
  const STAR_COLORS = [
    [0.66, 0.75, 1.0],    // blue (O/B)
    [0.82, 0.87, 1.0],    // blue-white (A)
    [1.0, 1.0, 1.0],      // white (F)
    [1.0, 1.0, 1.0],
    [1.0, 0.96, 0.86],    // yellow-white (G, like the Sun)
    [1.0, 0.96, 0.86],
    [1.0, 0.85, 0.65],    // orange (K)
    [1.0, 0.68, 0.48],    // red (M)
  ];

  /* near space: three star layers the camera falls through */
  const near = new THREE.Group();
  scene.add(near);
  const layers = [
    makeStarLayer({ count: 3000, size: 1.6, opacity: 0.75, map: starTexture() }),
    makeStarLayer({ count: 700,  size: 3.2, opacity: 0.9,  map: starTexture() }),
    makeStarLayer({ count: 45,   size: 9,   opacity: 1.0,  map: brightStarTexture() }),
  ];
  layers.forEach((layer, i) => {
    layer.userData.phase = i * 1.7;
    layer.userData.baseOpacity = layer.material.opacity;
    near.add(layer);
  });

  /* deep sky: Milky Way, nebulae and galaxies, far behind the near stars.
     The group travels with the camera, so it never comes closer. */
  const deep = new THREE.Group();
  scene.add(deep);
  deep.add(makeMilkyWayStars(6000));
  const nebulae = makeNebulae();
  nebulae.forEach((nebula) => deep.add(nebula));
  const galaxies = makeGalaxies();
  galaxies.forEach((galaxy) => deep.add(galaxy));

  /* ---------- builders ---------- */

  function makeStarLayer({ count, size, opacity, map }) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (random() - 0.5) * 700;
      pos[i * 3 + 1] = (random() - 0.5) * 500;
      pos[i * 3 + 2] = -random() * DEPTH;
      setStarColor(col, i, 0.5 + random() * 0.5);
    }
    return makePoints(pos, col, size, opacity, map);
  }

  function makeMilkyWayStars(count) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (random() - 0.5) * 2800;
      pos[i * 3]     = x;
      pos[i * 3 + 1] = bandCenterY(x) + bellRandom() * 140;   // packed near the band line
      pos[i * 3 + 2] = -1050 - random() * 100;
      setStarColor(col, i, 0.35 + random() * 0.5);
    }
    return makePoints(pos, col, 3.5, 0.8, starTexture());
  }

  function makePoints(pos, col, size, opacity, map) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size, map, vertexColors: true, sizeAttenuation: true,
      transparent: true, opacity, depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
  }

  /* nebulae: colored gas clouds. Each one gets its own random cloud shape. */
  function makeNebulae() {
    const looks = {
      hydrogen: { core: [255, 120, 160], rim: [120, 50, 160] },   // pink emission gas
      oxygen:   { core: [130, 235, 235], rim: [40, 90, 210] },    // teal emission gas
      dust:     { core: [255, 190, 130], rim: [170, 60, 80] },    // warm glowing dust
      milkyway: { core: [235, 225, 210], rim: [110, 100, 140] },  // star haze of our galaxy
    };
    const list = [
      { look: looks.hydrogen, x: -620, y: 300,  size: 620, opacity: 0.75 },
      { look: looks.oxygen,   x: 640,  y: -260, size: 560, opacity: 0.7 },
      { look: looks.dust,     x: 120,  y: -470, size: 420, opacity: 0.6 },
      { look: looks.hydrogen, x: 880,  y: 380,  size: 380, opacity: 0.6 },
      { look: looks.milkyway, x: -250, y: bandCenterY(-250), size: 900, opacity: 0.25 },
      { look: looks.milkyway, x: 450,  y: bandCenterY(450),  size: 800, opacity: 0.2 },
    ];
    return list.map((n, i) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nebulaTexture(n.look), transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, opacity: n.opacity,
        rotation: random() * Math.PI * 2,
      }));
      sprite.position.set(n.x, n.y, -1000);
      sprite.scale.set(n.size, n.size, 1);
      sprite.userData.phase = i * 2.1;
      sprite.userData.baseOpacity = n.opacity;
      sprite.userData.home = { x: n.x, y: n.y };          // the cloud drifts around this spot
      sprite.userData.startRotation = sprite.material.rotation;
      sprite.userData.isBand = n.look === looks.milkyway;  // Milky Way haze stays on its band
      return sprite;
    });
  }

  /* galaxies: a flat disc picture, tilted in 3D, spinning around its own center */
  function makeGalaxies() {
    const list = [
      /* low on the screen: the hero picture covers the top part of the sky */
      { x: -620, y: -440, size: 240, tiltX: 0.9,  tiltY: 0.3,   spin: 0.00004 },
      { x: 780,  y: -400, size: 210, tiltX: 0.45, tiltY: -0.4,  spin: -0.00005 },
      { x: 120,  y: -500, size: 170, tiltX: 1.25, tiltY: 0.15,  spin: 0.00006 },  // almost edge-on
      { x: 1100, y: 150,  size: 150, tiltX: 0.3,  tiltY: 0.6,   spin: -0.00007 },
    ];
    return list.map((g) => {
      const disc = new THREE.Mesh(
        new THREE.PlaneGeometry(g.size, g.size),
        new THREE.MeshBasicMaterial({
          map: galaxyTexture(), transparent: true, depthWrite: false,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        })
      );
      const holder = new THREE.Group();        // holds the tilt; the disc spins inside it
      holder.position.set(g.x, g.y, -950);
      holder.rotation.set(g.tiltX, g.tiltY, 0);
      holder.add(disc);
      holder.userData = { disc, spin: g.spin };
      return holder;
    });
  }

  /* ---------- helpers ---------- */

  function setStarColor(col, i, brightness) {
    const c = STAR_COLORS[(random() * STAR_COLORS.length) | 0];
    col[i * 3]     = c[0] * brightness;
    col[i * 3 + 1] = c[1] * brightness;
    col[i * 3 + 2] = c[2] * brightness;
  }

  /* the Milky Way is a gently tilted line across the sky */
  function bandCenterY(x) { return x * -0.32 + 60; }

  /* a random number near 0, rarely far from it (a rough bell curve) */
  function bellRandom() { return random() + random() + random() - 1.5; }

  function mixColor(a, b, amount) { return a + (b - a) * amount; }

  function newCanvas(size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return c;
  }

  /* Smooth random "cloud" noise. Random numbers sit on a grid and are
     blended smoothly between grid points. Then finer and finer copies are
     added on top, which gives the wispy detail of real gas clouds. */
  function makeCloudNoise() {
    const GRID = 32;
    const values = Array.from({ length: GRID * GRID }, () => random());
    const valueAt = (x, y) => values[(y % GRID) * GRID + (x % GRID)];
    function smoothValue(x, y) {
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const fx = x - x0, fy = y - y0;
      const sx = fx * fx * (3 - 2 * fx);          // ease the blend so there are no hard lines
      const sy = fy * fy * (3 - 2 * fy);
      const top    = mixColor(valueAt(x0, y0),     valueAt(x0 + 1, y0),     sx);
      const bottom = mixColor(valueAt(x0, y0 + 1), valueAt(x0 + 1, y0 + 1), sx);
      return mixColor(top, bottom, sy);
    }
    return function cloudNoise(x, y) {
      let total = 0, strength = 0.5, scale = 1;
      for (let layer = 0; layer < 5; layer++) {
        total += smoothValue(x * scale, y * scale) * strength;
        strength /= 2;
        scale *= 2;
      }
      return total;                                // about 0 to 1
    };
  }

  /* a nebula picture: noise decides where the gas is, it fades to nothing
     before the picture edge (so no square edges), core color in the middle */
  function nebulaTexture(look) {
    const SIZE = 256;
    const c = newCanvas(SIZE);
    const ctx = c.getContext("2d");
    const image = ctx.createImageData(SIZE, SIZE);
    const gasNoise = makeCloudNoise();
    const colorNoise = makeCloudNoise();
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = (x / SIZE) * 2 - 1, dy = (y / SIZE) * 2 - 1;
        const fromCenter = Math.sqrt(dx * dx + dy * dy);
        const fade = Math.max(0, 1 - fromCenter * 1.15);   // 0 well before the edge
        const gas = Math.max(0, gasNoise(x / 36, y / 36) - 0.35) * 2.4;
        const alpha = Math.min(1, gas * fade * fade * 1.8);
        const toCore = Math.min(1, fade * 0.8 + colorNoise(x / 50, y / 50) * 0.5);
        const i = (y * SIZE + x) * 4;
        image.data[i]     = mixColor(look.rim[0], look.core[0], toCore);
        image.data[i + 1] = mixColor(look.rim[1], look.core[1], toCore);
        image.data[i + 2] = mixColor(look.rim[2], look.core[2], toCore);
        image.data[i + 3] = alpha * 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return new THREE.CanvasTexture(c);
  }

  /* a face-on spiral galaxy: soft arms of blue stars, pink star-forming
     spots, and a warm bright core */
  function galaxyTexture() {
    const c = newCanvas(256);
    const x = c.getContext("2d");
    x.translate(128, 128);
    const ARMS = 2 + ((random() * 2) | 0);
    const halo = x.createRadialGradient(0, 0, 0, 0, 0, 120);
    halo.addColorStop(0, "rgba(190,200,255,0.25)");
    halo.addColorStop(1, "rgba(190,200,255,0)");
    x.fillStyle = halo;
    x.fillRect(-128, -128, 256, 256);
    for (let arm = 0; arm < ARMS; arm++) {
      for (let k = 0; k < 700; k++) {
        const along = k / 700;                       // 0 at the core, 1 at the arm tip
        const angle = along * 5.5 + (arm * Math.PI * 2) / ARMS;
        const dist = 12 + along * 100;
        const spread = 4 + along * 10;                // arms get wider further out
        const px = Math.cos(angle) * dist + bellRandom() * spread;
        const py = Math.sin(angle) * dist + bellRandom() * spread;
        const pinkSpot = random() < 0.03;
        x.fillStyle = pinkSpot ? "rgba(255,130,170,0.5)" : "rgba(185,205,255,0.09)";
        x.beginPath();
        x.arc(px, py, pinkSpot ? 1.4 : 3 + random() * 5, 0, Math.PI * 2);
        x.fill();
      }
    }
    const core = x.createRadialGradient(0, 0, 0, 0, 0, 55);
    core.addColorStop(0, "rgba(255,245,225,1)");
    core.addColorStop(0.15, "rgba(255,225,185,0.7)");
    core.addColorStop(0.6, "rgba(255,210,170,0.1)");
    core.addColorStop(1, "rgba(255,210,170,0)");
    x.fillStyle = core;
    x.fillRect(-128, -128, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  /* a soft round dot: bright core, glow that fades out */
  function starTexture() {
    const c = newCanvas(64);
    const x = c.getContext("2d");
    const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.15, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.18)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = grad;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /* a bright star: round glow plus four thin light spikes, like telescope photos */
  function brightStarTexture() {
    const c = newCanvas(128);
    const x = c.getContext("2d");
    const glow = x.createRadialGradient(64, 64, 0, 64, 64, 40);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.1, "rgba(255,255,255,0.9)");
    glow.addColorStop(0.35, "rgba(255,255,255,0.15)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = glow;
    x.fillRect(0, 0, 128, 128);
    drawSpike(x, 0, 64, 128, 64);     // horizontal
    drawSpike(x, 64, 0, 64, 128);     // vertical
    return new THREE.CanvasTexture(c);
  }
  function drawSpike(x, x1, y1, x2, y2) {
    const grad = x.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    x.strokeStyle = grad;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(x1, y1);
    x.lineTo(x2, y2);
    x.stroke();
  }

  /* ---------- motion ---------- */

  const mouse = { x: 0, y: 0 };    // where the cursor is: -0.5 to 0.5
  const look = { x: 0, y: 0 };     // follows the cursor slowly, so motion is smooth
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / window.innerWidth - 0.5;
    mouse.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const NEBULA_DRIFT = 80;        // how far a gas cloud wanders: about 60 px on a 900 px screen,
                                  // one loop in about 40 s, so it moves about 10 px per second
  const NEBULA_SWIRL = 0.000018;  // swirl speed in radians per ms (about 1° per second)

  let z = 0;
  renderer.setAnimationLoop((t) => {
    if (document.body.classList.contains("low-ambience")) return;
    z -= 0.045;                                   // slow fall through space
    if (z < -DEPTH / 2) z = 0;

    /* the camera slides and turns toward the cursor: near stars shift
       a lot, the deep sky shifts less, so you feel the depth */
    look.x += (mouse.x - look.x) * 0.05;
    look.y += (mouse.y - look.y) * 0.05;
    camera.position.set(look.x * 60, -look.y * 40, z);
    camera.rotation.set(-look.y * 0.12, -look.x * 0.18, 0);

    near.rotation.z = t / 220000;                 // barely-there roll
    deep.position.z = z;                          // deep sky stays far away
    deep.rotation.z = t / 400000;                 // the whole sky turns very slowly

    layers.forEach((layer) => {
      const twinkle = Math.sin(t / 2500 + layer.userData.phase);
      layer.material.opacity = layer.userData.baseOpacity * (0.85 + 0.15 * twinkle);
    });
    nebulae.forEach((nebula) => {
      const cloud = nebula.userData;
      const breathe = Math.sin(t / 5000 + cloud.phase);
      nebula.material.opacity = cloud.baseOpacity * (0.8 + 0.2 * breathe);
      if (cloud.isBand) return;
      /* gas clouds move on their own (not only with the mouse):
         a slow loop around their home spot, and a slow swirl */
      nebula.position.x = cloud.home.x + Math.sin(t / 6000 + cloud.phase) * NEBULA_DRIFT;
      nebula.position.y = cloud.home.y + Math.cos(t / 8000 + cloud.phase) * NEBULA_DRIFT * 0.6;
      nebula.material.rotation = cloud.startRotation + t * NEBULA_SWIRL;
    });
    galaxies.forEach((galaxy) => {
      galaxy.userData.disc.rotation.z = t * galaxy.userData.spin;
    });
    renderer.render(scene, camera);
  });
}

/* 2D fallback when WebGL/three.js is unavailable */
function starfield2D(canvas) {
  const ctx = canvas.getContext("2d");
  let w, h, stars = [];
  const mouse = { x: 0, y: 0 };
  function seed() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const n = Math.min(260, Math.floor((w * h) / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      z: Math.random() * 0.8 + 0.2, tw: Math.random() * Math.PI * 2,
    }));
  }
  function frame(t) {
    if (!document.body.classList.contains("low-ambience")) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += 0.015 * s.z;
        if (s.x > w + 2) s.x = -2;
        const twinkle = 0.55 + 0.45 * Math.sin(t / 1400 + s.tw);
        ctx.globalAlpha = 0.25 + 0.55 * s.z * twinkle;
        ctx.fillStyle = s.z > 0.75 ? "#fff6e8" : "#cfd8ea";
        ctx.beginPath();                          // round dots, not squares
        ctx.arc(s.x + mouse.x * 6 * s.z, s.y + mouse.y * 6 * s.z,
          s.z > 0.75 ? 1.1 : 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize", seed);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / w - 0.5; mouse.y = e.clientY / h - 0.5;
  }, { passive: true });
  seed();
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------
   3b. DATA FROM BGAPI — the catalog once at start, one object's
   details when its page opens. API_BASE is in src/core/api-config.js.
   ------------------------------------------------------------ */

/* An error with the HTTP status, so the caller can tell a 404 from a 429 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/* GET a JSON answer from BGAPI.
   cache: "no-cache" makes the browser always ask BGAPI again, sending the
   ETag it has. BGAPI answers 304 when nothing changed, and the browser
   uses the copy it already has. */
async function getJson(path) {
  const res = await fetch(API_BASE + path, { cache: "no-cache" });
  if (res.status === 429) {
    const wait = res.headers.get("Retry-After") || "a few";
    throw new ApiError(429, "Too many requests. Try again in " + wait + " seconds.");
  }
  if (!res.ok) throw new ApiError(res.status, "BGAPI answered " + res.status + ".");
  return res.json();
}

/* "2,537,000 ly", or "48.01 Mly" for big numbers */
function formatDistance(ly) {
  if (ly == null) return "";
  if (ly >= 1e6) return (ly / 1e6).toFixed(2) + " Mly";
  return ly.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " ly";
}

/* The bigger picture for the hero. ESA, ESO and NOIRLab use the same
   folder names: thumb300y = small, screen = large. NASA uses ~thumb / ~large.
   If the guess is wrong, the hero image falls back to the thumbnail. */
function largerImageUrl(thumbUrl) {
  return thumbUrl.replace("/thumb300y/", "/screen/").replace("~thumb.", "~large.");
}

/* One /catalog item → the object shape this page uses */
function objectFromCatalogItem(item) {
  return {
    id: item.slug,
    name: item.name,
    aliases: item.aliases || [],
    designation: (item.aliases || []).join(" · "),
    category: item.category,
    subcategory: item.subcategory || "",
    constellation: item.constellation || "",
    distance: formatDistance(item.distanceLy),
    magnitude: item.magnitude == null ? "" : String(item.magnitude),
    thumbUrl: item.thumbUrl,
    imageUrl: largerImageUrl(item.thumbUrl),
    credit: item.credit || "",
    hasDetails: false,               // ra, dec, images … come from /objects/{slug}
  };
}

/* Add the /objects/{slug} answer to the object we already have */
function addDetails(obj, data) {
  Object.assign(obj, objectFromCatalogItem({ ...data, thumbUrl: data.images[0].thumbUrl, credit: data.images[0].credit }));
  obj.ra = data.ra || "";
  obj.dec = data.dec || "";
  obj.discovered = data.discovered || "";
  obj.description = data.description || "";
  obj.facts = data.facts || [];
  obj.images = data.images;
  obj.sources = data.sources || [];
  obj.hasDetails = true;
}

/* Show a short message above the grid (or hide it when text is "") */
function showDataNotice(text) {
  const notice = $("#dataNotice");
  notice.textContent = text;
  notice.hidden = !text;
}

/* Load the whole catalog once. If BGAPI does not answer, or has no
   objects yet, the page says so in one line and shows no cards. */
async function loadCatalog() {
  try {
    if (!API_BASE) throw new Error("No API address set");
    const data = await getJson("/catalog");
    objects = data.items.map(objectFromCatalogItem);
    if (!objects.length) showDataNotice("The catalog is empty · nothing imported yet");
  } catch (err) {
    objects = [];
    showDataNotice("Catalog not reachable · try again later");
  }
}

/* Make text safe to put inside innerHTML (data from the API is not our code) */
function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Only http(s) links; anything else becomes an empty link */
function safeUrl(url) {
  return /^https?:\/\//.test(url || "") ? escapeHtml(url) : "";
}

/* ------------------------------------------------------------
   4. CARD GRID
   ------------------------------------------------------------ */
function frameHTML(obj, small) {
  const tint = CATEGORY_TINTS[obj.category] || "rgba(80,110,180,0.22)";
  /* cards load the small thumbnail; hero and detail use the big picture */
  const img = obj.thumbUrl
    ? `<img src="${safeUrl(obj.thumbUrl)}" alt="${escapeHtml(obj.name + " — " + obj.credit)}" loading="lazy"
         onload="this.classList.add('is-loaded')" onerror="this.remove()">`
    : "";
  return `<div class="uao-frame">
    <div class="uao-ph" style="--ph-tint:${tint}">
      <span class="uao-ph-label">${small ? "" : "awaiting imagery · nasa media link"}</span>
    </div>${img}
  </div>`;
}

function cardHTML(obj) {
  const isFav = state.favs.has(obj.id);
  const favCls = isFav ? " is-fav" : "";
  const id = escapeHtml(obj.id);
  const name = escapeHtml(obj.name);
  const subTag = obj.subcategory ? `<span class="tag">${escapeHtml(obj.subcategory)}</span>` : "";
  return `<article class="uao-card brackets" data-id="${id}" tabindex="0"
            role="button" aria-label="Open ${name} telemetry">
    <div style="position:relative">
      ${frameHTML(obj)}
      <button class="uao-fav${favCls}" data-fav="${id}" aria-pressed="${isFav}"
              aria-label="Favorite ${name}">
        <i class="bi bi-star${isFav ? "-fill" : ""}"></i>
      </button>
    </div>
    <div class="uao-meta">
      <h3 class="uao-name">${name}</h3>
      <div class="uao-desig"><i>${escapeHtml(obj.designation)}</i></div>
      <div class="uao-tags">
        <span class="tag tag--cat">${escapeHtml(CATEGORY_LABELS[obj.category] || obj.category)}</span>
        ${subTag}
      </div>
    </div>
  </article>`;
}

/* Does this object pass the current filters, search and favorites toggle? */
/* Search looks in the name and the aliases. Spaces do not count,
   so "M31" finds "M 31" and "m 31" finds "M31". */
function matchesQuery(obj, query) {
  const noSpaces = (text) => text.toLowerCase().replace(/\s+/g, "");
  const q = noSpaces(query);
  return [obj.name, ...obj.aliases].some(text => noSpaces(text).includes(q));
}

function isVisible(obj) {
  const matchesSearch = !state.query || matchesQuery(obj, state.query);
  const matchesFavs = !state.favOnly || state.favs.has(obj.id);
  return state.active.has(obj.category) && matchesSearch && matchesFavs;
}

/* "14 objects" when nothing is hidden, "3 of 14 objects" when something is */
function countText(shown, total) {
  const word = total === 1 ? "object" : "objects";
  return shown === total ? total + " " + word : shown + " of " + total + " " + word;
}

/* Which message to show when no card is left */
function emptyHTML() {
  if (state.active.size === 0) {
    return "<strong>No category picked</strong>Tap a category above, or tap All to show everything.";
  }
  if (state.favOnly && state.favs.size === 0) {
    return "<strong>No favorites yet</strong>Tap ☆ on a card to keep it here.";
  }
  return "<strong>No objects in range</strong>" +
    "Adjust the category filters or clear the search query to widen the scan.";
}

/* The cards are built one time only. After that, renderGrid() only shows or
   hides them. If we rebuilt them on every click, every picture would load
   again and the whole grid would flicker. */
function renderGrid() {
  const grid = $("#uaoGrid");
  if (!grid.children.length) grid.innerHTML = objects.map(cardHTML).join("");

  const items = objects.filter(isVisible);
  $$(".uao-card", grid).forEach(card => {
    const obj = objects.find(o => o.id === card.dataset.id);
    card.hidden = !isVisible(obj);
  });
  /* No catalog at all: the notice above the grid already says why */
  const noCatalog = objects.length === 0;
  $("#resultCount").textContent = noCatalog ? "" : countText(items.length, objects.length);
  const empty = $("#emptyState");
  empty.innerHTML = emptyHTML();
  empty.style.display = items.length || noCatalog ? "none" : "block";
}

/* ------------------------------------------------------------
   4b. HERO — full-bleed featured-observation carousel
   ------------------------------------------------------------ */
let heroIdx = 0, heroTimer = null;
let FEATURED = [];             // the objects in the hero, set by initHero()

/* The first 6 objects of the catalog */
function pickFeatured() {
  return objects.slice(0, 6);
}

function heroShow(i) {
  heroIdx = (i + FEATURED.length) % FEATURED.length;
  const obj = FEATURED[heroIdx];
  $$(".hero-slide").forEach((s, k) => s.classList.toggle("is-active", k === heroIdx));
  $$(".hero-dot").forEach((d, k) => d.classList.toggle("is-active", k === heroIdx));
  $("#heroName").textContent = obj.name;
  $("#heroDesig").textContent = [obj.designation, obj.distance].filter(Boolean).join(" · ");
}

function heroPlay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => heroShow(heroIdx + 1), 7000);
}

function initHero() {
  FEATURED = pickFeatured();
  if (!FEATURED.length) {               // no catalog: no hero
    $("#hero").hidden = true;
    return;
  }
  const slides = $("#heroSlides");
  /* If the big picture fails, try the thumbnail once, then give up */
  slides.innerHTML = FEATURED.map((obj, k) => `<div class="hero-slide${k === 0 ? " is-active" : ""}">
      <img src="${safeUrl(obj.imageUrl)}" alt="${escapeHtml(obj.name + " — " + obj.credit)}"
           data-fallback="${safeUrl(obj.thumbUrl)}"
           ${k === 0 ? "" : 'loading="lazy"'}
           onerror="if (this.dataset.fallback && this.src !== this.dataset.fallback) this.src = this.dataset.fallback; else this.remove()">
    </div>`).join("");
  $("#heroDots").innerHTML = FEATURED.map((obj, k) =>
    `<button class="hero-dot${k === 0 ? " is-active" : ""}" data-hero="${k}"
       aria-label="Show observation ${k + 1}"></button>`).join("");

  $("#heroPrev").addEventListener("click", () => { heroShow(heroIdx - 1); heroPlay(); });
  $("#heroNext").addEventListener("click", () => { heroShow(heroIdx + 1); heroPlay(); });
  $("#heroDots").addEventListener("click", (e) => {
    const d = e.target.closest("[data-hero]");
    if (d) { heroShow(+d.dataset.hero); heroPlay(); }
  });
  $("#heroOpen").addEventListener("click", () =>
    location.hash = objectLink(FEATURED[heroIdx].id));
  const hero = $("#hero");
  hero.addEventListener("mouseenter", () => clearInterval(heroTimer));
  hero.addEventListener("mouseleave", heroPlay);

  heroShow(0);
  heroPlay();
}

/* ------------------------------------------------------------
   5. FILTER PILLS — multi-select; "All" is a switch: all on ↔ all off
   ------------------------------------------------------------ */
function syncPills() {
  $$(".pill[data-cat]").forEach(p =>
    p.setAttribute("aria-pressed", String(state.active.has(p.dataset.cat))));
  $("#pillAll").setAttribute("aria-pressed",
    String(state.active.size === Object.keys(CATEGORY_LABELS).length));
  $("#pillFav").setAttribute("aria-pressed", String(state.favOnly));
}

function initFilters() {
  /* "All": when every category is on, clear them all (so you can pick just
     one). Otherwise turn every category on. */
  $("#pillAll").addEventListener("click", () => {
    const allCategories = Object.keys(CATEGORY_LABELS);
    const allOn = state.active.size === allCategories.length;
    state.active = allOn ? new Set() : new Set(allCategories);
    syncPills(); renderGrid();
  });
  $("#pillFav").addEventListener("click", () => {
    state.favOnly = !state.favOnly;
    syncPills(); renderGrid();
  });
  $$(".pill[data-cat]").forEach(p => p.addEventListener("click", () => {
    const c = p.dataset.cat;
    state.active.has(c) ? state.active.delete(c) : state.active.add(c);
    syncPills(); renderGrid();
  }));
  /* search runs on every key press, so there is no Search button */
  const input = $("#searchInput");
  input.addEventListener("input", () => { state.query = input.value.trim(); renderGrid(); });
}

/* ------------------------------------------------------------
   6. DETAIL VIEWER
   ------------------------------------------------------------ */
let galleryScrollY = 0;        // where the gallery was, so we can go back to the same place

/* The one place that knows what a link to an object looks like.
   (The platform brief changes it to "#/object/<slug>": edit only here.) */
function objectLink(id) {
  return "obj/" + id;
}

/* The id of the object that is open now, or "" */
function openObjectId() {
  const h = location.hash.replace("#", "");
  return h.startsWith("obj/") ? h.slice(4) : "";
}

/* Go to the next (step = 1) or previous (step = -1) object in the list the
   gallery shows now (same filters and search). Wraps at both ends. */
function stepDetail(step) {
  const id = openObjectId();
  let list = objects.filter(isVisible);
  if (!list.some(o => o.id === id)) list = objects;    // opened from outside the list
  const i = list.findIndex(o => o.id === id);
  const next = list[(i + step + list.length) % list.length];
  if (next.id !== id) location.hash = objectLink(next.id);
}

/* Back to the gallery (the "Back" button and the Esc key) */
function closeDetail() {
  location.hash = "";
  showView("gallery");
}

/* Open one object's page. With BGAPI, the details (all photos, ra, dec …)
   come from /objects/{slug} the first time the page opens. */
async function openDetail(id) {
  let obj = objects.find(o => o.id === id);
  if (obj && obj.hasDetails) { showDetail(obj, ""); return; }

  try {
    const data = await getJson("/objects/" + encodeURIComponent(id));
    if (!obj) {                       // not in the catalog we loaded (a newer import)
      obj = objectFromCatalogItem({ ...data, thumbUrl: data.images[0].thumbUrl, credit: data.images[0].credit });
      objects.push(obj);
    }
    addDetails(obj, data);
    if (openObjectId() !== id) return;          // the reader moved on while we waited
    showDetail(obj, "");
  } catch (err) {
    if (openObjectId() !== id) return;
    if (err.status === 404) { showNotFound(id); return; }
    if (obj) showDetail(obj, "Full record not loaded: " + err.message);   // show what we have
    else showNotFound(id);
  }
}

/* The telemetry cells: only the fields this object has, then its facts */
function telemetryRows(obj) {
  const rows = [
    ["Category", CATEGORY_LABELS[obj.category] || obj.category],
    ["Class", obj.subcategory],
    ["Constellation", obj.constellation],
    ["Right ascension", obj.ra],
    ["Declination", obj.dec],
    ["Distance", obj.distance],
    ["Magnitude", obj.magnitude],
    ["First recorded", obj.discovered],
  ];
  (obj.facts || []).forEach(f => rows.push([f.label, [f.value, f.unit].filter(Boolean).join(" ")]));
  return rows.filter(([, value]) => value);
}

/* Show one photo of the object as the big picture, with its credit */
function showPhoto(obj, index) {
  const photo = obj.images[index];
  const img = $("#detailImg");
  img.alt = obj.name + " — " + photo.credit;
  $("#detailImgLink").href = photo.sourcePage || photo.url;
  $("#detailCredit").textContent = photo.credit + " · " + photo.license;
  $$("#photoList .photo-item").forEach((item, k) => item.classList.toggle("is-current", k === index));
  return photo.url;
}

/* Every photo of the object, each with its own credit, license and source page.
   One object can have hundreds; the small pictures load only when scrolled to. */
function photoListHTML(obj) {
  return obj.images.map((photo, k) => `<figure class="photo-item">
      <button class="photo-thumb" data-photo="${k}" aria-label="Show photo ${k + 1} as the big picture">
        <img src="${safeUrl(photo.thumbUrl || photo.url)}" alt="${escapeHtml(obj.name + " — " + photo.credit)}" loading="lazy"
             onload="this.classList.add('is-loaded')">
      </button>
      <figcaption>
        <span class="photo-credit">${escapeHtml(photo.credit)}</span>
        <span class="photo-license">${escapeHtml(photo.license)}
          ${photo.sourcePage ? `· <a href="${safeUrl(photo.sourcePage)}" target="_blank" rel="noopener">source</a>` : ""}</span>
      </figcaption>
    </figure>`).join("");
}

/* Where the data came from (OpenNGC, Wikidata …) */
function sourceListHTML(obj) {
  return (obj.sources || []).map(s => `<li>
      <a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.catalog)}</a>
      <span>${escapeHtml(s.catalogId)} · ${escapeHtml(s.license)}</span>
    </li>`).join("");
}

function showDetail(obj, noticeText) {
  const img = $("#detailImg");
  const panel = $("#view-detail");
  /* Clean up the last object first:
     - drop the old picture, or the browser keeps showing it while the new one loads
     - drop the old entrance classes, or the browser replays them the moment the
       page shows again (that would fade in the old picture) */
  img.removeAttribute("src");
  img.classList.remove("is-arriving");
  panel.classList.remove("is-entering");
  panel.classList.add("is-waiting");
  $("#detailTitle").textContent = obj.name;
  $("#detailDesig").textContent = obj.designation;
  $("#detailNotice").textContent = noticeText;
  $("#detailNotice").hidden = !noticeText;
  $("#detailDesc").hidden = !obj.description;
  prepareTyping($("#detailDesc"), obj.description || "");

  /* --i is each cell's position; the CSS uses it to bring the cells in one by one */
  $("#telemetry").innerHTML = telemetryRows(obj).map(([k, v], i) =>
    `<div style="--i:${i}"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join("");

  /* The photos (BGAPI) — or only the one we have, when the details failed */
  const hasPhotos = obj.images && obj.images.length;
  const photos = hasPhotos ? obj.images : [{ url: obj.imageUrl, thumbUrl: obj.thumbUrl, credit: obj.credit, license: "" }];
  obj.images = photos;
  $("#photoList").innerHTML = photoListHTML(obj);
  $("#photoLabel").textContent = photos.length === 1 ? "1 photo" : photos.length + " photos";
  $("#photoWrap").hidden = photos.length < 2;
  $("#sourceList").innerHTML = sourceListHTML(obj);
  $("#sourceWrap").hidden = !(obj.sources || []).length;
  const pictureUrl = showPhoto(obj, 0);

  const related = objects.filter(o => o.category === obj.category && o.id !== obj.id);
  $("#relatedRail").innerHTML = related.map(o =>
    `<div class="related-item brackets" data-id="${escapeHtml(o.id)}" tabindex="0" role="button"
       aria-label="Open ${escapeHtml(o.name)}">
       ${frameHTML(o, true)}<h4 class="uao-name">${escapeHtml(o.name)}</h4>
     </div>`).join("");
  $("#relatedLabel").textContent = "More in " + (CATEGORY_LABELS[obj.category] || obj.category);
  $("#relatedWrap").style.display = related.length ? "block" : "none";

  showView("detail");
  panel.scrollTop = 0;
  /* Everything stays hidden (is-waiting); once the picture is here, the
     whole entrance plays together, the same in every browser. */
  loadPicture(img, pictureUrl, () => {
    panel.classList.remove("is-waiting");
    replayAnimation(panel, "is-entering");    // title and data slide in
    replayAnimation(img, "is-arriving");      // picture comes into focus
  });
}

/* A click on a small photo makes it the big picture */
function initPhotoList() {
  $("#photoList").addEventListener("click", (e) => {
    const thumb = e.target.closest("[data-photo]");
    if (!thumb) return;
    const obj = objects.find(o => o.id === openObjectId());
    if (!obj) return;
    $("#detailImg").src = showPhoto(obj, +thumb.dataset.photo);
    $("#view-detail").scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* The page for a link to an object that does not exist */
function showNotFound(id) {
  $("#notFoundSlug").textContent = id;
  showView("notfound");
}

/* ------------------------------------------------------------
   TYPED DESCRIPTION — the text prints letter by letter, like a
   terminal, when it scrolls into view. Click it to show it all.
   ------------------------------------------------------------ */
const TYPE_SPEED_MS = 18;                       // time between two letters
let typingTimer = null;
let typingWatcher = null;

function initTyping() {
  const desc = $("#detailDesc");
  typingWatcher = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) startTyping(desc);
  }, { threshold: 0.5 });
  desc.addEventListener("click", () => finishTyping(desc));
}

/* Put the new text in place, not typed yet. The ghost copy is the full
   text (it keeps the size and is what screen readers read); the live
   copy starts empty and is hidden from screen readers. */
function prepareTyping(el, text) {
  clearInterval(typingTimer);
  el.innerHTML = "";
  const ghost = document.createElement("span");
  ghost.className = "type-ghost";
  ghost.textContent = text;
  const live = document.createElement("span");
  live.className = "type-live";
  live.setAttribute("aria-hidden", "true");
  el.append(ghost, live);
  el.dataset.typing = "ready";
  /* watch again, so a text that is already on screen also starts typing */
  typingWatcher.unobserve(el);
  typingWatcher.observe(el);
}

function startTyping(el) {
  if (el.dataset.typing !== "ready") return;    // already typing or done
  el.dataset.typing = "running";
  const text = el.querySelector(".type-ghost").textContent;
  const live = el.querySelector(".type-live");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { finishTyping(el); return; }
  let shown = 0;
  typingTimer = setInterval(() => {
    shown += 1;
    live.textContent = text.slice(0, shown);
    if (shown >= text.length) finishTyping(el);
  }, TYPE_SPEED_MS);
}

function finishTyping(el) {
  clearInterval(typingTimer);
  el.querySelector(".type-live").textContent = el.querySelector(".type-ghost").textContent;
  el.querySelector(".type-live").classList.add("is-done");
  el.dataset.typing = "done";
}

/* The arrow at the bottom of the photo: a click scrolls down to the data,
   and the arrow hides once the reader has scrolled a little. */
function initScrollHint() {
  const panel = $("#view-detail");
  const hint = $("#scrollHint");
  hint.addEventListener("click", () => {
    $(".detail-content").scrollIntoView({ behavior: "smooth" });
  });
  panel.addEventListener("scroll", () => {
    hint.classList.toggle("is-hidden", panel.scrollTop > 40);
  }, { passive: true });
}

/* Take a class off, make the browser notice, put it back:
   this plays the class's CSS animation again from the start. */
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;                        // forces the browser to notice the removal
  el.classList.add(className);
}

/* Load a picture, then call whenReady exactly once: when it has loaded,
   when it fails, or after 1.5 s on a slow network (never leave the page empty). */
function loadPicture(img, url, whenReady) {
  let done = false;
  const ready = () => {
    if (done || img.dataset.wanted !== url) return;   // already ran, or the user moved on
    done = true;
    whenReady();
  };
  img.dataset.wanted = url;
  img.onload = ready;
  img.onerror = ready;
  setTimeout(ready, 1500);
  img.src = url;
  if (img.complete) ready();                   // already in the browser cache
}

/* ------------------------------------------------------------
   7. ROUTER — hash-based views: "#obj/<id>" opens one object,
   any other hash (also the old "#login" and "#register") shows
   the gallery. The 404 view is opened by openDetail().
   ------------------------------------------------------------ */
function showView(name) {
  const leavingDetail = document.body.classList.contains("detail-open") && name !== "detail";
  const enteringDetail = !document.body.classList.contains("detail-open") && name === "detail";
  if (enteringDetail) galleryScrollY = window.scrollY;
  $$(".view").forEach(v => v.classList.toggle("is-active", v.id === "view-" + name));
  document.body.classList.toggle("detail-open", name === "detail");
  if (leavingDetail) window.scrollTo(0, galleryScrollY);   // back where the reader was
}

/* The script in index.html <head> keeps the page dark while a #obj/ link
   opens. Show the page again when the view is ready. */
function showPage() {
  document.documentElement.classList.remove("opening-detail");
}

function route() {
  const h = location.hash.replace("#", "");
  if (h.startsWith("obj/")) {
    openDetail(h.slice(4)).finally(showPage);   // the details come from BGAPI first
    return;
  }
  showPage();
  showView("gallery");
}

/* ------------------------------------------------------------
   8. SHELL: the Ambience switch in the top bar. It turns the
   moving starfield on and off; the choice is kept in
   localStorage ("co-ambience": "0" = off).
   ------------------------------------------------------------ */
function setAmbience(on) {
  document.body.classList.toggle("low-ambience", !on);
  localStorage.setItem("co-ambience", on ? "1" : "0");
  const button = $("#ambienceBtn");
  button.setAttribute("aria-pressed", String(on));
  button.querySelector(".bi").className = "bi " + (on ? "bi-star-half" : "bi-stars");
}

function initShell() {
  $("#ambienceBtn").addEventListener("click", () =>
    setAmbience(document.body.classList.contains("low-ambience")));
  if (localStorage.getItem("co-ambience") === "0") setAmbience(false);
}

/* ------------------------------------------------------------
   9. EVENT DELEGATION — cards, favorites, related items
   ------------------------------------------------------------ */
/* Update one star button in place (filled or empty) */
function updateStar(button, isFav) {
  button.classList.toggle("is-fav", isFav);
  button.setAttribute("aria-pressed", String(isFav));
  button.querySelector("i").className = "bi bi-star" + (isFav ? "-fill" : "");
}

function initDelegation() {
  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.stopPropagation();
      const id = fav.dataset.fav;
      state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
      localStorage.setItem("co-favs", JSON.stringify([...state.favs]));
      updateStar(fav, state.favs.has(id));
      renderGrid();                      // only needed when "Favorites" is on
      return;
    }
    const card = e.target.closest(".uao-card, .related-item");
    if (card) location.hash = objectLink(card.dataset.id);   // deep-linkable
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".uao-card, .related-item");
    if (card) { e.preventDefault(); location.hash = objectLink(card.dataset.id); }
  });
  /* Detail view keys: Esc = back, ← / → = previous / next object.
     Not while typing in a field. */
  document.addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("detail-open")) return;
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "Escape") closeDetail();
    else if (e.key === "ArrowRight") stepDetail(1);
    else if (e.key === "ArrowLeft") stepDetail(-1);
  });
  $("#detailPrev").addEventListener("click", () => stepDetail(-1));
  $("#detailNext").addEventListener("click", () => stepDetail(1));
  initScrollHint();
  initTyping();
  $("#detailBack").addEventListener("click", closeDetail);
}

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
  initShell();
  initFilters();
  initDelegation();
  initPhotoList();
  syncPills();
  $("#resultCount").textContent = "Loading catalog…";
  loadCatalog().then(() => {
    initHero();
    renderGrid();
    window.addEventListener("hashchange", route);
    route();
  });
});
