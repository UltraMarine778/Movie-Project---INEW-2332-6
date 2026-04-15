
// SIMPLE ADMIN PASSWORD (demo only)
const ADMIN_PASSWORD = "TwoKies123";

/* -----------------------------
   STORAGE HELPERS
--------------------------------*/
function getTheaters() {
    return JSON.parse(localStorage.getItem("theaters")) || [];
}
function saveTheaters(theaters) {
    localStorage.setItem("theaters", JSON.stringify(theaters));
}

function getMovieCatalog() {
    return JSON.parse(localStorage.getItem("movieCatalog")) || [];
}
function saveMovieCatalog(catalog) {
    localStorage.setItem("movieCatalog", JSON.stringify(catalog));
}

function getShowtimes() {
    return JSON.parse(localStorage.getItem("showtimes")) || [];
}
function saveShowtimes(showtimes) {
    localStorage.setItem("showtimes", JSON.stringify(showtimes));
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getTickets() {
    return JSON.parse(localStorage.getItem("tickets")) || [];
}
function saveTickets(tickets) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* -----------------------------
   UTILS
--------------------------------*/
function generateConfirmationCode() {
    return "TK-" + Date.now().toString(36).toUpperCase();
}

function byId(id) { return document.getElementById(id); }

function safeText(s) {
    return (s ?? "").toString();
}

function parseISODate(dateStr) {
    // dateStr like "2026-04-15" -> Date at local midnight
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
    if (!loginBtn) return; // not on admin page

    // Wire login
    loginBtn.addEventListener("click", checkPassword);

    // Wire menu buttons
    byId("goMoviesBtn").addEventListener("click", () => showAdminSection("movieAdmin"));
    byId("goScheduleBtn").addEventListener("click", () => showAdminSection("scheduleAdmin"));
    byId("goReportsBtn").addEventListener("click", () => showAdminSection("reportAdmin"));
    byId("logoutBtn").addEventListener("click", logoutAdmin);

    byId("backFromMoviesBtn").addEventListener("click", () => showAdminSection("adminMenu"));
    byId("backFromScheduleBtn").addEventListener("click", () => showAdminSection("adminMenu"));
    byId("backFromReportsBtn").addEventListener("click", () => showAdminSection("adminMenu"));

    // Wire catalog save
    byId("saveCatalogMovieBtn").addEventListener("click", addMovieToCatalog);

    // Wire theater/auditorium
    byId("addTheaterBtn").addEventListener("click", addTheater);
    byId("addAuditoriumBtn").addEventListener("click", addAuditorium);

    // Wire scheduling
    byId("scheduleShowtimeBtn").addEventListener("click", scheduleShowtime);

    // Wire box office
    byId("boxOfficeSellBtn").addEventListener("click", processBoxOfficeSale);

    // Wire report
    byId("generateReportBtn").addEventListener("click", generateReport);

    // Populate admin dropdowns/lists once logged in
    // (but also safe to pre-load in case you want to see defaults)
    seedDefaultsIfEmpty();
    refreshAdminUI();
}

function seedDefaultsIfEmpty() {
    // Seed theaters only if empty (optional convenience)
    const theaters = getTheaters();
    if (theaters.length === 0) {
        saveTheaters([
            { id: Date.now(), name: "North Theater", auditoriums: ["Auditorium 1", "Auditorium 2"] },
            { id: Date.now() + 1, name: "Downtown Theater", auditoriums: ["Auditorium 1"] },
            { id: Date.now() + 2, name: "West Theater", auditoriums: ["Auditorium 1"] }
        ]);
    }
}

function checkPassword() {
    const input = byId("adminPassword").value;
    const msg = byId("loginMessage");

    if (input === ADMIN_PASSWORD) {
        byId("loginSection").style.display = "none";
        byId("adminMenu").style.display = "block";
        msg.textContent = "";
        refreshAdminUI();
    } else {
        msg.textContent = "Incorrect password.";
        msg.style.color = "red";
    }
}

function logoutAdmin() {
    // Demo logout just returns to login screen
    byId("adminPassword").value = "";
    byId("loginMessage").textContent = "";
    ["adminMenu", "movieAdmin", "scheduleAdmin", "reportAdmin"].forEach(id => {
        const el = byId(id);
        if (el) el.style.display = "none";
    });
    byId("loginSection").style.display = "block";
}

function showAdminSection(sectionId) {
    ["adminMenu", "movieAdmin", "scheduleAdmin", "reportAdmin"].forEach(id => {
        const el = byId(id);
        if (el) el.style.display = (id === sectionId) ? "block" : "none";
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
}

/* -----------------------------
   MOVIE CATALOG (ADMIN)
--------------------------------*/
function addMovieToCatalog() {
    const title = safeText(byId("catalogTitle").value).trim();
    const description = safeText(byId("catalogDescription").value).trim();
    const genre = safeText(byId("catalogGenre").value).trim();
    const runtimeVal = safeText(byId("catalogRuntime").value).trim();

    const msg = byId("catalogMessage");
    if (!title || !description || !genre || !runtimeVal) {
        msg.textContent = "Please fill all fields.";
        msg.style.color = "red";
        return;
    }

    const runtime = parseInt(runtimeVal, 10);
    if (isNaN(runtime) || runtime <= 0) {
        msg.textContent = "Runtime must be a positive number.";
        msg.style.color = "red";
        return;
    }

    const catalog = getMovieCatalog();
    catalog.push({
        id: Date.now(),
        title, description, genre, runtime
    });
    saveMovieCatalog(catalog);

    byId("catalogTitle").value = "";
    byId("catalogDescription").value = "";
    byId("catalogGenre").value = "";
    byId("catalogRuntime").value = "";

    msg.textContent = "Movie saved to catalog!";
    msg.style.color = "green";
    refreshAdminUI();
}

function renderCatalogList() {
    const ul = byId("catalogList");
    if (!ul) return;

    const catalog = getMovieCatalog();
    ul.innerHTML = "";

    if (catalog.length === 0) {
        ul.innerHTML = "<li>No movies in catalog yet.</li>";
        return;
    }

    catalog.forEach((m, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${m.title}</strong><br>
                Genre: ${m.genre} | Runtime: ${m.runtime} min<br>
                ${m.description}
            </div>
            <button onclick="deleteCatalogMovie(${idx})">Delete</button>
        `;
        ul.appendChild(li);
    });
}

function deleteCatalogMovie(index) {
    const catalog = getMovieCatalog();
    const removed = catalog[index];
    if (!removed) return;

    // Remove catalog movie
    catalog.splice(index, 1);
    saveMovieCatalog(catalog);

    // Also remove any showtimes that referenced this movie
    const showtimes = getShowtimes().filter(s => s.movieId !== removed.id);
    saveShowtimes(showtimes);

    // Also remove any cart items for removed showtimes
    const cart = getCart().filter(c => showtimes.some(s => s.id === c.showtimeId));
    saveCart(cart);

    refreshAdminUI();
}

/* -----------------------------
   THEATERS / AUDITORIUMS (ADMIN)
--------------------------------*/
function addTheater() {
    const name = safeText(byId("newTheaterName").value).trim();
    const msg = byId("theaterMessage");

    if (!name) {
        msg.textContent = "Enter a theater name.";
        msg.style.color = "red";
        return;
    }

    const theaters = getTheaters();
    const exists = theaters.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        msg.textContent = "That theater already exists.";
        msg.style.color = "red";
        return;
    }

    theaters.push({ id: Date.now(), name, auditoriums: ["Auditorium 1"] });
    saveTheaters(theaters);

    byId("newTheaterName").value = "";
    msg.textContent = "Theater added!";
    msg.style.color = "green";
    refreshAdminUI();
}

function addAuditorium() {
    const theaterId = parseInt(byId("audTheaterSelect").value, 10);
    const audName = safeText(byId("newAuditoriumName").value).trim();
    const msg = byId("auditoriumMessage");

    if (isNaN(theaterId)) {
        msg.textContent = "Select a theater.";
        msg.style.color = "red";
        return;
    }
    if (!audName) {
        msg.textContent = "Enter an auditorium name.";
        msg.style.color = "red";
        return;
    }

    const theaters = getTheaters();
    const theater = theaters.find(t => t.id === theaterId);
    if (!theater) return;

    const exists = (theater.auditoriums || []).some(a => a.toLowerCase() === audName.toLowerCase());
    if (exists) {
        msg.textContent = "That auditorium already exists for this theater.";
        msg.style.color = "red";
        return;
    }

    theater.auditoriums = theater.auditoriums || [];
    theater.auditoriums.push(audName);
    saveTheaters(theaters);

    byId("newAuditoriumName").value = "";
    msg.textContent = "Auditorium added!";
    msg.style.color = "green";
    refreshAdminUI();
}

function populateAdminTheaterSelects() {
    const theaters = getTheaters();

    const selects = ["audTheaterSelect", "schedTheaterSelect", "reportTheater"].map(byId).filter(Boolean);
    selects.forEach(sel => {
        sel.innerHTML = "";
        theaters.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.name;
            sel.appendChild(opt);
        });
    });

    // When scheduling theater changes, update auditorium dropdown
    const schedTheaterSelect = byId("schedTheaterSelect");
    if (schedTheaterSelect) {
        schedTheaterSelect.onchange = populateSchedAuditoriums;
        populateSchedAuditoriums();
    }
}

function populateSchedAuditoriums() {
    const theaterId = parseInt(byId("schedTheaterSelect")?.value, 10);
    const audSel = byId("schedAuditoriumSelect");
    if (!audSel) return;

    audSel.innerHTML = "";

    const theater = getTheaters().find(t => t.id === theaterId);
    const auds = theater?.auditoriums || [];

    if (auds.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "No auditoriums (add one above)";
        opt.disabled = true;
        opt.selected = true;
        audSel.appendChild(opt);
        return;
    }

    auds.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        audSel.appendChild(opt);
    });
}

/* -----------------------------
   SCHEDULING SHOWTIMES (ADMIN)
--------------------------------*/
function populateAdminMovieSelect() {
    const sel = byId("schedMovieSelect");
    if (!sel) return;

    const catalog = getMovieCatalog();
    sel.innerHTML = "";

    if (catalog.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "No movies in catalog (create one first)";
        opt.disabled = true;
        opt.selected = true;
        sel.appendChild(opt);
        return;
    }

    catalog.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.title} (${m.runtime} min)`;
        sel.appendChild(opt);
    });
}

function scheduleShowtime() {
    const theaterId = parseInt(byId("schedTheaterSelect").value, 10);
    const auditorium = safeText(byId("schedAuditoriumSelect").value).trim();
    const movieId = parseInt(byId("schedMovieSelect").value, 10);
    const date = byId("schedDate").value;
    const time = safeText(byId("schedTime").value).trim();
    const capacityVal = safeText(byId("schedCapacity").value).trim();

    const msg = byId("schedMessage");

    if (isNaN(theaterId) || !auditorium || isNaN(movieId) || !date || !time || !capacityVal) {
        msg.textContent = "Please fill all fields (and ensure you have movies + auditoriums).";
        msg.style.color = "red";
        return;
    }

    const capacity = parseInt(capacityVal, 10);
    if (isNaN(capacity) || capacity <= 0) {
        msg.textContent = "Capacity must be a positive number.";
        msg.style.color = "red";
        return;
    }

    const theaters = getTheaters();
    const theater = theaters.find(t => t.id === theaterId);
    if (!theater) return;

    const showtimes = getShowtimes();
    showtimes.push({
        id: Date.now(),
        movieId,
        theaterId,
        theaterName: theater.name,
        auditorium,
        date,
        time,
        capacity,
        ticketsSold: 0
    });
    saveShowtimes(showtimes);

    byId("schedDate").value = "";
    byId("schedTime").value = "";
    byId("schedCapacity").value = "";

    msg.textContent = "Showtime scheduled!";
    msg.style.color = "green";
    refreshAdminUI();
}

function renderShowtimeList() {
    const ul = byId("showtimeList");
    if (!ul) return;

    const showtimes = getShowtimes();
    const catalog = getMovieCatalog();
    ul.innerHTML = "";

    if (showtimes.length === 0) {
        ul.innerHTML = "<li>No showtimes scheduled.</li>";
        return;
    }

    showtimes
        .slice()
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .forEach((s, idx) => {
            const movie = catalog.find(m => m.id === s.movieId);
            const title = movie ? movie.title : "(Movie removed)";
            const remaining = s.capacity - (s.ticketsSold || 0);

            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${title}</strong><br>
                    ${s.date} ${s.time} — ${s.theaterName} — ${s.auditorium}<br>
                    Capacity: ${s.capacity} | Sold: ${s.ticketsSold || 0} | Remaining: ${remaining}
                </div>
                <button onclick="deleteShowtime(${idx})">Delete</button>
            `;
            ul.appendChild(li);
        });
}

function deleteShowtime(index) {
    const showtimes = getShowtimes();
    const removed = showtimes[index];
    if (!removed) return;

    // Remove showtime
    showtimes.splice(index, 1);
    saveShowtimes(showtimes);

    // Remove from cart
    const cart = getCart().filter(c => c.showtimeId !== removed.id);
    saveCart(cart);

    // Remove tickets for that showtime
    const tickets = getTickets().filter(t => t.showtimeId !== removed.id);
    saveTickets(tickets);

    refreshAdminUI();
}

/* -----------------------------
   BOX OFFICE SALES (ADMIN)
--------------------------------*/
function populateBoxOfficeShowtimes() {
    const select = byId("boxOfficeShowtime");
    if (!select) return;

    const showtimes = getShowtimes();
    const catalog = getMovieCatalog();
    select.innerHTML = "";

    if (showtimes.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "No showtimes available";
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
        return;
    }

    showtimes.forEach(s => {
        const movie = catalog.find(m => m.id === s.movieId);
        const title = movie ? movie.title : "(Movie removed)";
        const remaining = s.capacity - (s.ticketsSold || 0);

        const opt = document.createElement("option");
        opt.value = s.id;

        let text = `${title} — ${s.date} ${s.time} @ ${s.theaterName} (${s.auditorium}) (Remaining: ${remaining})`;
        if (remaining <= 0) {
            text += " [SOLD OUT]";
            opt.disabled = true;
        }
        opt.textContent = text;
        select.appendChild(opt);
    });
}

function processBoxOfficeSale() {
    const select = byId("boxOfficeShowtime");
    const qtyInput = byId("boxOfficeQuantity");
    const msg = byId("boxOfficeMessage");
    if (!select || !qtyInput || !msg) return;

    const showtimeId = parseInt(select.value, 10);
    const quantity = parseInt(qtyInput.value, 10);

    if (isNaN(showtimeId)) {
        msg.textContent = "Please select a valid showtime.";
        msg.style.color = "red";
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        msg.textContent = "Enter a valid ticket quantity.";
        msg.style.color = "red";
        return;
    }

    const showtimes = getShowtimes();
    const s = showtimes.find(x => x.id === showtimeId);
    if (!s) {
        msg.textContent = "Showtime not found.";
        msg.style.color = "red";
        return;
    }

    const remaining = s.capacity - (s.ticketsSold || 0);
    if (quantity > remaining) {
        msg.textContent = `Only ${remaining} tickets remaining for this showtime.`;
        msg.style.color = "red";
        return;
    }

    s.ticketsSold = (s.ticketsSold || 0) + quantity;

    const tickets = getTickets();
    const confirmationCode = generateConfirmationCode();
    tickets.push({
        confirmationCode,
        showtimeId: s.id,
        quantity,
        channel: "boxOffice",
        timestamp: new Date().toISOString()
    });

    saveShowtimes(showtimes);
    saveTickets(tickets);

    msg.textContent = `Sale complete! Confirmation code: ${confirmationCode}`;
    msg.style.color = "green";

    qtyInput.value = "1";
    refreshAdminUI();
}

/* -----------------------------
   REPORTS (ADMIN)
   Tickets sold by theater + date range (by SHOW DATE)
--------------------------------*/
function populateReportTheaters() {
    const sel = byId("reportTheater");
    if (!sel) return;
    // already populated in populateAdminTheaterSelects()
}

function generateReport() {
    const sel = byId("reportTheater");
    const output = byId("reportOutput");
    const startStr = byId("reportStart").value;
    const endStr = byId("reportEnd").value;

    if (!sel || !output) return;

    const theaterId = parseInt(sel.value, 10);
    const theaters = getTheaters();
    const theater = theaters.find(t => t.id === theaterId);

    if (!theater) {
        output.innerHTML = `<p style="color:red;">Select a theater.</p>`;
        return;
    }
    if (!startStr || !endStr) {
        output.innerHTML = `<p style="color:red;">Select both a start and end date.</p>`;
        return;
    }

    const start = parseISODate(startStr);
    const end = parseISODate(endStr);
    // include whole end day by adding 23:59:59
    end.setHours(23, 59, 59, 999);

    const showtimes = getShowtimes().filter(s => s.theaterId === theaterId);
    const catalog = getMovieCatalog();

    const inRange = showtimes.filter(s => {
        const d = parseISODate(s.date);
        return withinInclusive(d, start, end);
    });

    const totalTickets = inRange.reduce((sum, s) => sum + (s.ticketsSold || 0), 0);

    // breakdown by date
    const byDate = {};
    inRange.forEach(s => {
        byDate[s.date] = (byDate[s.date] || 0) + (s.ticketsSold || 0);
    });

    // breakdown by showtime
    const details = inRange
        .slice()
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .map(s => {
            const movie = catalog.find(m => m.id === s.movieId);
            const title = movie ? movie.title : "(Movie removed)";
            return `<li>${s.date} ${s.time} — <strong>${title}</strong> (${s.auditorium}) : ${s.ticketsSold || 0} sold</li>`;
        })
        .join("");

    const dateLines = Object.keys(byDate).sort().map(d => `<li>${d}: ${byDate[d]} sold</li>`).join("");

    output.innerHTML = `
        <h3>Sales Report</h3>
        <p><strong>Theater:</strong> ${theater.name}</p>
        <p><strong>Date Range:</strong> ${startStr} to ${endStr}</p>
        <p><strong>Total Tickets Sold:</strong> ${totalTickets}</p>

        <h4>By Date</h4>
        <ul>${dateLines || "<li>No sales in range.</li>"}</ul>

        <h4>By Showtime</h4>
        <ul>${details || "<li>No showtimes in range.</li>"}</ul>
    `;
}

/* -----------------------------
   VIEWER SCHEDULE PAGE
--------------------------------*/
function initSchedulePage() {
    const theaterSelect = byId("viewerTheater");
    if (!theaterSelect) return; // not on schedule page

    seedDefaultsIfEmpty();
    populateViewerTheaters();

    byId("viewerFilterBtn").addEventListener("click", loadTheaterSchedule);
    byId("checkoutBtn").addEventListener("click", checkout);

    loadCart();
}

function populateViewerTheaters() {
    const select = byId("viewerTheater");
    const theaters = getTheaters();

    // Keep the placeholder option
    select.innerHTML = `<option value="">-- Choose Theater --</option>`;

    theaters.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        select.appendChild(opt);
    });
}

function loadTheaterSchedule() {
    const theaterId = parseInt(byId("viewerTheater").value, 10);
    const date = byId("viewerDate").value;

    const list = byId("scheduleList");
    list.innerHTML = "";

    if (isNaN(theaterId)) {
        list.innerHTML = `<li>Please select a theater to view its schedule.</li>`;
        return;
    }

    const showtimes = getShowtimes().filter(s => s.theaterId === theaterId);
    const filtered = date ? showtimes.filter(s => s.date === date) : showtimes;

    displaySchedule(filtered);
}

function displaySchedule(showtimes) {
    const list = byId("scheduleList");
    if (!list) return;

    const catalog = getMovieCatalog();
    list.innerHTML = "";

    if (showtimes.length === 0) {
        list.innerHTML = "<li>No showtimes scheduled.</li>";
        return;
    }

    showtimes
        .slice()
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .forEach(s => {
            const movie = catalog.find(m => m.id === s.movieId);
            const title = movie ? movie.title : "(Movie removed)";
            const remaining = s.capacity - (s.ticketsSold || 0);
            const soldOut = remaining <= 0;

            const li = document.createElement("li");
            li.innerHTML = `
                <div style="width:100%">
                    <strong>${title}</strong><br>
                    ${s.date} ${s.time} — ${s.theaterName} — ${s.auditorium}
                    ${soldOut ? '<span class="sold-out">Sold Out</span>' : ''}

                    <div id="details-${s.id}" class="movie-details" style="display:none;">
                        ${movie ? `
                            <p><strong>Genre:</strong> ${movie.genre}</p>
                            <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                            <p><strong>Description:</strong> ${movie.description}</p>
                        ` : `<p><em>Movie details unavailable.</em></p>`}
                        <p><strong>Capacity:</strong> ${s.capacity}</p>
                        <p><strong>Remaining Seats:</strong> ${remaining}</p>
                    </div>
                </div>

                <div>
                    <button onclick="toggleDetails(${s.id}, this)">View Details</button><br><br>
                    <label for="qty-${s.id}">Qty</label>
                    <input type="number" id="qty-${s.id}" min="1"
                        ${!soldOut ? `max="${remaining}" value="1"` : 'value="0"'}
                        ${soldOut ? "disabled" : ""}>
                    <button onclick="addToCart(${s.id})" ${soldOut ? "disabled" : ""}>Add Ticket</button>
                </div>
            `;
            list.appendChild(li);
        });
}

function toggleDetails(id, btn) {
    const details = byId(`details-${id}`);
    if (!details) return;

    if (details.style.display === "none") {
        details.style.display = "block";
        btn.textContent = "Hide Details";
    } else {
        details.style.display = "none";
        btn.textContent = "View Details";
    }
}

/* -----------------------------
   CART + CHECKOUT (VIEWER)
--------------------------------*/
function addToCart(showtimeId) {
    const qtyInput = byId(`qty-${showtimeId}`);
    if (!qtyInput) {
        alert("Quantity input not found.");
        return;
    }

    const quantity = parseInt(qtyInput.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid ticket quantity.");
        return;
    }

    const showtimes = getShowtimes();
    const s = showtimes.find(x => x.id === showtimeId);
    if (!s) {
        alert("Showtime not found.");
        return;
    }

    const remaining = s.capacity - (s.ticketsSold || 0);

    const cart = getCart();
    const existing = cart.find(item => item.showtimeId === showtimeId);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (quantity + alreadyInCart > remaining) {
        alert(`Only ${remaining - alreadyInCart} more tickets can be added to the cart for this showtime.`);
        return;
    }

    if (existing) existing.quantity += quantity;
    else cart.push({ showtimeId, quantity });

    saveCart(cart);
    loadCart();
    alert("Ticket(s) added!");
}

function loadCart() {
    const list = byId("cartList");
    if (!list) return;

    const cart = getCart();
    const showtimes = getShowtimes();
    const catalog = getMovieCatalog();

    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = "<li>Your cart is empty.</li>";
        return;
    }

    cart.forEach(item => {
        const s = showtimes.find(x => x.id === item.showtimeId);
        if (!s) return;

        const movie = catalog.find(m => m.id === s.movieId);
        const title = movie ? movie.title : "(Movie removed)";

        const li = document.createElement("li");
        li.textContent = `${title} — ${s.date} ${s.time} @ ${s.theaterName} (${s.auditorium}) (Qty: ${item.quantity})`;
        list.appendChild(li);
    });
}

function checkout() {
    const cart = getCart();
    const confirmationDiv = byId("purchaseConfirmation");
    if (confirmationDiv) confirmationDiv.innerHTML = "";

    if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const showtimes = getShowtimes();
    const catalog = getMovieCatalog();

    // Verify capacity for all items
    for (const item of cart) {
        const s = showtimes.find(x => x.id === item.showtimeId);
        if (!s) {
            alert("A showtime in your cart no longer exists.");
            return;
        }
        const remaining = s.capacity - (s.ticketsSold || 0);
        if (item.quantity > remaining) {
            const movie = catalog.find(m => m.id === s.movieId);
            alert(`Not enough seats left for ${movie?.title || "this showtime"}. Remaining: ${remaining}`);
            return;
        }
    }

    const tickets = getTickets();
    const confirmationCode = generateConfirmationCode();
    const purchaseDetails = [];

    cart.forEach(item => {
        const s = showtimes.find(x => x.id === item.showtimeId);
        const quantity = item.quantity;

        s.ticketsSold = (s.ticketsSold || 0) + quantity;

        tickets.push({
            confirmationCode,
            showtimeId: s.id,
            quantity,
            channel: "online",
            timestamp: new Date().toISOString()
        });

        const movie = catalog.find(m => m.id === s.movieId);
        const title = movie ? movie.title : "(Movie removed)";

        purchaseDetails.push(`${title} — ${s.date} ${s.time} @ ${s.theaterName} (${s.auditorium}) (Qty: ${quantity})`);
    });

    saveShowtimes(showtimes);
    saveTickets(tickets);
    saveCart([]);
    loadCart();

    // Refresh schedule list if user is currently viewing a theater
    if (byId("viewerTheater")) loadTheaterSchedule();

    if (confirmationDiv) {
        const detailsHtml = purchaseDetails.map(d => `<li>${d}</li>`).join("");
        confirmationDiv.innerHTML = `
            <h4>Purchase Complete!</h4>
            <p>Your confirmation code:</p>
            <p><strong>${confirmationCode}</strong></p>
            <p>Show this code at the theater to receive your tickets.</p>
            <ul>${detailsHtml}</ul>
        `;
    } else {
        alert(`Purchase complete! Confirmation code: ${confirmationCode}`);
    }
}
