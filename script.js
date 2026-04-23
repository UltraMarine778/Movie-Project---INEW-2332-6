// SIMPLE ADMIN PASSWORD
const ADMIN_PASSWORD = "TwoKies123";

/* -----------------------------
   STORAGE HELPERS (Persistence)
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

/* -----------------------------
   UTILS
--------------------------------*/
function byId(id) { return document.getElementById(id); }
function generateConfirmationCode() { return "TK-" + Date.now().toString(36).toUpperCase(); }

/* -----------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    if (byId("loginBtn")) initAdminPage();
    if (byId("viewerTheater")) initSchedulePage();
});

/* -----------------------------
   ADMIN LOGIC
--------------------------------*/
function initAdminPage() {
    // Login
    byId("loginBtn").onclick = () => {
        if (byId("adminPassword").value === ADMIN_PASSWORD) {
            byId("loginSection").style.display = "none";
            byId("adminMenu").style.display = "block";
            refreshAdminUI();
        } else {
            byId("loginMessage").textContent = "Incorrect Password";
        }
    };

    // Navigation
    byId("goMoviesBtn").onclick = () => showAdminSection("movieAdmin");
    byId("goScheduleBtn").onclick = () => showAdminSection("scheduleAdmin");
    byId("goConcessionsBtn").onclick = () => showAdminSection("concessionAdmin");
    byId("goReportsBtn").onclick = () => showAdminSection("reportAdmin");
    byId("logoutBtn").onclick = () => location.reload();

    // Back Buttons
    ["backFromMoviesBtn", "backFromScheduleBtn", "backFromConBtn", "backFromReportsBtn"].forEach(id => {
        if (byId(id)) byId(id).onclick = () => showAdminSection("adminMenu");
    });

    // Save Movie
    byId("saveCatalogMovieBtn").onclick = () => {
        const title = byId("catalogTitle").value;
        const runtime = byId("catalogRuntime").value;
        if (!title || !runtime) return alert("Fill required fields");
        
        const catalog = getMovieCatalog();
        catalog.push({ id: Date.now(), title, genre: byId("catalogGenre").value, runtime });
        saveMovieCatalog(catalog);
        refreshAdminUI();
    };

    // Save Concession
    byId("saveConcessionBtn").onclick = () => {
        const name = byId("conName").value;
        const price = parseFloat(byId("conPrice").value);
        const stock = parseInt(byId("conStock").value);

        if (!name || isNaN(price) || isNaN(stock)) return alert("Invalid entry");

        const items = getConcessions();
        items.push({ id: Date.now(), name, price, stock });
        saveConcessions(items);
        refreshAdminUI();
    };

    refreshAdminUI();
}

function showAdminSection(id) {
    ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"].forEach(sec => {
        if (byId(sec)) byId(sec).style.display = (sec === id) ? "block" : "none";
    });
}

function refreshAdminUI() {
    // Render Catalog
    const cList = byId("catalogList");
    if (cList) {
        cList.innerHTML = getMovieCatalog().map(m => `<li>${m.title} (${m.runtime}m)</li>`).join("");
    }
    
    // Render Concessions
    const conList = byId("adminConcessionList");
    if (conList) {
        conList.innerHTML = getConcessions().map(c => `<li>${c.name} - $${c.price.toFixed(2)} (Stock: ${c.stock})</li>`).join("");
    }
}

/* -----------------------------
   CUSTOMER LOGIC
--------------------------------*/
function initSchedulePage() {
    const tSelect = byId("viewerTheater");
    tSelect.innerHTML = '<option value="">-- Choose Theater --</option>' + 
        getTheaters().map(t => `<option value="${t.id}">${t.name}</option>`).join("");

    renderCustomerConcessions();
    updateCartDisplay();

    byId("checkoutBtn").onclick = handleCheckout;
}

function renderCustomerConcessions() {
    const area = byId("concessionArea");
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
    const existing = cart.find(i => i.itemId === id);
    
    if (existing) existing.qty++;
    else cart.push({ itemId: id, name: item.name, price: item.price, qty: 1 });
    
    saveCart(cart);
    updateCartDisplay();
}

function updateCartDisplay() {
    const list = byId("cartList");
    if (!list) return;
    const cart = getCart();
    list.innerHTML = cart.map(i => `<li>${i.name} x ${i.qty} - $${(i.price * i.qty).toFixed(2)}</li>`).join("");
}

function handleCheckout() {
    const cart = getCart();
    const concessions = getConcessions();
    
    if (cart.length === 0) return alert("Cart is empty");

    // Inventory Check & Decrement
    for (let cartItem of cart) {
        let masterItem = concessions.find(c => c.id === cartItem.itemId);
        if (masterItem.stock < cartItem.qty) return alert(`Not enough stock for ${masterItem.name}`);
        masterItem.stock -= cartItem.qty;
    }

    saveConcessions(concessions);
    saveCart([]);
    alert("Purchase successful! Inventory updated.");
    location.reload();
}
