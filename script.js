// CONSTANTS
const ADMIN_PASSWORD = "TwoKies123";

/* STORAGE HELPERS */
const getTheaters = () => JSON.parse(localStorage.getItem("theaters")) || [];
const saveTheaters = (t) => localStorage.setItem("theaters", JSON.stringify(t));
const getMovieCatalog = () => JSON.parse(localStorage.getItem("movieCatalog")) || [];
const saveMovieCatalog = (m) => localStorage.setItem("movieCatalog", JSON.stringify(m));
const getShowtimes = () => JSON.parse(localStorage.getItem("showtimes")) || [];
const saveShowtimes = (s) => localStorage.setItem("showtimes", JSON.stringify(s));
const getConcessions = () => JSON.parse(localStorage.getItem("concessions")) || [];
const saveConcessions = (c) => localStorage.setItem("concessions", JSON.stringify(c));
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (c) => localStorage.setItem("cart", JSON.stringify(c));
const getSales = () => JSON.parse(localStorage.getItem("sales")) || [];
const saveSales = (s) => localStorage.setItem("sales", JSON.stringify(s));
const getRestockLogs = () => JSON.parse(localStorage.getItem("restockLogs")) || [];
const saveRestockLogs = (l) => localStorage.setItem("restockLogs", JSON.stringify(l));

function byId(id) { return document.getElementById(id); }

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    if (byId("loginBtn")) initAdminPage();
    if (byId("viewerTheater")) initSchedulePage();
});

/* --- ADMIN PANEL LOGIC --- */
function initAdminPage() {
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
    byId("goReportsBtn").onclick = () => { showAdminSection("reportAdmin"); refreshAdminUI(); };
    byId("logoutBtn").onclick = () => location.reload();

    // 1) Movie Catalog Logic
    byId("saveCatalogMovieBtn").onclick = () => {
        const title = byId("catalogTitle").value;
        const genre = byId("catalogGenre").value;
        if (!title) return;
        const catalog = getMovieCatalog();
        catalog.push({ id: Date.now(), title, genre });
        saveMovieCatalog(catalog);
        refreshAdminUI();
    };

    // 2) Theater & Schedule Logic
    byId("addTheaterBtn").onclick = () => {
        const name = byId("newTheaterName").value;
        if (!name) return;
        const theaters = getTheaters();
        theaters.push({ id: Date.now(), name });
        saveTheaters(theaters);
        refreshAdminUI();
    };

    byId("saveShowtimeBtn").onclick = () => {
        const theaterId = byId("schedTheater").value;
        const movieId = byId("schedMovie").value;
        const time = byId("schedTime").value;
        if (!theaterId || !movieId || !time) return;
        const shows = getShowtimes();
        shows.push({ theaterId, movieId, time });
        saveShowtimes(shows);
        alert("Showtime Scheduled");
    };

    // 3) Concession Logic (Updated for Requirements)
    byId("saveConcessionBtn").onclick = () => {
        const name = byId("conName").value;
        const price = parseFloat(byId("conPrice").value);
        const stock = parseInt(byId("conStock").value);
        const category = byId("conCategory").value;
        if (!name || isNaN(price)) return;
        const items = getConcessions();
        items.push({ id: Date.now(), name, price, stock, category, active: true });
        saveConcessions(items);
        refreshAdminUI();
    };
}

function showAdminSection(id) {
    const sections = ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"];
    sections.forEach(s => byId(s).style.display = (s === id ? "block" : "none"));
}

/* --- INVENTORY & POS FUNCTIONS --- */
function adjustStock(id) {
    const qty = parseInt(prompt("Enter quantity change (e.g. 10 or -5):"));
    const reason = prompt("Reason for adjustment:");
    if (isNaN(qty) || !reason) return;
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    item.stock += qty;
    saveConcessions(items);
    const logs = getRestockLogs();
    logs.push({ date: new Date().toLocaleString(), name: item.name, change: qty, reason });
    saveRestockLogs(logs);
    refreshAdminUI();
}

