/* ============================================================
   COSMIC ORIGINS — application shell
   Static build: mock catalog shaped like UniversalAstronomicalObject.
   BGAPI wiring is described in docs/briefs/cosmic-origins-platform.md.
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   1. MOCK CATALOG
   Fields mirror src/models/UniversalAstronomicalObject.js so a
   later pass can swap this array for BGAPI data.
   ph = placeholder tint per category.
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

const CATALOG = [
  { id: "m31", name: "Andromeda", designation: "M 31 · NGC 224", category: "galaxy", subcategory: "spiral galaxy",
    constellation: "Andromeda", ra: "00h 42m 44s", dec: "+41° 16′ 09″", distance: "2.537 Mly", magnitude: "3.44", discovered: "964 AD",
    imageUrl: "", favorites: 0,
    description: "The nearest major galaxy to the Milky Way and the largest member of the Local Group. On a collision course with our own galaxy, expected to merge in roughly 4.5 billion years. Visible to the naked eye from dark sites as a faint smudge spanning six full moons of sky." },
  { id: "m83", name: "Southern Pinwheel", designation: "M 83 · NGC 5236", category: "galaxy", subcategory: "barred spiral",
    constellation: "Hydra", ra: "13h 37m 01s", dec: "−29° 51′ 57″", distance: "15.21 Mly", magnitude: "7.54", discovered: "1752",
    imageUrl: "", favorites: 0,
    description: "A grand-design barred spiral seen nearly face-on, one of the closest and brightest of its kind. It has hosted six observed supernovae, more than almost any other galaxy, and its arms blaze with pink star-forming regions." },
  { id: "m16", name: "Eagle Nebula", designation: "M 16 · NGC 6611", category: "nebula", subcategory: "emission nebula",
    constellation: "Serpens", ra: "18h 18m 48s", dec: "−13° 49′ 00″", distance: "5,700 ly", magnitude: "6.0", discovered: "1745",
    imageUrl: "", favorites: 0,
    description: "Home of the Pillars of Creation — towers of cold gas and dust several light-years tall, sculpted by ultraviolet radiation from the young hot stars of the embedded cluster. An active stellar nursery where new suns are condensing right now." },
  { id: "m42", name: "Orion Nebula", designation: "M 42 · NGC 1976", category: "nebula", subcategory: "diffuse nebula",
    constellation: "Orion", ra: "05h 35m 17s", dec: "−05° 23′ 28″", distance: "1,344 ly", magnitude: "4.0", discovered: "1610",
    imageUrl: "", favorites: 0,
    description: "The brightest nebula in Earth's sky and the closest region of massive star formation. The Trapezium cluster at its heart illuminates the surrounding gas; over 700 stars in various stages of formation have been identified within it." },
  { id: "m45", name: "Pleiades", designation: "M 45 · Seven Sisters", category: "cluster", subcategory: "open cluster",
    constellation: "Taurus", ra: "03h 47m 24s", dec: "+24° 07′ 00″", distance: "444 ly", magnitude: "1.6", discovered: "antiquity",
    imageUrl: "", favorites: 0,
    description: "A young open cluster of hot blue stars less than 100 million years old, drifting through a chance cloud of interstellar dust that reflects their light as a blue haze. Among the nearest clusters and the most obvious to the naked eye." },
  { id: "ngc5139", name: "Omega Centauri", designation: "NGC 5139", category: "cluster", subcategory: "globular cluster",
    constellation: "Centaurus", ra: "13h 26m 47s", dec: "−47° 28′ 46″", distance: "17,090 ly", magnitude: "3.9", discovered: "1677",
    imageUrl: "", favorites: 0,
    description: "The largest known globular cluster of the Milky Way: roughly ten million stars packed into a sphere 150 light-years across. Possibly the stripped core of a dwarf galaxy consumed by our own long ago." },
  { id: "betelgeuse", name: "Betelgeuse", designation: "α Orionis · HD 39801", category: "star", subcategory: "red supergiant",
    constellation: "Orion", ra: "05h 55m 10s", dec: "+07° 24′ 25″", distance: "548 ly", magnitude: "0.50 (var)", discovered: "antiquity",
    imageUrl: "", favorites: 0,
    description: "A red supergiant so large that, placed at the Sun's position, its surface would extend past the orbit of Mars. Its Great Dimming of 2019–2020 was traced to an ejected dust cloud. A supernova candidate on astronomical timescales." },
  { id: "proxima", name: "Proxima Centauri", designation: "α Cen C · GJ 551", category: "star", subcategory: "red dwarf",
    constellation: "Centaurus", ra: "14h 29m 43s", dec: "−62° 40′ 46″", distance: "4.246 ly", magnitude: "11.13", discovered: "1915",
    imageUrl: "", favorites: 0,
    description: "The closest star to the Sun — a small, cool red dwarf that flares violently despite its size. It hosts at least two planets, including Proxima b, an Earth-mass world orbiting within the star's habitable zone." },
  { id: "trappist1e", name: "TRAPPIST-1e", designation: "2MASS J23062928-0502285 e", category: "exoplanet", subcategory: "terrestrial",
    constellation: "Aquarius", ra: "23h 06m 29s", dec: "−05° 02′ 29″", distance: "40.7 ly", magnitude: "—", discovered: "2017",
    imageUrl: "", favorites: 0,
    description: "The fourth of seven Earth-sized worlds around the ultracool dwarf TRAPPIST-1, and the most likely to hold liquid water: rocky, slightly smaller than Earth, receiving stellar energy comparable to our own planet." },
  { id: "kepler186f", name: "Kepler-186f", designation: "KOI-571.05", category: "exoplanet", subcategory: "terrestrial",
    constellation: "Cygnus", ra: "19h 54m 36s", dec: "+43° 57′ 18″", distance: "579 ly", magnitude: "—", discovered: "2014",
    imageUrl: "", favorites: 0,
    description: "The first Earth-sized planet ever confirmed in the habitable zone of another star. It circles a red dwarf every 130 days at the outer edge of the zone, where water could persist if a suitable atmosphere exists." },
  { id: "jupiter", name: "Jupiter", designation: "Sol V", category: "solar_system", subcategory: "gas giant",
    constellation: "—", ra: "ephemeris", dec: "ephemeris", distance: "5.20 AU", magnitude: "−2.94", discovered: "antiquity",
    imageUrl: "", favorites: 0,
    description: "The Solar System's giant: more than twice the mass of all other planets combined. Its Great Red Spot is a storm wider than Earth that has raged for centuries, and its four Galilean moons form a planetary system in miniature." },
  { id: "europa", name: "Europa", designation: "Jupiter II", category: "solar_system", subcategory: "icy moon",
    constellation: "—", ra: "ephemeris", dec: "ephemeris", distance: "5.20 AU", magnitude: "5.29", discovered: "1610",
    imageUrl: "", favorites: 0,
    description: "An ice-shelled moon hiding a global saltwater ocean with more liquid water than all of Earth's seas. Tidal flexing keeps the ocean liquid, making Europa one of the most promising places to search for life beyond Earth." },
  { id: "sgra", name: "Sagittarius A*", designation: "Sgr A*", category: "exotic", subcategory: "supermassive black hole",
    constellation: "Sagittarius", ra: "17h 45m 40s", dec: "−29° 00′ 28″", distance: "26,673 ly", magnitude: "—", discovered: "1974",
    imageUrl: "", favorites: 0,
    description: "The supermassive black hole at the center of the Milky Way, 4.3 million times the mass of the Sun. Imaged directly by the Event Horizon Telescope in 2022 as a glowing ring of superheated plasma around a shadow." },
  { id: "crab", name: "Crab Pulsar", designation: "PSR B0531+21", category: "exotic", subcategory: "neutron star",
    constellation: "Taurus", ra: "05h 34m 32s", dec: "+22° 00′ 52″", distance: "6,500 ly", magnitude: "16.5", discovered: "1968",
    imageUrl: "", favorites: 0,
    description: "The collapsed core of the supernova witnessed in 1054 AD: a city-sized star spinning 30 times per second, sweeping beams of radiation across space and energizing the entire Crab Nebula around it." },
];

/* Verified NASA Image Library assets (images-assets.nasa.gov is a
   stable, hotlink-friendly CDN; every URL below returned HTTP 200
   at build time). Frames still degrade to the styled placeholder
   if any ever vanish. */
