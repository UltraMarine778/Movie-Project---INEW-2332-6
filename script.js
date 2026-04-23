// SIMPLE ADMIN PASSWORD (demo only)
const ADMIN_PASSWORD = "TwoKies123";

/* -----------------------------
   STORAGE HELPERS
--------------------------------*/
const getTheaters = () => JSON.parse(localStorage.getItem("theaters")) || [];
const saveTheaters = (theaters) => localStorage.setItem("theaters", JSON.stringify(theaters));

const getMovieCatalog = () => JSON.parse(localStorage.getItem("movieCatalog")) || [];
const saveMovieCatalog = (catalog) => localStorage.setItem("movieCatalog", JSON.stringify(catalog));

const getShowtimes = () => JSON.parse(localStorage.getItem("showtimes")) || [];
const saveShowtimes = (showtimes) => localStorage.setItem("showtimes", JSON.stringify(showtimes));

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

const getTickets = () => JSON.parse(localStorage.getItem("tickets")) || [];
const saveTickets = (tickets) => localStorage.setItem("tickets", JSON.stringify(tickets));

// NEW CONCESSION STORAGE
const getConcessions = () => JSON.parse(localStorage.getItem("concessions")) || [];
const saveConcessions = (data) => localStorage.setItem("concessions", JSON.stringify(data));

const getConcessionSales = () => JSON.parse(localStorage.getItem("concessionSales")) || [];
const saveConcessionSales = (data) => localStorage.setItem("concessionSales", JSON.stringify(data));

const getInventoryLogs = () => JSON.parse(localStorage.getItem("inventoryLogs")) || [];
const saveInventoryLogs = (data) => localStorage.setItem("inventoryLogs", JSON.stringify(data));

/* -----------------------------
   UTILS
--------------------------------*/
function generateConfirmationCode() {
    return "TK-" + Date.now().toString(36).toUpperCase();
}
function byId(id) { return document.getElementById(id); }
function safeText(s) { return (s ?? "").toString(); }

function parseISODate(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, (m - 1), d);
}

function withinInclusive(date, start, end) {
    if (!date || !start || !end) return false;
    return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

/* -----------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    initAdminPage();
    initSchedulePage();
});

/* -----------------------------
   ADMIN PAGE
--------------------------------*/
function initAdminPage() {
    const loginBtn = byId("loginBtn");
    if (!loginBtn) return;

    loginBtn.addEventListener("click", checkPassword);

    byId("goMoviesBtn").addEventListener("click", () => showAdminSection("movieAdmin"));
    byId("goScheduleBtn").addEventListener("click", () => showAdminSection("scheduleAdmin"));
    byId("goConcessionsBtn").addEventListener("click", () => showAdminSection("concessionAdmin"));
    byId("goReportsBtn").addEventListener("click", () => showAdminSection("reportAdmin"));
    byId("logoutBtn").addEventListener("click", logoutAdmin);

    byId("backFromMoviesBtn").addEventListener("click", () => showAdminSection("adminMenu"));
    byId("backFromScheduleBtn").addEventListener("click", () => showAdminSection("adminMenu"));
    byId("backFromConBtn").addEventListener("click", () => showAdminSection("adminMenu"));
    byId("backFromReportsBtn").addEventListener("click", () => showAdminSection("adminMenu"));

    byId("saveCatalogMovieBtn").addEventListener("click", addMovieToCatalog);
    byId("addTheaterBtn").addEventListener("click", addTheater);
    byId("addAuditoriumBtn").addEventListener("click", addAuditorium);
    byId("scheduleShowtimeBtn").addEventListener("click", scheduleShowtime);
    byId("boxOfficeSellBtn").addEventListener("click", processBoxOfficeSale);
    byId("generateReportBtn").addEventListener("click", generateReport);

    // Concession Admin Events
    byId("saveConcessionBtn").addEventListener("click", addConcessionItem);
    byId("restockBtn").addEventListener("click", processRestock);

    seedDefaultsIfEmpty();
    refreshAdminUI();
}

function seedDefaultsIfEmpty() {
    const theaters = getTheaters();
    if (theaters.length === 0) {
        saveTheaters([
            { id: 101, name: "North Theater", auditoriums: ["Auditorium 1", "Auditorium 2"] },
            { id: 102, name: "Downtown Theater", auditoriums: ["Auditorium 1"] }
        ]);
    }
    const con = getConcessions();
    if (con.length === 0) {
        saveConcessions([
            { id: 1, name: "Large Popcorn", category: "Snack", price: 8.50, stock: 50, active: true },
            { id: 2, name: "Large Soda", category: "Drink", price: 5.00, stock: 100, active: true }
        ]);
    }
}

function checkPassword() {
    const input = byId("adminPassword").value;
    if (input === ADMIN_PASSWORD) {
        byId("loginSection").style.display = "none";
        byId("adminMenu").style.display = "block";
        refreshAdminUI();
    } else {
        byId("loginMessage").textContent = "Incorrect password.";
        byId("loginMessage").style.color = "red";
    }
}

function logoutAdmin() {
    byId("adminPassword").value = "";
    ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"].forEach(id => {
        if (byId(id)) byId(id).style.display = "none";
    });
    byId("loginSection").style.display = "block";
}

