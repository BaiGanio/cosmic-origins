
function renderCarousel(items) {
  if (!items || items.length === 0) {
    document.getElementById("carouselContainer").innerHTML = `
      <p class="text-center text-muted fs-4">No images available.</p>
    `;
    return;
  }

  let indicators = "";
  let slides = "";

  items.forEach((item, index) => {
    indicators += `
      <button 
        type="button" 
        data-bs-target="#carouselContainer" 
        data-bs-slide-to="${index}"
        class="${index === 0 ? 'active' : ''}" 
        aria-current="${index === 0 ? 'true' : 'false'}">
      </button>
    `;

    slides += `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <img src="${item.imageUrl}" class="carousel-img">

        <div class="carousel-caption">
          <h5>${item.title || "Untitled"}</h5>
          <!-- <h4 class=cormorant>${item.description.split(/[.!?]/)[0] || ""}</h4> -->
        </div>
      </div>
    `;
  });
  document.getElementById("carouselContainer").innerHTML = `
    <div class="carousel-indicators">
      ${indicators}
    </div>

    <div class="carousel-inner">
      ${slides}
    </div>

    <button class="carousel-control-prev" type="button" data-bs-target="#carouselContainer" data-bs-slide="prev">
      <span class="carousel-control-prev-icon"></span>
    </button>

    <button class="carousel-control-next" type="button" data-bs-target="#carouselContainer" data-bs-slide="next">
      <span class="carousel-control-next-icon"></span>
    </button>
  `;
  const el = document.querySelector('#carouselContainer'); 
  new bootstrap.Carousel(el);
}