const IMAGES = {
  m31:        "https://images-assets.nasa.gov/image/PIA04921/PIA04921~large.jpg",
  m83:        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001262/GSFC_20171208_Archive_e001262~large.jpg",
  m16:        "https://images-assets.nasa.gov/image/PIA03096/PIA03096~large.jpg",
  m42:        "https://images-assets.nasa.gov/image/PIA01322/PIA01322~large.jpg",
  m45:        "https://images-assets.nasa.gov/image/PIA09262/PIA09262~large.jpg",
  ngc5139:    "https://images-assets.nasa.gov/image/PIA13125/PIA13125~large.jpg",
  betelgeuse: "https://images-assets.nasa.gov/image/PIA16680/PIA16680~orig.jpg",
  proxima:    "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000968/GSFC_20171208_Archive_e000968~large.jpg",
  trappist1e: "https://images-assets.nasa.gov/image/PIA24371/PIA24371~large.jpg",
  kepler186f: "https://images-assets.nasa.gov/image/PIA17999/PIA17999~large.jpg",
  jupiter:    "https://images-assets.nasa.gov/image/PIA04866/PIA04866~large.jpg",
  europa:     "https://images-assets.nasa.gov/image/PIA17043/PIA17043~large.jpg",
  sgra:       "https://images-assets.nasa.gov/image/PIA12348/PIA12348~large.jpg",
  crab:       "https://images-assets.nasa.gov/image/PIA03606/PIA03606~large.jpg",
};
CATALOG.forEach(o => { o.imageUrl = IMAGES[o.id] || ""; });

