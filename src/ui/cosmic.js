/* ============================================================
   COSMIC ORIGINS — application shell
   Static build: mock catalog shaped like UniversalAstronomicalObject.
   Firestore / NASA imagery wiring is documented in follow-ups.md.
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   1. MOCK CATALOG
   Fields mirror src/models/UniversalAstronomicalObject.js so a
   later pass can swap this array for a Firestore query result.
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
    try { return starfield3D(canvas); } catch (e) { /* fall through */ }
  }
  starfield2D(canvas);
}

function starfield3D(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1200);

  /* star cloud: 2600 points in a long tube the camera travels through */
  const N = 2600, DEPTH = 900;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const tints = [
    [0.81, 0.89, 0.96],   // ice white-blue (most stars)
    [0.81, 0.89, 0.96],
    [0.81, 0.89, 0.96],
    [0.49, 0.83, 0.91],   // ion cyan
    [1.0, 0.77, 0.42],    // signal amber
  ];
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 700;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 500;
    pos[i * 3 + 2] = -Math.random() * DEPTH;
    const t = tints[(Math.random() * tints.length) | 0];
    const dim = 0.45 + Math.random() * 0.55;
    col[i * 3] = t[0] * dim; col[i * 3 + 1] = t[1] * dim; col[i * 3 + 2] = t[2] * dim;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.6, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0.85, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(stars);

  /* nebula glow: big soft radial-gradient sprites, additive, very low opacity */
  function glowTexture(r, g, b) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    const grad = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.18)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = grad;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const nebulae = [];
  [
    { rgb: [70, 110, 200],  p: [-220, 90, -420], s: 620 },   // blue drift
    { rgb: [150, 70, 140],  p: [260, -120, -560], s: 720 },  // magenta drift
    { rgb: [200, 140, 70],  p: [60, 160, -700], s: 560 },    // faint amber
  ].forEach((n, i) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(...n.rgb), transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sp.position.set(...n.p);
    sp.scale.set(n.s, n.s, 1);
    sp.userData.phase = i * 2.1;
    scene.add(sp);
    nebulae.push(sp);
  });

  const mouse = { x: 0, y: 0 };
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
    camera.position.z = z;
    /* faint parallax lean toward the cursor */
    camera.position.x += (mouse.x * 14 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 10 - camera.position.y) * 0.02;
    camera.lookAt(camera.position.x * 0.6, camera.position.y * 0.6, z - 200);
    stars.rotation.z = t / 220000;                // barely-there roll
    nebulae.forEach((n) => {
      n.position.x += Math.sin(t / 9000 + n.userData.phase) * 0.02;
      n.material.opacity = 0.085 + 0.035 * Math.sin(t / 6000 + n.userData.phase);
      /* keep nebulae ahead of the falling camera */
      if (n.position.z > z - 80) n.position.z -= DEPTH / 2;
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
        ctx.fillStyle = s.z > 0.75 ? "#cfe4f4" : "#8fa8c4";
        ctx.fillRect(s.x + mouse.x * 6 * s.z, s.y + mouse.y * 6 * s.z,
          s.z > 0.75 ? 1.6 : 1, s.z > 0.75 ? 1.6 : 1);
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
  const favCount = obj.favorites + (state.favs.has(obj.id) ? 1 : 0);
  const favCls = state.favs.has(obj.id) ? " is-fav" : "";
  return `<article class="uao-card brackets" data-id="${obj.id}" tabindex="0"
            role="button" aria-label="Open ${obj.name} telemetry">
    <div style="position:relative">
      ${frameHTML(obj)}
      <button class="uao-fav${favCls}" data-fav="${obj.id}" aria-label="Favorite ${obj.name}">
        <i class="bi bi-star${state.favs.has(obj.id) ? "-fill" : ""}"></i>${favCount}
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

function renderGrid() {
  const grid = $("#uaoGrid");
  const q = state.query.toLowerCase();
  const items = CATALOG.filter(o =>
    state.active.has(o.category) &&
    (!q || o.name.toLowerCase().includes(q) || o.designation.toLowerCase().includes(q)));
  grid.innerHTML = items.map(cardHTML).join("");
  $("#emptyState").style.display = items.length ? "none" : "block";
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
    location.hash = "obj/" + FEATURED[heroIdx]);
  const hero = $("#hero");
  hero.addEventListener("mouseenter", () => clearInterval(heroTimer));
  hero.addEventListener("mouseleave", heroPlay);

  heroShow(0);
  heroPlay();
}

/* ------------------------------------------------------------
   5. FILTER PILLS — multi-select; "All" reflects & drives the rest
   ------------------------------------------------------------ */
function syncPills() {
  $$(".pill[data-cat]").forEach(p =>
    p.setAttribute("aria-pressed", String(state.active.has(p.dataset.cat))));
  $("#pillAll").setAttribute("aria-pressed",
    String(state.active.size === Object.keys(CATEGORY_LABELS).length));
}

function initFilters() {
  $("#pillAll").addEventListener("click", () => {
    const all = Object.keys(CATEGORY_LABELS);
    state.active = state.active.size === all.length ? new Set() : new Set(all);
    syncPills(); renderGrid();
  });
  $$(".pill[data-cat]").forEach(p => p.addEventListener("click", () => {
    const c = p.dataset.cat;
    state.active.has(c) ? state.active.delete(c) : state.active.add(c);
    syncPills(); renderGrid();
  }));
  const input = $("#searchInput");
  const run = () => { state.query = input.value.trim(); renderGrid(); };
  input.addEventListener("input", run);
  $("#searchBtn").addEventListener("click", run);
  input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
}

/* ------------------------------------------------------------
   6. DETAIL VIEWER
   ------------------------------------------------------------ */
let lastRoute = "gallery";

function openDetail(id) {
  const obj = CATALOG.find(o => o.id === id);
  if (!obj) return;
  const img = $("#detailImg");
  img.src = obj.imageUrl;
  img.alt = obj.name;
  $("#detailTitle").textContent = obj.name;
  $("#detailDesig").textContent = obj.designation;
  $("#detailDesc").textContent = obj.description;

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
  $("#telemetry").innerHTML = rows.map(([k, v]) =>
    `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  const related = CATALOG.filter(o => o.category === obj.category && o.id !== obj.id);
  $("#relatedRail").innerHTML = related.map(o =>
    `<div class="related-item brackets" data-id="${o.id}" tabindex="0" role="button"
       aria-label="Open ${o.name}">
       ${frameHTML(o, true)}<h4 class="uao-name">${o.name}</h4>
     </div>`).join("");
  $("#relatedWrap").style.display = related.length ? "block" : "none";

  showView("detail");
  const panel = $("#view-detail");
  panel.scrollTop = 0;
  panel.classList.remove("is-scanning");
  void panel.offsetWidth;                       // restart the scan sweep
  panel.classList.add("is-scanning");
}

/* ------------------------------------------------------------
   7. ROUTER — hash-based views: gallery (default), login,
   register, offline module stub
   ------------------------------------------------------------ */
const ROUTES = ["gallery", "login", "register", "detail"];

function showView(name) {
  $$(".view").forEach(v => v.classList.toggle("is-active", v.id === "view-" + name));
  $$(".side-link[data-route]").forEach(l =>
    l.classList.toggle("is-active", l.dataset.route === name));
  document.body.classList.toggle("detail-open", name === "detail");
  if (name !== "detail") lastRoute = name;
}

function route() {
  const h = location.hash.replace("#", "") || "gallery";
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
function initDelegation() {
  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.stopPropagation();
      const id = fav.dataset.fav;
      state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
      localStorage.setItem("co-favs", JSON.stringify([...state.favs]));
      renderGrid();
      return;
    }
    const card = e.target.closest(".uao-card, .related-item");
    if (card) location.hash = "obj/" + card.dataset.id;   // deep-linkable
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".uao-card, .related-item");
    if (card) { e.preventDefault(); location.hash = "obj/" + card.dataset.id; }
  });
  $("#detailBack").addEventListener("click", () => {
    location.hash = lastRoute === "gallery" ? "" : lastRoute;
    showView(lastRoute);
  });
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
