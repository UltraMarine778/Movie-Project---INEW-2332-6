const ADMIN_PASSWORD = "TwoKies123";

/* -----------------------------
   STORAGE HELPERS
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

const getInventoryLogs = () => JSON.parse(localStorage.getItem("inventoryLogs")) || [];
const saveInventoryLogs = (l) => localStorage.setItem("inventoryLogs", JSON.stringify(l));

/* -----------------------------
   UTILS
--------------------------------*/
function byId(id) { return document.getElementById(id); }
function generateConfirmationCode() { return "TK-" + Date.now().toString(36).toUpperCase(); }
function parseISODate(d) { if(!d) return null; const [y,m,day] = d.split("-").map(Number); return new Date(y, m-1, day); }

/* -----------------------------
   INITIALIZATION
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    if (byId("loginBtn")) initAdminPage();
    if (byId("viewerTheater")) initSchedulePage();
});

/* -----------------------------
   ADMIN LOGIC
--------------------------------*/
function initAdminPage() {
    byId("loginBtn").addEventListener("click", () => {
        if (byId("adminPassword").value === ADMIN_PASSWORD) {
            byId("loginSection").style.display = "none";
            byId("adminMenu").style.display = "block";
            refreshAdminUI();
        } else {
            byId("loginMessage").textContent = "Invalid Password";
        }
    });

    // Navigation
    byId("goMoviesBtn").onclick = () => showAdminSection("movieAdmin");
    byId("goScheduleBtn").onclick = () => showAdminSection("scheduleAdmin");
    byId("goConcessionsBtn").onclick = () => showAdminSection("concessionAdmin");
    byId("goReportsBtn").onclick = () => showAdminSection("reportAdmin");
    byId("logoutBtn").onclick = () => location.reload();

    // Back Buttons
    const backBtns = ["backFromMoviesBtn", "backFromScheduleBtn", "backFromConBtn", "backFromReportsBtn"];
    backBtns.forEach(id => { if(byId(id)) byId(id).onclick = () => showAdminSection("adminMenu"); });

    // Actions
    byId("saveCatalogMovieBtn").onclick = addMovieToCatalog;
    byId("addTheaterBtn").onclick = addTheater;
    byId("addAuditoriumBtn").onclick = addAuditorium;
    byId("scheduleShowtimeBtn").onclick = scheduleShowtime;
    byId("saveConcessionBtn").onclick = addConcessionItem;
    byId("restockBtn").onclick = processRestock;
    byId("generateReportBtn").onclick = generateReport;
    byId("boxOfficeSellBtn").onclick = processBoxOfficeSale;

    refreshAdminUI();
}

function showAdminSection(id) {
    ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"].forEach(sec => {
        byId(sec).style.display = (sec === id) ? "block" : "none";
    });
    refreshAdminUI();
}

function refreshAdminUI() {
    renderCatalogList();
    renderShowtimeList();
    renderAdminConcessions();
    populateSelects();
}

function populateSelects() {
    const theaters = getTheaters();
    const catalog = getMovieCatalog();
    const showtimes = getShowtimes();
    const concessions = getConcessions();

    const fills = [
        { el: "audTheaterSelect", data: theaters, text: "name", val: "id" },
        { el: "schedTheaterSelect", data: theaters, text: "name", val: "id" },
        { el: "schedMovieSelect", data: catalog, text: "title", val: "id" },
        { el: "boxOfficeShowtime", data: showtimes, text: (s) => `${s.movieTitle} - ${s.time}`, val: "id" },
        { el: "reportTheater", data: theaters, text: "name", val: "id" },
        { el: "restockItemSelect", data: concessions, text: "name", val: "id" }
    ];

    fills.forEach(f => {
        const select = byId(f.el);
        if (!select) return;
        select.innerHTML = "";
        f.data.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item[f.val] || item.id;
            opt.textContent = typeof f.text === "function" ? f.text(item) : item[f.text];
            select.appendChild(opt);
        });
    });
}

/* -----------------------------
   CONCESSION & INVENTORY LOGIC
--------------------------------*/
function addConcessionItem() {
    const name = byId("conName").value;
    const category = byId("conCategory").value;
    const price = parseFloat(byId("conPrice").value);
    const stock = parseInt(byId("conStock").value);

    if (!name || isNaN(price)) return alert("Invalid inputs");

    const items = getConcessions();
    const newItem = { id: Date.now(), name, category, price, stock, active: true };
    items.push(newItem);
    saveConcessions(items);
    logInventory(name, stock, "Initial Stock");
    refreshAdminUI();
}