function sellFromAdmin(id) {
    const qty = parseInt(prompt("Quantity to sell:"), 10);
    if (isNaN(qty) || qty <= 0) return;
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item.stock < qty) return alert("Not enough stock!");
    item.stock -= qty;
    saveConcessions(items);
    const sales = getSales();
    sales.push({ timestamp: new Date().toLocaleString(), item: item.name, qty, total: (item.price * qty).toFixed(2) });
    saveSales(sales);
    refreshAdminUI();
}

function toggleStatus(id) {
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    item.active = !item.active;
    saveConcessions(items);
    refreshAdminUI();
}

function refreshAdminUI() {
    // Refresh Movie List
    byId("catalogList").innerHTML = getMovieCatalog().map(m => `<li>${m.title} (${m.genre})</li>`).join("");
    
    // Refresh Dropdowns for Scheduling
    byId("schedTheater").innerHTML = getTheaters().map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    byId("schedMovie").innerHTML = getMovieCatalog().map(m => `<option value="${m.id}">${m.title}</option>`).join("");
    
    // Refresh Concessions
    byId("adminConcessionList").innerHTML = getConcessions().map(c => `
        <li style="border-bottom:1px solid #ddd; padding:5px;">
            ${c.name} (${c.category}) | Stock: ${c.stock} | ${c.active ? 'Active' : 'Inactive'}
            <button onclick="sellFromAdmin(${c.id})">POS Sell</button>
            <button onclick="adjustStock(${c.id})">Adjust</button>
            <button onclick="toggleStatus(${c.id})">Toggle Status</button>
        </li>`).join("");

    // Refresh Reports
    const reportDiv = byId("reportOutput");
    if (reportDiv) {
        const sales = getSales();
        const logs = getRestockLogs();
        reportDiv.innerHTML = `<h4>Sales</h4>` + (sales.map(s => `<p>${s.timestamp}: ${s.item} x${s.qty} ($${s.total})</p>`).join("") || "No sales") +
                              `<hr><h4>Inventory Logs</h4>` + (logs.map(l => `<p>${l.date}: ${l.name} (${l.change}) - ${l.reason}</p>`).join("") || "No logs");
    }
}

/* --- CUSTOMER FLOW --- */
function initSchedulePage() {
    const theaters = getTheaters();
    byId("viewerTheater").innerHTML = `<option value="">-- Choose --</option>` + theaters.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    byId("viewerTheater").onchange = renderSchedule;
    renderCustomerConcessions();
    updateCartDisplay();
    byId("checkoutBtn").onclick = handleCheckout;
}

function renderSchedule() {
    const tid = byId("viewerTheater").value;
    const shows = getShowtimes().filter(s => s.theaterId === tid);
    const movies = getMovieCatalog();
    byId("scheduleDisplay").innerHTML = shows.map(s => {
        const movie = movies.find(m => m.id == s.movieId);
        return `<div class="card"><strong>${movie ? movie.title : 'Unknown'}</strong><br>${s.time}</div>`;
    }).join("");
}

function renderCustomerConcessions() {
    byId("concessionArea").innerHTML = getConcessions().filter(c => c.active).map(c => `
        <div class="card">
            <strong>${c.name}</strong><br>$${c.price.toFixed(2)}<br>
            <button onclick="addToCart(${c.id})">Add</button>
        </div>`).join("");
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
    const cart = getCart();
    let total = 0;
    byId("cartList").innerHTML = cart.map(i => {
        total += (i.price * i.qty);
        return `<li>${i.name} x ${i.qty} - $${(i.price * i.qty).toFixed(2)}</li>`;
    }).join("");
    byId("cartTotal").innerText = total.toFixed(2);
}

function handleCheckout() {
    const cart = getCart();
    const concessions = getConcessions();
    if (cart.length === 0) return alert("Empty cart");
    for (let i of cart) {
        let master = concessions.find(c => c.id === i.itemId);
        if (master.stock < i.qty) return alert("Out of stock: " + master.name);
        master.stock -= i.qty;
        const sales = getSales();
        sales.push({ timestamp: new Date().toLocaleString(), item: i.name, qty: i.qty, total: (i.price * i.qty).toFixed(2) });
        saveSales(sales);
    }
    saveConcessions(concessions);
    saveCart([]);
    alert("Purchase complete!");
    location.reload();
}
