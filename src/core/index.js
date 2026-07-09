/**
 * Created by Republic Of Gamers on 7/16/2016.
 */

/* MAIN APP LOGIC */
function startAppLogic() {

    let userID = sessionStorage.getItem("username");
    console.log("id" + userID);
    $("#linkLogout").click(logoutUser);

    if(userID){
        $('#loginLnk').text("");
        $("#linkLogin").hide();
        let username = sessionStorage.getItem("username");
        console.log("Welcome, " + username + "!");
        $('#userMsg').text("Welcome, " + username + "!");
        $("#loggedInUser").show();
        $("#linkLogout").show();
    }
    else{
        $('#loginLnk').text("Login");
        $("#linkLogin").show();
        $("#loggedInUser").hide();
        $("#linkLogout").hide();
    }

    function logoutUser() {
        $('#loginLnk').text("Login");
        $("#linkLogin").show();
        sessionStorage.clear();
        $("#user").hide();
        $("#linkLogout").hide();

        $('#userMsg').text("");
        showInfo("Logout successful.");

        function showInfo(message) {
            $('#infoBox').text(message);
            $('#infoBox').show();
            setTimeout(function () {
                $('#infoBox').fadeOut();
            }, 3000);
        }

    }
};

/* This function is loaded every time we refresh the page */
$(function () {    
    showHomeView();
});
function showView(viewID) {
    /*
     * Clear all views before that.
     */
    $('#main-page-content > section').hide();
    $('#' + viewID).show();
};
function showHomeView() {
    showView('viewHome');
}
function showLoginView() {
    showView('viewLogin');
}
function showRegisterView() {
    showView('viewRegister');
}
function showFoodCostView() {
    showView('viewFoodCost');
}
function showAddGalaxyView() {
    showView('viewAddGalaxy');
}
function showGalleryView() {
    showView('viewGallery');
}


$(function () {
    $('#linkHome').click(showHomeView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
   
    $('#linkLogout').click(logout);
    $('#linkFoodCost').click(showFoodCostView);
    
    $('#linkAddGalaxy').click(showAddGalaxyView);
    $('#linkGallery').click(showGalleryView);
    /* Note that by default HTML forms submit their data as HTTP GET request.
     You should prevent this default action and replace it with JavaScript code.
     Use e.preventDefault() as shown above.
     Otherwise, the form will sometimes execute your JavaScript code,
     sometimes will post its data as HTTP GET request.
     */
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        login();
    });
    $('#registerForm').submit(function (e) {
        e.preventDefault();
        registerUser();
    });
    showHomeView();
    // showHideNavLinks();
});

const Controllers = {};
document.addEventListener("DOMContentLoaded", () => {
    Controllers.AjaxInterceptor.init();
    Controllers.TermsModal.init();
    Controllers.Filters.init();
    Controllers.Search.init();
    Controllers.AuthUI.init();
    Controllers.Theme.init();
});

// -----------------------------
//  THEMES
// -----------------------------
Controllers.Theme = {
    themes: ["dark", "light"],
    currentIndex: 0,
    defaultTheme: "light",

    init() {
        const btn = document.getElementById("themeSwitcher");
        if (!btn) return;

        // Load saved theme
        const saved = localStorage.getItem("theme");
        if (saved) {
            document.body.classList.add(saved);
            this.currentIndex = this.themes.indexOf(saved);
        }else { 
            document.body.classList.add(this.defaultTheme); 
            localStorage.setItem("theme", this.defaultTheme); 
            this.currentIndex = this.themes.indexOf(this.defaultTheme); 
        }

        // Update button text on load 
        this.updateThemeButtonLabel(btn);

        btn.addEventListener("click", () => {
            // Remove previous theme
            document.body.classList.remove(this.themes[this.currentIndex]); 
            // Move to next theme 
            this.currentIndex = (this.currentIndex + 1) % this.themes.length; 
            const newTheme = this.themes[this.currentIndex]; 
            document.body.classList.add(newTheme); 
            localStorage.setItem("theme", newTheme);
            this.updateThemeButtonLabel(btn);
        });
    },
    updateThemeButtonLabel(btn) { 
        const themeName = this.themes[this.currentIndex]; 
        const label = themeName.charAt(0).toUpperCase() + themeName.slice(1); 
        btn.innerHTML = `🌗 ${label}`;
    }
};

Controllers.Search = { 
    init() { 
        // -----------------------------
        //  SEARCH LOGIC
        // -----------------------------
        const searchInput = document.getElementById("searchInput"); 
        if (!searchInput) return; 
        
        searchInput.addEventListener("input", () => { 
            Controllers.Filters.applyFilters(); 
        });
    } 
};