const CATEGORY_LABELS = {
  galaxy: "Galaxies", nebula: "Nebulae", cluster: "Clusters", star: "Stars",
  exoplanet: "Exoplanets", solar_system: "Solar System", exotic: "Exotic",
};

/* ------------------------------------------------------------
   2. STATE
   ------------------------------------------------------------ */
const state = {
  active: new Set(Object.keys(CATEGORY_LABELS)),   // all on
  query: "",
  favOnly: false,                                   // "★ Favorites" pill; starts off on every visit
  favs: new Set(JSON.parse(localStorage.getItem("co-favs") || "[]")),
};

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
      const breathe = Math.sin(t / 5000 + nebula.userData.phase);
      nebula.material.opacity = nebula.userData.baseOpacity * (0.8 + 0.2 * breathe);
      nebula.material.rotation += 0.00008;        // gas slowly swirls
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
   4. CARD GRID
   ------------------------------------------------------------ */
function frameHTML(obj, small) {
  const tint = CATEGORY_TINTS[obj.category] || "rgba(80,110,180,0.22)";
  /* cards load the lighter ~medium rendition; hero/detail use full */
  const thumb = obj.imageUrl.replace("~large.jpg", "~medium.jpg");
  const img = obj.imageUrl
    ? `<img src="${thumb}" alt="${obj.name}" loading="lazy"
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
  return `<article class="uao-card brackets" data-id="${obj.id}" tabindex="0"
            role="button" aria-label="Open ${obj.name} telemetry">
    <div style="position:relative">
      ${frameHTML(obj)}
      <button class="uao-fav${favCls}" data-fav="${obj.id}" aria-pressed="${isFav}"
              aria-label="Favorite ${obj.name}">
        <i class="bi bi-star${isFav ? "-fill" : ""}"></i>
      </button>
    </div>
    <div class="uao-meta">
      <h3 class="uao-name">${obj.name}</h3>
      <div class="uao-desig"><i>${obj.designation}</i></div>
      <div class="uao-tags">
        <span class="tag tag--cat">${CATEGORY_LABELS[obj.category] || obj.category}</span>
        <span class="tag">${obj.subcategory}</span>
      </div>
    </div>
  </article>`;
}

/* Does this object pass the current filters, search and favorites toggle? */
function isVisible(obj) {
  const q = state.query.toLowerCase();
  const matchesSearch = !q ||
    obj.name.toLowerCase().includes(q) || obj.designation.toLowerCase().includes(q);
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
  if (!grid.children.length) grid.innerHTML = CATALOG.map(cardHTML).join("");

  const items = CATALOG.filter(isVisible);
  $$(".uao-card", grid).forEach(card => {
    const obj = CATALOG.find(o => o.id === card.dataset.id);
    card.hidden = !isVisible(obj);
  });
  $("#resultCount").textContent = countText(items.length, CATALOG.length);
  const empty = $("#emptyState");
  empty.innerHTML = emptyHTML();
  empty.style.display = items.length ? "none" : "block";
}

/* ------------------------------------------------------------
   4b. HERO — full-bleed featured-observation carousel
   ------------------------------------------------------------ */
const FEATURED = ["m16", "jupiter", "m31", "sgra", "m45", "crab"];
let heroIdx = 0, heroTimer = null;

function heroShow(i) {
  heroIdx = (i + FEATURED.length) % FEATURED.length;
  const obj = CATALOG.find(o => o.id === FEATURED[heroIdx]);
  $$(".hero-slide").forEach((s, k) => s.classList.toggle("is-active", k === heroIdx));
  $$(".hero-dot").forEach((d, k) => d.classList.toggle("is-active", k === heroIdx));
  $("#heroName").textContent = obj.name;
  $("#heroDesig").textContent = obj.designation + " · " + obj.distance;
}

function heroPlay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => heroShow(heroIdx + 1), 7000);
}

function initHero() {
  const slides = $("#heroSlides");
  slides.innerHTML = FEATURED.map((id, k) => {
    const obj = CATALOG.find(o => o.id === id);
    return `<div class="hero-slide${k === 0 ? " is-active" : ""}">
      <img src="${obj.imageUrl}" alt="${obj.name}"
           ${k === 0 ? "" : 'loading="lazy"'} onerror="this.remove()">
    </div>`;
  }).join("");
  $("#heroDots").innerHTML = FEATURED.map((id, k) =>
    `<button class="hero-dot${k === 0 ? " is-active" : ""}" data-hero="${k}"
       aria-label="Show observation ${k + 1}"></button>`).join("");

  $("#heroPrev").addEventListener("click", () => { heroShow(heroIdx - 1); heroPlay(); });
  $("#heroNext").addEventListener("click", () => { heroShow(heroIdx + 1); heroPlay(); });
  $("#heroDots").addEventListener("click", (e) => {
    const d = e.target.closest("[data-hero]");
    if (d) { heroShow(+d.dataset.hero); heroPlay(); }
  });
  $("#heroOpen").addEventListener("click", () =>
    location.hash = objectLink(FEATURED[heroIdx]));
  const hero = $("#hero");
  hero.addEventListener("mouseenter", () => clearInterval(heroTimer));
  hero.addEventListener("mouseleave", heroPlay);

  heroShow(0);
  heroPlay();
}

/* ------------------------------------------------------------
   5. FILTER PILLS — multi-select; "All" turns every category back on
   ------------------------------------------------------------ */
function syncPills() {
  $$(".pill[data-cat]").forEach(p =>
    p.setAttribute("aria-pressed", String(state.active.has(p.dataset.cat))));
  $("#pillAll").setAttribute("aria-pressed",
    String(state.active.size === Object.keys(CATEGORY_LABELS).length));
  $("#pillFav").setAttribute("aria-pressed", String(state.favOnly));
}

function initFilters() {
  $("#pillAll").addEventListener("click", () => {
    state.active = new Set(Object.keys(CATEGORY_LABELS));   // a reset: never turns all off
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
let lastRoute = "gallery";
let galleryScrollY = 0;        // where the gallery was, so we can go back to the same place

/* The one place that knows what a link to an object looks like.
   (The platform brief changes it to "#/object/<slug>": edit only here.) */
function objectLink(id) {
  return "obj/" + id;
}

/* The full-size NASA file: "~orig.jpg" instead of "~large.jpg" */
function originalImageUrl(obj) {
  return obj.imageUrl.replace("~large.jpg", "~orig.jpg");
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
  let list = CATALOG.filter(isVisible);
  if (!list.some(o => o.id === id)) list = CATALOG;    // opened from outside the list
  const i = list.findIndex(o => o.id === id);
  const next = list[(i + step + list.length) % list.length];
  if (next.id !== id) location.hash = objectLink(next.id);
}

/* Back to the gallery (the "Back" button and the Esc key) */
function closeDetail() {
  location.hash = lastRoute === "gallery" ? "" : lastRoute;
  showView(lastRoute);
}

function openDetail(id) {
  const obj = CATALOG.find(o => o.id === id);
  if (!obj) return;
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
  img.alt = obj.name;
  $("#detailImgLink").href = originalImageUrl(obj);
  $("#detailTitle").textContent = obj.name;
  $("#detailDesig").textContent = obj.designation;
  prepareTyping($("#detailDesc"), obj.description);

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
  /* --i is each cell's position; the CSS uses it to bring the cells in one by one */
  $("#telemetry").innerHTML = rows.map(([k, v], i) =>
    `<div style="--i:${i}"><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  const related = CATALOG.filter(o => o.category === obj.category && o.id !== obj.id);
  $("#relatedRail").innerHTML = related.map(o =>
    `<div class="related-item brackets" data-id="${o.id}" tabindex="0" role="button"
       aria-label="Open ${o.name}">
       ${frameHTML(o, true)}<h4 class="uao-name">${o.name}</h4>
     </div>`).join("");
  $("#relatedLabel").textContent = "More in " + (CATEGORY_LABELS[obj.category] || obj.category);
  $("#relatedWrap").style.display = related.length ? "block" : "none";

  showView("detail");
  panel.scrollTop = 0;
  /* Everything stays hidden (is-waiting); once the picture is here, the
     whole entrance plays together, the same in every browser. */
  loadPicture(img, obj.imageUrl, () => {
    panel.classList.remove("is-waiting");
    replayAnimation(panel, "is-entering");    // title and data slide in
    replayAnimation(img, "is-arriving");      // picture comes into focus
  });
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
   7. ROUTER — hash-based views: gallery (default), login,
   register, offline module stub
   ------------------------------------------------------------ */
const ROUTES = ["gallery", "login", "register", "detail"];

function showView(name) {
  const leavingDetail = document.body.classList.contains("detail-open") && name !== "detail";
  const enteringDetail = !document.body.classList.contains("detail-open") && name === "detail";
  if (enteringDetail) galleryScrollY = window.scrollY;
  $$(".view").forEach(v => v.classList.toggle("is-active", v.id === "view-" + name));
  $$(".side-link[data-route]").forEach(l =>
    l.classList.toggle("is-active", l.dataset.route === name));
  document.body.classList.toggle("detail-open", name === "detail");
  if (name !== "detail") lastRoute = name;
  if (leavingDetail) window.scrollTo(0, galleryScrollY);   // back where the reader was
}

function route() {
  const h = location.hash.replace("#", "") || "gallery";
  document.documentElement.classList.remove("opening-detail");   // see the script in index.html <head>
  if (h.startsWith("obj/")) { openDetail(h.slice(4)); return; }
  showView(ROUTES.includes(h) && h !== "detail" ? h : "gallery");
}

/* ------------------------------------------------------------
   8. SHELL: sidebar collapse (bug B), ambience toggle, clock
   ------------------------------------------------------------ */
function initShell() {
  const sidebar = $("#sidebar");

  const setCollapsed = (on) => {
    sidebar.classList.toggle("is-collapsed", on);
    document.body.classList.toggle("sidebar-collapsed", on);
    localStorage.setItem("co-sidebar", on ? "1" : "0");
    $("#collapseBtn").setAttribute("aria-expanded", String(!on));
  };
  $("#collapseBtn").addEventListener("click", () =>
    setCollapsed(!sidebar.classList.contains("is-collapsed")));
  // restore persisted state; force rail on narrow screens
  setCollapsed(localStorage.getItem("co-sidebar") === "1" || window.innerWidth < 992);
  window.addEventListener("resize", () => {
    if (window.innerWidth < 992) setCollapsed(true);
  });

  // ambience toggle (replaces the old dark/light switch — the
  // cockpit is dark by design; this controls motion & glow)
  $("#ambienceBtn").addEventListener("click", () => {
    const off = document.body.classList.toggle("low-ambience");
    localStorage.setItem("co-ambience", off ? "0" : "1");
    $("#ambienceBtn .bi").className = "bi " + (off ? "bi-stars" : "bi-star-half");
    $("#ambienceLabel").textContent = off ? "Ambience off" : "Ambience on";
  });
  if (localStorage.getItem("co-ambience") === "0") $("#ambienceBtn").click();

  // UTC mission clock
  const clock = $("#systemClock");
  const tick = () => {
    const d = new Date();
    clock.textContent = "UTC " + d.toISOString().slice(11, 19) +
      " · " + d.toISOString().slice(0, 10);
  };
  tick(); setInterval(tick, 1000);
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
   10. AUTH STUBS — visual only; wiring lives in follow-ups.md
   ------------------------------------------------------------ */
function initAuthStubs() {
  $$("form[data-stub]").forEach(f => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = f.querySelector(".auth-note");
    note.textContent = "▸ Access control is not yet linked to the identity service. See follow-ups.md.";
  }));
}

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
  initShell();
  initHero();
  initFilters();
  initDelegation();
  initAuthStubs();
  syncPills();
  renderGrid();
  window.addEventListener("hashchange", route);
  route();
});
