// async function fetchNasaImage(query) {
//   const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
//   const res = await fetch(url);
//   const data = await res.json();

//   const items = data.collection.items;
//   if (!items || items.length === 0) return null;

//   const first = items[0];
//   const imageHref = first.links && first.links[0] ? first.links[0].href : null;
//   return imageHref;
// }


async function searchNASA(query, category) {
  // Build the search query dynamically
  const searchTerms = category 
      ? `${category} ${query}` 
      : query;

  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerms)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: "nUPeGQmndz4pCMIepBTKIQRurDOLj3VXM0Tp1AvZ"
    }
  });

  const data = await res.json();
  console.log(data);
  return data.collection.items.slice(0, 20);
}

async function fetchNASA() {
    const query = document.getElementById("searchInput").value.trim();
    const container = document.getElementById("uaoList");
    container.innerHTML = "";

    // Get selected category (only one can be checked)
    const activeFilter = Object.entries(Controllers.Filters.filters)
        .find(([key, cb]) => cb.checked);

    const category = activeFilter ? activeFilter[0].replace("filter", "") : "";
    // If empty → load default objects
    if (query.length === 0 && category === "") {
        loadUniversalObjects();
        return;
    }

    // Call NASA API
    const results = await searchNASA(query, category);

    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p class="text-center text-muted fs-2">No objects found.</p>
            </div>
        `;
        return;
    }
    // Render results
    results.forEach(item => {
        const imageUrl = getLargestImage(item.links);
        const data = {
            imageUrl: imageUrl,
            name: item.data?.[0]?.title || "Untitled",
            description: item.data?.[0]?.description || "",
            category: category
        };

        renderObjectCard(item.data?.[0]?.nasa_id, data);
    });
}
function getLargestImage(links) {
    if (!links || !Array.isArray(links)) return "";

    // Priority order: orig → large → medium → small → thumb → fallback
    const priority = ["~orig", "~large", "~medium", "~small", "~thumb"];

    for (const key of priority) {
        const match = links.find(l => l.href.includes(key));
        if (match) return match.href;
    }

    return links[0]?.href || "";
}

