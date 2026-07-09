# 🌌 Cosmic Origins

_A real astronomical object catalog — explore, search, and curate the universe._

**Cosmic Origins** is a single-page web application for cataloging and exploring real astronomical objects — galaxies, nebulae, star clusters, stars, exoplanets, planets, moons, and more. Built as a hands-on project to learn full-stack web development with Firebase and vanilla JavaScript.

---

## ✨ Features

- **Universal Astronomical Object (UAO) catalog** — a unified data model for normalizing astronomical objects from multiple real-world catalogs (SAC, SIMBAD, NASA Exoplanet Archive, JPL Horizons)
- **Firebase Authentication** — email/password login and registration
- **Firestore database** — persistent storage for user-contributed objects
- **NASA Image API integration** — search and display real NASA imagery by category
- **Category filtering** — filter by Galaxies, Nebulae, Clusters, Stars, Exoplanets, Solar System bodies, and Exotic objects
- **Text search** — prefix-based Firestore search across object names
- **Image carousel** — Bootstrap-powered slideshow of catalog images
- **Image modal viewer** — click any card image to see it full-size
- **Like/favorite system** — authenticated users can like objects
- **Food cost calculator** — a quirky utility that calculates lifetime food energy consumption and cost with Chart.js visualizations
- **Multiple themes** — Dark, Light, Cosmic, Cosmic Retro, Cosmic Nebula, and Cosmic Flare
- **Responsive design** — Bootstrap 5 grid with animated side navigation
- **localStorage caching** — reduces Firestore reads for returning visitors

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JavaScript (ES6+), jQuery 3.6 |
| **UI Framework** | Bootstrap 5.3, Bootstrap Icons, Font Awesome 6 |
| **Charts** | Chart.js |
| **Backend / BaaS** | Firebase (Firestore + Authentication) |
| **External API** | NASA Image API |
| **Hosting** | GitHub Pages |
| **Fonts** | Alsandra, Buxton Sketch, Guildof, Lobster, Qt Arabian, Cormorant Garamond, Inter |

No build tools, no bundler, no framework — plain HTML, CSS, and JavaScript served directly.

---

## 📁 Project Structure

```
cosmic-origins/
├── index.html                     # Main SPA entry point
├── index-old.html                 # Earlier landing page prototype
├── src/
│   ├── core/
│   │   ├── index.js               # App logic: routing, themes, search, filters, controllers
│   │   ├── auth.js                # Firebase auth: login, register, logout, UI state
│   │   └── firebase-config.js     # Firebase initialization and global refs
│   ├── models/
│   │   └── UniversalAstronomicalObject.js   # UAO data model (ES6 class)
│   ├── ui/
│   │   ├── uao-service.js         # CRUD operations, card rendering, search
│   │   ├── carousel.js            # Bootstrap carousel renderer
│   │   ├── nasa.js                # NASA Image API integration
│   │   ├── food-cost.js           # Food energy/cost calculator + Chart.js
│   │   ├── modal-images.js        # Image modal viewer
│   │   ├── side-navigation.js     # Animated side-nav open/close
│   │   └── sidebar.html           # Sidebar component template
│   └── helpers/
│       └── firestoreImport.js     # Bulk Firestore import + dummy dataset (~20 objects)
├── styles/
│   ├── styles.css                 # Design system: CSS variables, themes, typography, layout
│   ├── index.css                  # Page-specific styles
│   ├── navigation.css             # Side navigation styles
│   ├── uao-styles.css             # UAO card and form styles
│   └── fonts.css                  # Custom font-face declarations
├── fonts/                         # Custom web fonts (TTF/OTF)
├── images/                        # Static images and icons
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- A Firebase project with Firestore and Email/Password Authentication enabled
- A NASA API key (free tier available at [api.nasa.gov](https://api.nasa.gov))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/BaiGanio/cosmic-origins.git
   cd cosmic-origins
   ```

2. **Configure Firebase**
   - Replace the `firebaseConfig` object in `src/core/firebase-config.js` with your own Firebase project credentials.

3. **Configure NASA API key**
   - Replace the `Authorization` header in `src/ui/nasa.js` with your own NASA API key.

4. **Open in browser**
   - Open `index.html` directly, or serve with any static file server:
     ```bash
     npx serve .
     ```

### Seeding Data

The file `src/helpers/firestoreImport.js` contains a dummy dataset of ~20 real astronomical objects (NGC 891, M42 Orion Nebula, M13 Hercules Cluster, Sirius, Kepler-22b, Europa, etc.) and a `importToFirestore()` function. Open the browser console and call it to populate your Firestore database.

---

## 🧩 Data Model

The `UniversalAstronomicalObject` (UAO) model normalizes data from multiple astronomical catalogs into a single schema:

| Field | Description |
|---|---|
| `name` | Primary designation (NGC 891, Kepler-22b, etc.) |
| `aliases` | Alternate catalog identifiers |
| `category` | High-level type: galaxy, nebula, star, exoplanet, planet, moon, asteroid, comet, quasar, AGN, supernova |
| `subcategory` | Specific classification (spiral, emission, red_dwarf, gas_giant, etc.) |
| `catalogSource` | Origin catalogs: SAC, SIMBAD, NASA, JPL |
| `ra` / `dec` | Right Ascension and Declination (J2000 epoch) |
| `distance` | Distance in appropriate units (ly, Mly, AU, pc) |
| `magnitude` | Apparent magnitude |
| `spectralType` | Stellar spectral classification |
| `mass` / `radius` / `temperature` / `luminosity` | Physical properties |
| `orbitalPeriod` / `semiMajorAxis` / `eccentricity` | Exoplanet orbital elements |
| `parentBody` | Solar System parent (e.g., "Jupiter" for Europa) |
| `tags` | UI filter tags |
| `imageUrl` | Associated image URL |

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2021 Lyuben Kikov

---

## ✨ Author

Created by **Lyuben Kikov** — a developer exploring full-stack web development, Firebase, and the cosmos.

- GitHub: [@BaiGanio](https://github.com/BaiGanio)