function showAdminSection(sectionId) {
    ["adminMenu", "movieAdmin", "scheduleAdmin", "concessionAdmin", "reportAdmin"].forEach(id => {
        if (byId(id)) byId(id).style.display = (id === sectionId) ? "block" : "none";
    });
    refreshAdminUI();
}

function refreshAdminUI() {
    renderCatalogList();
    populateAdminTheaterSelects();
    populateAdminMovieSelect();
    renderShowtimeList();
    populateBoxOfficeShowtimes();
    populateReportTheaters();
    renderAdminConcessions();
}

/* -----------------------------
   CONCESSIONS (ADMIN)
--------------------------------*/
function addConcessionItem() {
    const name = byId("conName").value.trim();
    const category = byId("conCategory").value;
    const price = parseFloat(byId("conPrice").value);
    const stock = parseInt(byId("conStock").value);

    if (!name || isNaN(price) || isNaN(stock)) return alert("Fill all fields correctly.");

    const items = getConcessions();
    items.push({ id: Date.now(), name, category, price, stock, active: true });
    saveConcessions(items);
    
    // Log initial stock
    logInventory(name, stock, "Initial Setup");
    
    refreshAdminUI();
    byId("conName").value = "";
}

function renderAdminConcessions() {
    const list = byId("adminConcessionList");
    const select = byId("restockItemSelect");
    if (!list) return;

    const items = getConcessions();
    list.innerHTML = "";
    select.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong> (${item.category})<br>
                Price: $${item.price.toFixed(2)} | Stock: ${item.stock}
            </div>
            <button onclick="toggleConcession(${item.id})">${item.active ? 'Deactivate' : 'Activate'}</button>
        `;
        list.appendChild(li);

        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
    });
}

function toggleConcession(id) {
    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item) item.active = !item.active;
    saveConcessions(items);
    refreshAdminUI();
}

function processRestock() {
    const id = parseInt(byId("restockItemSelect").value);
    const qty = parseInt(byId("restockQty").value);
    const reason = byId("restockReason").value || "Restock";

    if (isNaN(qty) || qty <= 0) return;

    const items = getConcessions();
    const item = items.find(i => i.id === id);
    if (item) {
        item.stock += qty;
        saveConcessions(items);
        logInventory(item.name, qty, reason);
        alert("Restock complete!");
        refreshAdminUI();
    }
}

function logInventory(itemName, change, reason) {
    const logs = getInventoryLogs();
    logs.push({
        date: new Date().toISOString(),
        itemName,
        change,
        reason
    });
    saveInventoryLogs(logs);
}

/* -----------------------------
   REPORTS (UPDATED)
--------------------------------*/
function generateReport() {
    const theaterId = parseInt(byId("reportTheater").value);
    const startStr = byId("reportStart").value;
    const endStr = byId("reportEnd").value;
    const output = byId("reportOutput");

    if (!startStr || !endStr) return;

    const start = parseISODate(startStr);
    const end = parseISODate(endStr);
    end.setHours(23, 59, 59);

    const tickets = getTickets().filter(t => {
        const d = new Date(t.timestamp);
        return withinInclusive(d, start, end);
    });

    const conSales = getConcessionSales().filter(s => {
        const d = new Date(s.timestamp);
        return withinInclusive(d, start, end);
    });

    const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalConRevenue = conSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);

    output.innerHTML = `
        <h3>Unified Sales Report</h3>
        <p><strong>Tickets Sold:</strong> ${totalTickets}</p>
        <p><strong>Concession Revenue:</strong> $${totalConRevenue.toFixed(2)}</p>
        <hr>
        <h4>Concession Breakdown</h4>
        <ul>
            ${conSales.map(s => `<li>${s.itemName}: ${s.quantity} (Total: $${(s.price * s.quantity).toFixed(2)})</li>`).join('')}
        </ul>
    `;
}

/* -----------------------------
   CUSTOMER VIEW (SCHEDULE)
--------------------------------*/
function initSchedulePage() {
    const theaterSelect = byId("viewerTheater");
    if (!theaterSelect) return;

    populateViewerTheaters();
    renderCustomerConcessions();

    byId("viewerFilterBtn").addEventListener("click", loadTheaterSchedule);
    byId("checkoutBtn").addEventListener("click", checkout);
    loadCart();
}

function renderCustomerConcessions() {
    const list = byId("concessionDisplayList");
    if (!list) return;

    const items = getConcessions().filter(i => i.active);
    list.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.style.width = "250px"; 
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price.toFixed(2)}<br>
                <small>In Stock: ${item.stock}</small>
            </div>
            <div>
                <input type="number" id="conQty-${item.id}" value="1" min="1" style="width:50px">
                <button onclick="addConToCart(${item.id})">Add</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function addConToCart(id) {
    const qty = parseInt(byId(`conQty-${id}`).value);
    const items = getConcessions();
    const item = items.find(i => i.id === id);

    if (qty > item.stock) return alert("Not enough stock!");

    const cart = getCart();
    const existing = cart.find(c => c.concessionId === id);
    
    if (existing) existing.quantity += qty;
    else cart.push({ concessionId: id, quantity: qty, price: item.price, name: item.name });

    saveCart(cart);
    loadCart();
}

function loadCart() {
    const list = byId("cartList");
    const totalEl = byId("cartTotal");
    if (!list) return;

    const cart = getCart();
    list.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
        const li = document.createElement("li");
        const price = item.price || 0; // Tickets need price too if you want totals for them
        const subtotal = price * item.quantity;
        
        if (item.showtimeId) {
            li.textContent = `Ticket: Showtime #${item.showtimeId} (Qty: ${item.quantity})`;
        } else {
            li.textContent = `${item.name} (Qty: ${item.quantity}) - $${subtotal.toFixed(2)}`;
            total += subtotal;
        }

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.onclick = () => { cart.splice(idx, 1); saveCart(cart); loadCart(); };
        li.appendChild(delBtn);
        list.appendChild(li);
    });

    totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

