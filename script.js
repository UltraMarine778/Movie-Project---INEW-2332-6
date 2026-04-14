const ADMIN_PASSWORD = "TwoKies123";

// ---------- LOGIN ----------
function checkPassword() {
    if (adminPassword.value === ADMIN_PASSWORD) {
        loginSection.style.display = "none";
        adminPanel.style.display = "block";
    } else {
        loginMessage.textContent = "Incorrect password";
    }
}

// ---------- STORAGE ----------
function getMovieDefinitions() {
    return JSON.parse(localStorage.getItem("movieDefs")) || [];
}
function saveMovieDefinitions(d) {
    localStorage.setItem("movieDefs", JSON.stringify(d));
}

function getMovies() {
    return JSON.parse(localStorage.getItem("movies")) || [];
}
function saveMovies(d) {
    localStorage.setItem("movies", JSON.stringify(d));
}

function getTheaters() {
    return JSON.parse(localStorage.getItem("theaters")) || ["North Theater","Downtown Theater","West Theater"];
}
function saveTheaters(d) {
    localStorage.setItem("theaters", JSON.stringify(d));
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(d) {
    localStorage.setItem("cart", JSON.stringify(d));
}

function getTickets() {
    return JSON.parse(localStorage.getItem("tickets")) || [];
}
function saveTickets(d) {
    localStorage.setItem("tickets", JSON.stringify(d));
}

// ---------- NAV ----------
function showSection(id) {
    ["moviesSection","scheduleSection","reportSection"].forEach(s => {
        document.getElementById(s).style.display = "none";
    });
    document.getElementById(id).style.display = "block";

    if (id === "scheduleSection") loadDropdowns();
}

// ---------- MOVIE CREATION ----------
function addMovieDefinition() {
    const defs = getMovieDefinitions();

    defs.push({
        id: Date.now(),
        title: movieTitle.value,
        description: movieDescription.value,
        genre: movieGenre.value,
        runtime: movieRuntime.value
    });

    saveMovieDefinitions(defs);
    movieMsg.textContent = "Saved!";
}

// ---------- DROPDOWNS ----------
function loadDropdowns() {
    movieSelect.innerHTML = getMovieDefinitions()
        .map(m => `<option value="${m.id}">${m.title}</option>`).join("");

    theaterSelect.innerHTML = getTheaters()
        .map(t => `<option>${t}</option>`).join("");
}

// ---------- ADD THEATER ----------
function addTheater() {
    const t = getTheaters();
    t.push(newTheaterName.value);
    saveTheaters(t);
    loadDropdowns();
}

// ---------- SCHEDULE ----------
function scheduleMovie() {
    const defs = getMovieDefinitions();
    const movies = getMovies();

    const def = defs.find(d => d.id == movieSelect.value);

    movies.push({
        id: Date.now(),
        ...def,
        date: movieDate.value,
        time: movieTime.value,
        location: theaterSelect.value,
        capacity: parseInt(movieCapacity.value),
        ticketsSold: 0
    });

    saveMovies(movies);
    alert("Scheduled!");
}

// ---------- LOAD ----------
function loadMovies() {
    loadTheaterFilter();
    loadCart();
}

// ---------- THEATER FILTER ----------
function loadTheaterFilter() {
    const select = document.getElementById("theaterFilter");
    if (!select) return;

    select.innerHTML = `<option value="">Select Theater</option>` +
        getTheaters().map(t => `<option>${t}</option>`).join("");
}

function filterByTheater() {
    let movies = getMovies();
    const t = theaterFilter.value;

    if (t) {
        movies = movies.filter(m => m.location === t);
    } else {
        movies = [];
    }

    displaySchedule(movies);
}

// ---------- DISPLAY ----------
function displaySchedule(movies) {
    const list = document.getElementById("scheduleList");
    list.innerHTML = "";

    movies.forEach(m => {
        const remaining = m.capacity - m.ticketsSold;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${m.title}</strong><br>
                ${m.date} ${m.time}<br>
                ${remaining <= 0 ? "Sold Out" : ""}
            </div>
            <div>
                <input type="number" id="qty-${m.id}" min="1" max="${remaining}" value="1">
                <button onclick="addToCart(${m.id})">Add</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// ---------- CART ----------
function addToCart(id) {
    const cart = getCart();
    const qty = parseInt(document.getElementById(`qty-${id}`).value);

    const existing = cart.find(i => i.id === id);

    if (existing) existing.qty += qty;
    else cart.push({ id, qty });

    saveCart(cart);
    loadCart();
}

function loadCart() {
    const list = document.getElementById("cartList");
    if (!list) return;

    const cart = getCart();
    const movies = getMovies();

    list.innerHTML = "";

    cart.forEach(c => {
        const m = movies.find(x => x.id === c.id);
        const li = document.createElement("li");
        li.textContent = `${m.title} (${c.qty})`;
        list.appendChild(li);
    });
}

// ---------- CHECKOUT ----------
function checkout() {
    const cart = getCart();
    const movies = getMovies();
    const tickets = getTickets();

    cart.forEach(c => {
        const m = movies.find(x => x.id === c.id);
        m.ticketsSold += c.qty;

        tickets.push({
            showtimeId: m.id,
            quantity: c.qty,
            timestamp: new Date().toISOString()
        });
    });

    saveMovies(movies);
    saveTickets(tickets);
    saveCart([]);

    alert("Purchase complete!");
    loadCart();
}

// ---------- REPORT ----------
function generateReport() {
    const start = new Date(reportStart.value);
    const end = new Date(reportEnd.value);

    const tickets = getTickets();
    const movies = getMovies();

    const result = {};

    tickets.forEach(t => {
        const d = new Date(t.timestamp);
        if (d >= start && d <= end) {
            const m = movies.find(x => x.id === t.showtimeId);
            if (!m) return;

            if (!result[m.location]) result[m.location] = 0;
            result[m.location] += t.quantity;
        }
    });

    reportResults.innerHTML = "";

    Object.keys(result).forEach(k => {
        const li = document.createElement("li");
        li.textContent = `${k}: ${result[k]} tickets`;
        reportResults.appendChild(li);
    });
}
