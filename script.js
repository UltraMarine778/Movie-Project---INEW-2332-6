// SIMPLE ADMIN PASSWORD (demo only)
const ADMIN_PASSWORD = "TwoKies123";

/* -----------------------------
   STORAGE HELPERS (Ensures data stays after closing)
--------------------------------*/
const getTheaters = () => JSON.parse(localStorage.getItem("theaters")) || [];
const saveTheaters = (t) => localStorage.setItem("theaters", JSON.stringify(t));

const getMovieCatalog = () => JSON.parse(localStorage.getItem("movieCatalog")) || [];
const saveMovieCatalog = (m) => localStorage.setItem("movieCatalog", JSON.stringify(m));

const getShowtimes = () => JSON.parse(localStorage.getItem("showtimes")) || [];
const saveShowtimes = (s) => localStorage.setItem("showtimes", JSON.stringify(s));

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (c) => localStorage.setItem("cart", JSON.stringify(c));

const getTickets = () => JSON.parse(localStorage.getItem("tickets")) || [];
const saveTickets = (t) => localStorage.setItem("tickets", JSON.stringify(t));

const getConcessions = () => JSON.parse(localStorage.getItem("concessions")) || [];
const saveConcessions = (c) => localStorage.setItem("concessions", JSON.stringify(c));

const getConcessionSales = () => JSON.parse(localStorage.getItem("concessionSales")) || [];
const saveConcessionSales = (s) => localStorage.setItem("concessionSales", JSON.stringify(s));

/* -----------------------------
   UTILS
--------------------------------*/
function byId(id) { return document.getElementById(id); }
function generateConfirmationCode() { return "TK-" + Date.now().toString(36).toUpperCase(); }

/* -----------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    // Determine which page we are on
    if (byId("loginBtn")) initAdminPage();
    if (byId("viewerTheater")) initSchedulePage();
});

/* -----------------------------
   ADMIN PAGE LOGIC
--------------------------------*/
function initAdminPage() {
    // Login logic
    byId("loginBtn").onclick = () => {
        if (byId("adminPassword").value === ADMIN_PASSWORD) {
            byId("loginSection").style.display = "none";
            byId("adminMenu").style.display = "block";
            refreshAdminUI();
        } else {
            byId("loginMessage").textContent = "Incorrect Password";
        }
    };

    // Section Navigation
    byId("goMoviesBtn").onclick = () => showAdminSection("movieAdmin");
    byId("goScheduleBtn").onclick = () => showAdminSection("scheduleAdmin");
    byId("goConcessionsBtn").onclick = () => showAdminSection("concessionAdmin");
    byId("goReportsBtn").onclick = () => showAdminSection("reportAdmin");
    byId("logoutBtn").onclick = () => location.reload();

    // Save Movie to Catalog
    byId("saveCatalogMovieBtn").onclick = () => {
        const title = byId("catalogTitle").value;
        const desc = byId("catalogDescription").value;
        const genre = byId("catalogGenre").value;
        const run = byId("catalogRuntime").value;

        if (!title || !run) return alert("Please fill title and runtime.");

        const catalog = getMovieCatalog();
        catalog.push({ id: Date.now(), title, desc, genre, runtime: run });
        saveMovieCatalog(catalog); // PERMANENT SAVE
        
        // Clear fields
        ["catalogTitle", "catalogDescription", "catalogGenre", "catalogRuntime"].forEach(id => byId(id).value = "");
        refreshAdminUI();
    };

    // Add Theater
    byId("addTheaterBtn").onclick = () => {
        const name = byId("newTheaterName").value;
        if (!name) return;
        const theaters = getTheaters();
        theaters.push({ id: Date.now(), name, auditoriums: ["Auditorium 1"] });
        saveTheaters(theaters);
        byId("newTheaterName").value = "";
        refreshAdminUI();
    };

    // Save Concession Item
    byId("saveConcessionBtn").onclick = () => {
        const name = byId("conName").value;
        const price = parseFloat(byId("conPrice").value);
        const stock = parseInt(byId("conStock").value);

        if (!name || isNaN(price)) return alert("Invalid Concession Data");

        const items = getConcessions();
        items.push({ id: Date.now(), name, price, stock, active: true });
        saveConcessions(items);
        
        byId("conName").value = "";
        byId("conPrice").value = "";
        byId("conStock").value = "";
        refreshAdminUI();
    };

    refreshAdminUI();
}

function showAdminSection(id) {
    const sections = ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"];
    sections.forEach(s => byId(s).style.display = (s === id) ? "block" : "none");
}

function refreshAdminUI() {
    renderCatalog();
    renderConcessions();
    populateSelects();
}

function renderCatalog() {
    const list = byId("catalogList");
    if (!list) return;
    list.innerHTML = getMovieCatalog().map((m, idx) => `
        <li>
            <div><strong>${m.title}</strong> (${m.runtime} min)</div>
            <button onclick="deleteMovie(${idx})">Delete</button>
        </li>
    `).join("");
}

function renderConcessions() {
    const list = byId("adminConcessionList");
    if (!list) return;
    list.innerHTML = getConcessions().map(c => `
        <li>
            <div><strong>${c.name}</strong> - $${c.price.toFixed(2)} (Stock: ${c.stock})</div>
        </li>
    `).join("");
}

function populateSelects() {
    const theaters = getTheaters();
    const tSelect = byId("audTheaterSelect");
    if (tSelect) {
        tSelect.innerHTML = theaters.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    }
}

/* -----------------------------
   CUSTOMER PAGE LOGIC
--------------------------------*/
function initSchedulePage() {
    const tSelect = byId("viewerTheater");
    tSelect.innerHTML = '<option value="">-- Choose Theater --</option>' + 
        getTheaters().map(t => `<option value="${t.id}">${t.name}</option>`).join("");

    renderCustomerConcessions();
}

function renderCustomerConcessions() {
    const area = byId("concessionDisplayArea");
    if (!area) return;
    area.innerHTML = getConcessions().map(c => `
        <div class="card">
            <strong>${c.name}</strong><br>$${c.price.toFixed(2)}<br>
            <button onclick="addToCart(${c.id})">Add to Order</button>
        </div>
    `).join("");
}

function addToCart(id) {
    const cart = getCart();
    const item = getConcessions().find(c => c.id === id);
    cart.push({ id: Date.now(), name: item.name, price: item.price });
    saveCart(cart);
    updateCartDisplay();
}

function updateCartDisplay() {
    const list = byId("cartList");
    const cart = getCart();
    list.innerHTML = cart.map(i => `<li>${i.name} - $${i.price.toFixed(2)}</li>`).join("");
}