function checkout() {
    const cart = getCart();
    if (cart.length === 0) return alert("Cart is empty.");

    const concessions = getConcessions();
    const showtimes = getShowtimes();
    const tickets = getTickets();
    const conSales = getConcessionSales();
    const code = generateConfirmationCode();

    // SYSTEM VALIDATION: Inventory Check
    for (const item of cart) {
        if (item.concessionId) {
            const master = concessions.find(c => c.id === item.concessionId);
            if (master.stock < item.quantity) {
                alert(`Insufficient stock for ${master.name}. Only ${master.stock} left.`);
                return; // BLOCK SALE
            }
        }
    }

    // PROCESS SALE
    cart.forEach(item => {
        if (item.showtimeId) {
            const s = showtimes.find(x => x.id === item.showtimeId);
            s.ticketsSold += item.quantity;
            tickets.push({ confirmationCode: code, showtimeId: s.id, quantity: item.quantity, timestamp: new Date().toISOString() });
        } else {
            const master = concessions.find(c => c.id === item.concessionId);
            master.stock -= item.quantity; // DECREMENT INVENTORY
            conSales.push({ 
                confirmationCode: code, 
                itemName: master.name, 
                quantity: item.quantity, 
                price: master.price, 
                timestamp: new Date().toISOString() 
            });
            logInventory(master.name, -item.quantity, "Customer Sale: " + code);
        }
    });

    saveShowtimes(showtimes);
    saveTickets(tickets);
    saveConcessions(concessions);
    saveConcessionSales(conSales);
    saveCart([]);
    
    alert(`Purchase Complete! Code: ${code}`);
    location.reload();
}

// ... Rest of the original helper functions (populateViewerTheaters, loadTheaterSchedule, etc.) from your provided script ...
// Ensure they remain exactly as you had them.