Controllers.Filters = {
    clearCheckbox: null,
    filters: {},
    cards: null,
    searchInput: null,

    init() {
        this.clearCheckbox = document.getElementById("filterClear");

        this.filters = {
            filterGalaxies: document.getElementById("filterGalaxies"),
            filterNebulae: document.getElementById("filterNebulae"),
            filterClusters: document.getElementById("filterClusters"),
            filterStars: document.getElementById("filterStars"),
            filterExoplanets: document.getElementById("filterExoplanets"),
            filterSolarSystem: document.getElementById("filterSolarSystem"),
            filterExotic: document.getElementById("filterExotic")
        };

        this.cards = document.querySelectorAll(".uaoList");
        this.searchInput = document.getElementById("searchInput");

        // Start with all unchecked
        Object.values(this.filters).forEach(cb => cb.checked = false);
        this.clearCheckbox.checked = false;

        // Single-select logic
        Object.values(this.filters).forEach(cb => {
            cb.addEventListener("change", () => this.handleSingleSelect(cb));
        });

        // Clear logic
        this.clearCheckbox.addEventListener("change", () => this.clearFilters());

        this.searchInput.addEventListener("input", () => this.applyFilters());

        this.updateClearVisual();
        this.applyFilters();
    },

    handleSingleSelect(selected) {
        if (selected.checked) {
            Object.values(this.filters).forEach(cb => {
                if (cb !== selected) cb.checked = false;
            });
        }
        this.updateClearVisual();
        this.applyFilters();
    },

    clearFilters() {
        Object.values(this.filters).forEach(cb => cb.checked = false);
        this.clearCheckbox.checked = false; // auto-uncheck Clear
        this.updateClearVisual();
        this.applyFilters();
    },

    updateClearVisual() {
        const anyChecked = Object.values(this.filters).some(cb => cb.checked);
        this.clearCheckbox.disabled = !anyChecked;
    },

    applyFilters() {
        const searchValue = this.searchInput.value.toLowerCase();

        const activeType = Object.entries(this.filters)
            .find(([type, cb]) => cb.checked)?.[0] || null;

        this.cards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const type = card.dataset.type;

            const matchesSearch = name.includes(searchValue);
            const matchesType = !activeType || activeType === type;

            card.style.display = (matchesSearch && matchesType) ? "" : "none";
        });
    }
};



Controllers.TermsModal = {
    checkbox: null,
    modal: null,

    init() {
        this.checkbox = document.getElementById("terms");

        const modalElement = document.getElementById("termsModal");
        this.modal = new bootstrap.Modal(modalElement);

        document.getElementById("openTermsModal").addEventListener("click", (e) => {
            e.preventDefault();
            this.modal.show();
        });

        modalElement.addEventListener("hidden.bs.modal", () => {
            this.checkbox.checked = true;
        });
    }
};
// Controllers.SidebarUI = {
//     init() {
//         const aside = document.getElementById("asidebar-menu"); 
//         const btn = document.getElementById("collapseAside"); 
//         btn.addEventListener("click", () => { 
//             aside.classList.toggle("collapsed"); 
//             btn.textContent = aside.classList.contains("collapsed") ? "⮞" : "⮜"; 
//         });
//         this.loadSidebar();
//     },
//   loadSidebar() { fetch("components/sidebar.html") .then(r => r.text()) .then(html => { document.getElementById("sidebar").innerHTML = html; initSidebarCollapse(); }); }
// };

Controllers.AuthUI = {
    init() {
        // show/hide buttons, roles, etc.
    }
};

Controllers.AjaxInterceptor = {
    activeRequests: 0,
    loadingBox: null,

    init() {
       // this.loadingBox = document.getElementById("loadingBox");
        this.interceptFetch();
        this.interceptXHR();
    },

    update() {
       // this.loadingBox.style.display = this.activeRequests > 0 ? "block" : "none";
    },

    interceptFetch() {
        const originalFetch = window.fetch;

        window.fetch = (...args) => {
            this.activeRequests++;
            this.update();

            return originalFetch(...args)
                .finally(() => {
                    this.activeRequests--;
                    this.update();
                });
        };
    },

    interceptXHR() {
        const originalXHR = window.XMLHttpRequest;

        window.XMLHttpRequest = function () {
            const xhr = new originalXHR();

            xhr.addEventListener("loadstart", () => {
                Controllers.AjaxInterceptor.activeRequests++;
                Controllers.AjaxInterceptor.update();
            });

            xhr.addEventListener("loadend", () => {
                Controllers.AjaxInterceptor.activeRequests--;
                Controllers.AjaxInterceptor.update();
            });

            return xhr;
        };
    }
};