function renderAdminConcessions() {
    const list = byId("adminConcessionList");
    if (!list) return;
    const items = getConcessions();
    list.innerHTML = items.map(i => `
        <li>
            <div><strong>${i.name}</strong> (${i.category}) - $${i.price.toFixed(2)}<br>Stock: ${i.stock}</div>
            <button onclick="deleteConcession(${i.id})">Delete</button>
        </li>
    `).join("");
}

function processRestock() {
    const id = parseInt(byId("restockItemSelect").value);
    const qty = parseInt(byId("restockQty").value);
    const reason = byId("restockReason").value || "Adjustment";

    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item) {
        item.stock += qty;
        saveConcessions(items);
        logInventory(item.name, qty, reason);
        alert("Inventory Updated");
        refreshAdminUI();
    }
}

function logInventory(name, change, reason) {
    const logs = getInventoryLogs();
    logs.push({ date: new Date().toLocaleString(), name, change, reason });
    saveInventoryLogs(logs);
}

/* -----------------------------
   CUSTOMER / POS LOGIC
--------------------------------*/
function initSchedulePage() {
    const tSelect = byId("viewerTheater");
    getTheaters().forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        tSelect.appendChild(opt);
    });

    byId("viewerFilterBtn").onclick = loadTheaterSchedule;
    byId("checkoutBtn").onclick = handleCheckout;
    renderCustomerConcessions();
    updateCartDisplay();
}

function renderCustomerConcessions() {
    const area = byId("concessionDisplayArea");
    if (!area) return;
    const items = getConcessions().filter(i => i.active);
    area.innerHTML = items.map(i => `
        <div class="concession-card">
            <strong>${i.name}</strong><br>$${i.price.toFixed(2)}<br>
            <small>Stock: ${i.stock}</small><br>
            <button onclick="addToCart(${i.id}, 'concession')">Add to Cart</button>
        </div>
    `).join("");
}

function addToCart(id, type) {
    const cart = getCart();
    if (type === 'concession') {
        const item = getConcessions().find(c => c.id === id);
        const existing = cart.find(c => c.itemId === id && c.type === 'concession');
        if (existing) existing.qty++;
        else cart.push({ itemId: id, name: item.name, price: item.price, qty: 1, type: 'concession' });
    } else {
        // Existing ticket logic
        cart.push({ itemId: id, name: "Movie Ticket", price: 12.00, qty: 1, type: 'ticket' });
    }
    saveCart(cart);
    updateCartDisplay();
}

function updateCartDisplay() {
    const list = byId("cartList");
    if (!list) return;
    const cart = getCart();
    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `<li>${item.name} x ${item.qty} - $${(item.price * item.qty).toFixed(2)} 
        <button onclick="removeFromCart(${index})">X</button></li>`;
    }).join("");
    byId("cartTotal").textContent = `Total: $${total.toFixed(2)}`;
}

function handleCheckout() {
    const cart = getCart();
    const concessions = getConcessions();
    const sales = getConcessionSales();
    const tickets = getTickets();
    const code = generateConfirmationCode();

    // 1. Validate Stock (SYSTEM BLOCK)
    for (const item of cart) {
        if (item.type === 'concession') {
            const master = concessions.find(c => c.id === item.itemId);
            if (master.stock < item.qty) {
                return alert(`Sorry, not enough stock for ${master.name}`);
            }
        }
    }

    // 2. Process
    cart.forEach(item => {
        if (item.type === 'concession') {
            const master = concessions.find(c => c.id === item.itemId);
            master.stock -= item.qty; // DECREMENT
            sales.push({ code, name: item.name, qty: item.qty, price: item.price, date: new Date().toISOString() });
            logInventory(item.name, -item.qty, `Sale ${code}`);
        } else {
            tickets.push({ code, showtimeId: item.itemId, qty: item.qty, timestamp: new Date().toISOString() });
        }
    });

    saveConcessions(concessions);
    saveConcessionSales(sales);
    saveTickets(tickets);
    saveCart([]);
    alert(`Success! Confirmation: ${code}`);
    location.reload();
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartDisplay();
}

/* -----------------------------
   REPORTING
--------------------------------*/
function generateReport() {
    const conSales = getConcessionSales();
    const tickets = getTickets();
    const out = byId("reportOutput");
    
    let conTotal = conSales.reduce((sum, s) => sum + (s.price * s.qty), 0);
    let ticketTotal = tickets.length;

    out.innerHTML = `
        <div class="report-box">
            <h3>Sales Summary</h3>
            <p>Concession Revenue: $${conTotal.toFixed(2)}</p>
            <p>Tickets Sold: ${ticketTotal}</p>
        </div>
    `;
}

// ... include existing addMovieToCatalog, addTheater, addAuditorium, scheduleShowtime from your original script ...
