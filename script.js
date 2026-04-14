const ADMIN_PASSWORD = "TwoKies123";

// LOGIN
function checkPassword() {
    if (adminPassword.value === ADMIN_PASSWORD) {
        loginSection.style.display = "none";
        adminPanel.style.display = "block";
    } else {
        loginMessage.textContent = "Incorrect password";
    }
}

// STORAGE
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
    return JSON.parse(localStorage.getItem("theaters")) || [
        { name: "North Theater", active: true },
        { name: "Downtown Theater", active: true },
        { name: "West Theater", active: true }
    ];
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

// NAVIGATION
function showSection(id) {
    ["moviesSection","scheduleSection","reportSection"].forEach(s => {
        document.getElementById(s).style.display = "none";
    });
    document.getElementById(id).style.display = "block";

    if (id === "scheduleSection") {
        loadDropdowns();
        populateBoxOfficeShowtimes();
        loadDeactivateDropdown();
    }
}

// CREATE MOVIE
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

// DROPDOWNS
function loadDropdowns() {
    movieSelect.innerHTML = getMovieDefinitions()
        .map(m => `<option value="${m.id}">${m.title}</option>`).join("");

    theaterSelect.innerHTML = getTheaters()
        .filter(t => t.active)
        .map(t => `<option>${t.name}</option>`).join("");
}

// THEATERS
function addTheater() {
    const t = getTheaters();
    t.push({ name: newTheaterName.value, active: true });
    saveTheaters(t);
    loadDropdowns();
}

function loadDeactivateDropdown() {
    const select = document.getElementById("theaterDeactivate");
    select.innerHTML = getTheaters()
        .map(t => `<option value="${t.name}">${t.name} (${t.active ? "Active" : "Inactive"})</option>`)
        .join("");
}

function toggleSelectedTheater() {
    const name = theaterDeactivate.value;
    const theaters = getTheaters();

    const t = theaters.find(x => x.name === name);
    t.active = !t.active;

    saveTheaters(theaters);
    loadDeactivateDropdown();
}

// SCHEDULE MOVIE
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

// LOAD PAGE
function loadMovies() {
    loadTheaterFilter();
    loadCart();
}

// THEATER FILTER
function loadTheaterFilter() {
    theaterFilter.innerHTML =
        `<option value="">Select Theater</option>` +
        getTheaters()
            .filter(t => t.active)
            .map(t => `<option>${t.name}</option>`)
            .join("");
}

function filterByTheater() {
    let movies = getMovies();
    const t = theaterFilter.value;

    movies = t ? movies.filter(m => m.location === t) : [];
    displaySchedule(movies);
}

// DISPLAY
function displaySchedule(movies) {
    const list = scheduleList;
    list.innerHTML = "";

    movies.forEach(m => {
        const remaining = m.capacity - m.ticketsSold;
        const soldOut = remaining <= 0;

        const li = document.createElement("li");
        li.innerHTML = `
        <div>
            <strong>${m.title}</strong><br>
            ${m.date} ${m.time}<br>
            ${soldOut ? '<span class="sold-out">Sold Out</span>' : ''}

            <div id="details-${m.id}" class="movie-details" style="display:none;">
                <p>${m.description}</p>
                <p>${m.genre}</p>
                <p>${m.runtime} min</p>
            </div>
        </div>

        <div>
            <button onclick="toggleDetails(${m.id}, this)">View Details</button><br><br>

            <input type="number" id="qty-${m.id}" min="1"
                ${soldOut ? "disabled" : `max="${remaining}" value="1"`}>

            <button onclick="addToCart(${m.id})"
                ${soldOut ? "disabled" : ""}>Add</button>

            <button onclick="deleteShowtime(${m.id})">Delete</button>
        </div>
        `;
        list.appendChild(li);
    });
}

// DETAILS
function toggleDetails(id, btn) {
    const d = document.getElementById(`details-${id}`);
    d.style.display = d.style.display === "none" ? "block" : "none";
}

// CART
function addToCart(id) {
    const movies = getMovies();
    const m = movies.find(x => x.id === id);

    const remaining = m.capacity - m.ticketsSold;
    const qty = parseInt(document.getElementById(`qty-${id}`).value);

    if (remaining <= 0 || qty > remaining) {
        alert("Not enough seats.");
        return;
    }

    const cart = getCart();
    const existing = cart.find(c => c.id === id);

    if (existing) existing.qty += qty;
    else cart.push({ id, qty });

    saveCart(cart);
    loadCart();
}

function loadCart() {
    cartList.innerHTML = "";
    const cart = getCart();
    const movies = getMovies();

    cart.forEach(c => {
        const m = movies.find(x => x.id === c.id);
        const li = document.createElement("li");
        li.textContent = `${m.title} (${c.qty})`;
        cartList.appendChild(li);
    });
}

// CHECKOUT
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
            timestamp: new Date().toISOString(),
            channel: "online"
        });
    });

    saveMovies(movies);
    saveTickets(tickets);
    saveCart([]);

    alert("Purchase complete!");
    loadCart();
}

// BOX OFFICE
function populateBoxOfficeShowtimes() {
    boxOfficeShowtime.innerHTML = getMovies()
        .map(m => `<option value="${m.id}">${m.title}</option>`).join("");
}

function processBoxOfficeSale() {
    const id = parseInt(boxOfficeShowtime.value);
    const qty = parseInt(boxOfficeQuantity.value);

    const movies = getMovies();
    const m = movies.find(x => x.id === id);

    const remaining = m.capacity - m.ticketsSold;
    if (qty > remaining) {
        alert("Not enough seats.");
        return;
    }

    m.ticketsSold += qty;

    const tickets = getTickets();
    tickets.push({
        showtimeId: id,
        quantity: qty,
        timestamp: new Date().toISOString(),
        channel: "boxOffice"
    });

    saveMovies(movies);
    saveTickets(tickets);

    alert("Box office sale complete!");
}

// DELETE
function deleteShowtime(id) {
    let movies = getMovies();
    movies = movies.filter(m => m.id !== id);
    saveMovies(movies);
    loadMovies();
}

// REPORT
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
