/**
 * UniversalAstronomicalObject Model
 * ---------------------------------
 * This model represents ANY astronomical object from ANY catalog:
 * SAC (deep-sky), SIMBAD (stars, AGN, variables), NASA Exoplanet Archive,
 * and JPL Horizons (Solar System bodies).
 *
 * It is normalized, and designed for your SPA’s
 * controllers, search system, and future DI architecture.
 *
 * This extended version includes:
 * - Stable internal ID
 * - Source priority map (for future merging logic)
 * - Data quality indicator
 * - Tags for UI filtering
 * - Coordinate epoch (J2000, J2015, etc.)a
 */

export default class UniversalAstronomicalObject {

    /**
     * @param {Object} data - Raw object data from any catalog source
     */
    constructor(data = {}) {

        /**
         * Stable internal ID.
         * This ensures objects remain uniquely identifiable even if names change.
         */
        this.id = data.id || crypto.randomUUID();

        /**
         * Primary name or designation (NGC, HD, Kepler‑22b, Europa, etc.)
         */
        this.name = data.name || "";

        /**
         * Alternate identifiers from other catalogs
         * (NGC, IC, Messier, SIMBAD IDs, exoplanet names, JPL IDs, etc.)
         */
        this.aliases = data.aliases || [];

        /**
         * High‑level category of the object:
         * "galaxy", "nebula", "open_cluster", "globular_cluster",
         * "star", "variable_star", "exoplanet", "planet", "moon",
         * "asteroid", "comet", "quasar", "AGN", "supernova", etc.
         */
        this.category = data.category || "";

        /**
         * More specific classification:
         * - Galaxies: "spiral", "elliptical", "irregular", "barred_spiral"
         * - Stars: "red_dwarf", "giant", "white_dwarf", "O-type", etc.
         * - Exoplanets: "gas_giant", "super_earth", "terrestrial"
         * - Nebulae: "planetary", "emission", "reflection", "dark"
         */
        this.subcategory = data.subcategory || "";

        /**
         * Catalog sources that contributed data:
         * ["SAC"], ["SIMBAD"], ["NASA"], ["JPL"], or combinations.
         * Useful for UI display and debugging.
         */
        this.catalogSource = data.catalogSource || [];

        /**
         * Source priority map.
         * Determines which catalog's data should be trusted during merging.
         * Example:
         * {
         *   coordinates: "SIMBAD",
         *   photometry: "SIMBAD",
         *   exoplanet: "NASA",
         *   solarSystem: "JPL",
         *   deepSky: "SAC"
         * }
         */
        this.sourcePriority = data.sourcePriority || {};

        /**
         * Data quality indicator:
         * "high" (SIMBAD, NASA), "medium" (SAC), "low" (user-uploaded), "unknown"
         */
        this.dataQuality = data.dataQuality || "unknown";

        /**
         * Right Ascension (J2000 or other epoch)
         * String format "HH MM SS" or "HH MM.M"
         */
        this.ra = data.ra || null;

        /**
         * Declination (J2000 or other epoch)
         * String format "+DD MM SS" or "+DD MM"
         */
        this.dec = data.dec || null;

        /**
         * Coordinate epoch (e.g., "J2000", "J2015", "ICRS")
         * Important for future catalogs like Gaia DR3.
         */
        this.coordinatesEpoch = data.coordinatesEpoch || "J2000";

        /**
         * Distance to the object.
         * Units depend on category:
         * - Stars/exoplanets: parsecs or light‑years
         * - Galaxies: millions of light‑years
         * - Solar System: AU or km
         */
        this.distance = data.distance || null;

        /**
         * Apparent magnitude (if applicable)
         */
        this.magnitude = data.magnitude ?? null;

        /**
         * Spectral type (stars only)
         * Examples: "G2V", "M5III", "O9", "K1V"
         */
        this.spectralType = data.spectralType || null;

        /**
         * Physical properties (if known)
         * Mass in solar masses, radius in solar radii or km,
         * temperature in Kelvin, luminosity in solar units.
         */
        this.mass = data.mass ?? null;
        this.radius = data.radius ?? null;
        this.temperature = data.temperature ?? null;
        this.luminosity = data.luminosity ?? null;

        /**
         * Exoplanet‑specific fields
         */
        this.orbitalPeriod = data.orbitalPeriod ?? null;   // days
        this.semiMajorAxis = data.semiMajorAxis ?? null;   // AU
        this.eccentricity = data.eccentricity ?? null;
        this.discoveryMethod = data.discoveryMethod || null;

        /**
         * Solar System‑specific fields (JPL Horizons)
         */
        this.parentBody = data.parentBody || null;         // e.g., "Jupiter" for Europa
        this.orbitalElements = data.orbitalElements || null;

        /**
         * Deep‑sky object fields (SAC/SIMBAD)
         */
        this.sizeMax = data.sizeMax || null;               // "5.2m", "45s", etc.
        this.sizeMin = data.sizeMin || null;
        this.positionAngle = data.positionAngle ?? null;
        this.surfaceBrightness = data.surfaceBrightness ?? null;

        /**
         * Tags for UI filtering and categorization.
         * Examples:
         * ["edge-on", "dust-lane", "habitable-zone", "icy-moon"]
         */
        this.tags = data.tags || [];

        /**
         * Human‑readable description (from SAC, SIMBAD, NASA, etc.)
         */
        this.description = data.description || "";

        /**
         * Additional notes (common names, companions, scientific notes)
         */
        this.notes = data.notes || "";

        /**
         * Optional: NASA, ESA, SIMBAD, or custom image URL
         */
        this.imageUrl = data.imageUrl || null;

        /**
         * Optional: user interactions (likes, favorites)
         */
        this.likedBy = data.likedBy || [];

        /**
         * Optional: metadata
         */
        this.createdBy = data.createdBy || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }
}


/*
✨ A dummy dataset (10–20 objects) ✨ An import helper ✨ A universal card renderer ✨ A search/filter system based on this model


*/