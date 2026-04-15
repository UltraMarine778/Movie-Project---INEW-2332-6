
/*************************************************
 * TWO KIES CINEMA - FULL SCRIPT
 * Ticketing + Concessions + POS + Inventory
 *************************************************/

const ADMIN_PASSWORD = "TwoKies123";

/* ===============================
   STORAGE HELPERS
================================ */
function getMovies() {
    return JSON.parse(localStorage.getItem("movies")) || [];
}
function saveMovies(v) {
    localStorage.setItem("movies", JSON.stringify(v));
}

function getShowtimes() {
    return JSON.parse(localStorage.getItem("showtimes")) || [];
}
function saveShowtimes(v) {
    localStorage.setItem("showtimes", JSON.stringify(v));
}

function getTheaters() {
    return JSON.parse(localStorage.getItem("theaters")) || [];
}
function saveTheaters(v) {
    localStorage.setItem("theaters", JSON.stringify(v));
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(v) {
    localStorage.setItem("cart", JSON.stringify(v));
}

function getTickets() {
    return JSON.parse(localStorage.getItem("tickets")) || [];
}
function saveTickets(v) {
    localStorage.setItem("tickets", JSON.stringify(v));
}

function getConcessions() {
    return JSON.parse(localStorage.getItem("concessions")) || [];
}
function saveConcessions(v) {
    localStorage.setItem("concessions", JSON.stringify(v));
}

function getConcessionSales() {
    return JSON.parse(localStorage.getItem("concessionSales")) || [];
}
function saveConcessionSales(v) {
    localStorage.setItem("concessionSales", JSON.stringify(v));
}

function getInventory() {
    return JSON.parse(localStorage.getItem("inventory")) || [];
}
function saveInventory(v) {
    localStorage.setItem("inventory", JSON.stringify(v));
}

function getInventoryLogs() {
    return JSON.parse(localStorage.getItem("inventoryLogs")) || [];
}
function saveInventoryLogs(v) {
    localStorage.setItem("inventoryLogs", JSON.stringify(v));
}

/* ===============================
   INITIALIZATION
================================ */
document.addEventListener("DOMContentLoaded", () => {
    seedDefaultTheaters();
    initAdmin();
    initViewer();
});

/* ===============================
   ADMIN LOGIN
================================ */
function checkPassword() {
    const pwd = adminPassword.value;
    if (pwd === ADMIN_PASSWORD) {
        loginSection.style.display = "none";
        adminMenu.style.display = "block";
        refreshAdmin();
    } else {
        loginMessage.textContent = "Incorrect password.";
        loginMessage.style.color = "red";
    }
}

function showSection(id) {
    document.querySelectorAll(".admin-box").forEach(b => b.style.display = "none");
    adminMenu.style.display = "block";
    document.getElementById(id).style.display = "block";
    refreshAdmin();
}

/* ===============================
   SEED DATA
================================ */
function seedDefaultTheaters() {
    if (!localStorage.getItem("theaters")) {
        saveTheaters([
            { id: 1, name: "North Theater", auditoriums: ["Auditorium 1"] },
            { id: 2, name: "Downtown Theater", auditoriums: ["Auditorium 1"] },
            { id: 3, name: "West Theater", auditoriums: ["Auditorium 1"] }
        ]);
    }
}

/* ===============================
   MOVIE CATALOG
================================ */
function addMovie() {
    const title = mTitle.value.trim();
    const genre = mGenre.value.trim();
    const runtime = parseInt(mRuntime.value);
    const desc = mDesc.value.trim();

    if (!title || !genre || isNaN(runtime) || !desc) return;

    const movies = getMovies();
    movies.push({
        id: Date.now(),
        title,
        genre,
        runtime,
        desc
    });
    saveMovies(movies);
    refreshAdmin();
}

/* ===============================
   SHOWTIME SCHEDULING
================================ */
function scheduleShowtime() {
    const showtimes = getShowtimes();
    showtimes.push({
        id: Date.now(),
        theaterId: parseInt(schedTheater.value),
        auditorium: schedAud.value,
        movieId: parseInt(schedMovie.value),
        date: schedDate.value,
        time: schedTime.value,
        capacity: parseInt(schedCap.value),
        ticketsSold: 0
    });
    saveShowtimes(showtimes);
    refreshAdmin();
}

/* ===============================
   CONCESSION MANAGEMENT
================================ */
function addConcession() {
    const items = getConcessions();
    items.push({
        id: Date.now(),
        name: cName.value,
        category: cCat.value,
        price: parseFloat(cPrice.value),
        active: cActive.value === "true"
    });
    saveConcessions(items);
    refreshAdmin();
}

/* ===============================
   POS (ADMIN CASHIER)
================================ */
let posCart = [];

function updatePOS(itemId, qty) {
    posCart = posCart.filter(i => i.itemId !== itemId);
    if (qty > 0) posCart.push({ itemId, quantity: qty });
}

function completePosSale() {
    if (posCart.length === 0) return;

    const sales = getConcessionSales();
    sales.push({
        id: Date.now(),
        items: posCart,
        channel: "POS",
        timestamp: new Date().toISOString()
    });
    saveConcessionSales(sales);
    posCart = [];
    refreshAdmin();
}

/* ===============================
   INVENTORY + LOGGING
================================ */
function adjustInventory() {
    const itemId = parseInt(invItem.value);
    const theaterId = parseInt(invTheater.value);
    const qty = parseInt(invQty.value);
    const reason = invReason.value.trim();

    if (isNaN(itemId) || isNaN(theaterId) || isNaN(qty) || !reason) return;

    const inventory = getInventory();
    let record = inventory.find(i => i.itemId === itemId && i.theaterId === theaterId);

    if (!record) {
        record = { itemId, theaterId, onHand: 0 };
        inventory.push(record);
    }
    record.onHand += qty;
    saveInventory(inventory);

    const logs = getInventoryLogs();
    logs.push({
        itemId,
        theaterId,
        change: qty,
        reason,
        timestamp: new Date().toISOString()
    });
    saveInventoryLogs(logs);
}

/* ===============================
   REPORTING
================================ */
function generateReport() {
    const theaterId = parseInt(reportTheater.value);
    const start = new Date(repStart.value);
    const end = new Date(repEnd.value);

    const showtimes = getShowtimes()
        .filter(s => s.theaterId === theaterId)
        .filter(s => {
            const d = new Date(s.date);
            return d >= start && d <= end;
        });

    const ticketsSold = showtimes.reduce((sum, s) => sum + s.ticketsSold, 0);
    const concessionSales = getConcessionSales().length;

    reportOut.innerHTML = `
        <p><strong>Tickets Sold:</strong> ${ticketsSold}</p>
        <p><strong>Concession Transactions:</strong> ${concessionSales}</p>
    `;
}

/* ===============================
   VIEWER (CUSTOMER)
================================ */
function initViewer() {
    if (!viewerTheater) return;

    viewerTheater.innerHTML =
        `<option value="">Select Theater</option>` +
        getTheaters().map(t => `<option value="${t.id}">${t.name}</option>`).join("");
}

function loadTheaterSchedule() {
    const list = scheduleList;
    list.innerHTML = "";

    const theaterId = parseInt(viewerTheater.value);
    if (isNaN(theaterId)) return;

    getShowtimes()
        .filter(s => s.theaterId === theaterId)
        .forEach(s => {
            const li = document.createElement("li");
            li.textContent = `${s.date} ${s.time}`;
            list.appendChild(li);
        });
}

/* ===============================
   ADMIN UI REFRESH
================================ */
function refreshAdmin() {
    if (movieCatalog)
        movieCatalog.innerHTML = getMovies().map(m => `<li>${m.title}</li>`).join("");

    if (concessionList)
        concessionList.innerHTML = getConcessions().map(c => `<li>${c.name}</li>`).join("");

    if (schedTheater) {
        const opts = getTheaters().map(t => `<option value="${t.id}">${t.name}</option>`).join("");
        schedTheater.innerHTML = opts;
        posTheater.innerHTML = opts;
        reportTheater.innerHTML = opts;
        invTheater.innerHTML = opts;
    }

    if (schedMovie)
        schedMovie.innerHTML = getMovies().map(m => `<option value="${m.id}">${m.title}</option>`).join("");

    if (invItem)
        invItem.innerHTML = getConcessions().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}
