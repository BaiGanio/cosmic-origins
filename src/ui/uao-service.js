//-----------------------------
//          START SAVE UAOs
//-----------------------------
async function saveUniversalObject() {
    const name = document.getElementById("objectName").value.trim();
    const category = document.getElementById("objectCategory").value.trim(); // galaxy, nebula, star, etc.
    const subcategory = document.getElementById("objectSubcategory").value.trim();
    const description = document.getElementById("objectDescription").value.trim();
    const nasaQuery = document.getElementById("nasaQuery").value.trim();
    const imageUrl = document.getElementById("nasaPreview").src || "";

    if (!name || !description) {
        alert("Name and description are required.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add an object.");
        return;
    }

    const obj = createUniversalAstronomicalObject({
        name,
        nameLower: name.toLowerCase(),
        aliases: [],
        category,
        subcategory,
        catalogSource: ["manual"],
        description,
        notes: "",
        imageUrl,
        tags: [],
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    db.collection("uao").doc(obj.id).set(obj)
        .then(() => {
            alert("Object saved!");
            document.getElementById("objectForm").reset();
            document.getElementById("nasaPreview").src = "";
        })
        .catch(err => {
            console.error("Error saving object:", err);
        });
}
//-----------------------------
//          END SAVE UAOs
//-----------------------------
//-----------------------------
//     START LOAD/FETCH UAOs
//-----------------------------
function loadUniversalObjects() {
    const container = document.getElementById("uaoList");
    container.innerHTML = "";

    // 1) Check localStorage cache
    const cached = localStorage.getItem("uao_cache");

    if (cached) {
        const items = JSON.parse(cached);

        // Render cards
        items.forEach(item => {
            renderObjectCard(item.id, item);
        });

        // Render carousel
        renderCarousel(items);

        return; // Stop here — no DB calls
    }

    // 2) If no cache → fetch from Firestore
    db.collection("uao")
      .orderBy("createdAt", "desc")
      .limit(12)
      .get()
      .then(snapshot => {
          const items = [];

          snapshot.forEach(doc => {
              const data = doc.data();

              const normalized = {
                  id: doc.id,
                  imageUrl: safeImageUrl(data.imageUrl),
                  title: data.name || "Untitled",
                  description: data.description || "",
                  category: data.category || ""
              };

              renderObjectCard(doc.id, normalized);
              items.push(normalized);
          });

          // Render carousel
          renderCarousel(items);

          // 3) Save to localStorage
          localStorage.setItem("uao_cache", JSON.stringify(items));
      });
}


function renderObjectCard(id, g) {
  const container = document.getElementById("uaoList");
  const card = document.createElement("div");

  card.className = "col-md-4 g-3";
  card.innerHTML = ` 
    <div class="card"> 
      <div class="card-image"> 
       <!-- LEFT ACTION: TRASH (visible only when logged in) -->
      
        <img src="${safeImageUrl(g.imageUrl)}" class="img-fluid border border-3 border-secondary shadow-lg modal-trigger" data-img="${g.imageUrl}" data-caption="${g.name}" style="height: 340px; width: 100%; object-fit: cover; cursor: pointer;">
        <a class="card-action requires-auth" 
        id="trash"
         href="#" 
         onclick="deleteObject('${id}')">
        <i class="fa fa-trash text-danger"> delete</i>
      </a> 
       <a class="card-action" id="star" href="#" disabled onclick="likeObject('${id}')"><i class="fa fa-star"> ${g.likes || 0} </i></a>
      <div class="card-body"> 
        <div class="card-heading">${g.name}</div> 
        <hr/>
        <div class="card-text">${g.type || "Unknown type"}</div> 
        <div class="card-text">${g.category || ""}</div> 
  
        <button data-img="${g.imageUrl}" data-caption="${g.description}" class="btn btn-primary modal-trigger"> more... </button> 
      </div> 
    </div> `;

  container.appendChild(card);
}

function safeImageUrl(url) {
  if (!url) return 'images/no-image.jpg';

  // filter out example.com or similar placeholders
  if (url.includes('example')) return 'images/no-image.jpg';

  // optional: check if URL looks valid
  try {
    new URL(url);
    return url;
  } catch {
    return 'images/no-image.jpg';
  }
}

//-----------------------------
//     END LOAD/FETCH UAOs
//-----------------------------

function likeObject(id) { 
  const user = auth.currentUser; 
  if (!user) return; 
  const ref = db.collection("uao").doc(id); 
  ref.update({ 
    likes: firebase.firestore.FieldValue.increment(1),
    likedBy: firebase.firestore.FieldValue.arrayUnion(user.uid) 
  }); 
}
//-----------------------------
//       START SEARCH UAOs
//-----------------------------
function searchUniversalObjects() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const container = document.getElementById("uaoList");
  container.innerHTML = "";

  if (query.length === 0) {
    loadUniversalObjects();
    return;
  }

  db.collection("uao")
    .orderBy("nameLower")
    .startAt(query)
    .endAt(query + "\uf8ff")
    .limit(20)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = `
          <div class="empty-message">
            <p class="text-center text-muted fs-2">No objects found.</p>
          </div>
        `;

        return;
      }

      snapshot.forEach(doc => {
        const g = doc.data();
        renderObjectCard(doc.id, g);
      });
    });
}
//-----------------------------
//       END SEARCH UAOs
//-----------------------------
//-----------------------------
// START IMAGE URL LIVE PREVIEW
//-----------------------------
const imageInput = document.getElementById("uacImageUrl");
const previewWrapper = document.getElementById("uacImagePreviewWrapper");
const previewImg = document.getElementById("uacImagePreview");

imageInput.addEventListener("input", () => {
    const url = imageInput.value.trim();

    if (!url) {
        previewWrapper.classList.add("d-none");
        previewImg.src = "";
        return;
    }

    previewImg.src = url;

    previewImg.onload = () => {
        previewWrapper.classList.remove("d-none");
    };

    previewImg.onerror = () => {
        previewImg.src = "";
        previewWrapper.classList.add("d-none");
    };
});
//-----------------------------
// END IMAGE URL LIVE PREVIEW
//-----------------------------



