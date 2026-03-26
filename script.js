// SIMPLE ADMIN PASSWORD
const ADMIN_PASSWORD = "TwoKies123";

// ---------- EVENT WIRING ----------
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const addMovieBtn = document.getElementById("addMovieBtn");
    const boxOfficeSellBtn = document.getElementById("boxOfficeSellBtn");

    if (loginBtn) loginBtn.addEventListener("click", checkPassword);
    if (addMovieBtn) addMovieBtn.addEventListener("click", addMovie);
    if (boxOfficeSellBtn) boxOfficeSellBtn.addEventListener("click", processBoxOfficeSale);

    loadMovies();

    window.addEventListener("storage", () => loadMovies());
});

// ---------- LOGIN ----------
function checkPassword() {
    const input = document.getElementById("adminPassword").value;
    const msg = document.getElementById("loginMessage");

    if (input === ADMIN_PASSWORD) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
    } else {
        msg.textContent = "Incorrect password.";
        msg.style.color = "red";
    }
}

// ---------- STORAGE ----------
function getMovies() {
    return JSON.parse(localStorage.getItem("movies")) || [];
}
function saveMovies(movies) {
    localStorage.setItem("movies", JSON.stringify(movies));
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

// ---------- ADD MOVIE ----------
function addMovie() {
    const title = document.getElementById("movieTitle").value.trim();
    const description = document.getElementById("movieDescription").value.trim();
    const genre = document.getElementById("movieGenre").value.trim();
    const runtime = document.getElementById("movieRuntime").value.trim();
    const time = document.getElementById("movieTime").value.trim();
    const date = document.getElementById("movieDate").value;
    const location = document.getElementById("movieLocation").value;
    const capacityValue = document.getElementById("movieCapacity").value.trim();

    const msg = document.getElementById("adminMessage");

    if (!title || !description || !genre || !runtime || !time || !date || !location || !capacityValue) {
        msg.textContent = "Please fill all fields.";
        msg.style.color = "red";
        return;
    }

    let capacity = parseInt(capacityValue, 10);

    if (isNaN(capacity) || capacity <= 0) {
        msg.textContent = "Capacity must be valid.";
        msg.style.color = "red";
        return;
    }

    // ✅ LIMIT TO 30
    if (capacity > 30) capacity = 30;

    const movies = getMovies();

    const newMovie = {
        id: Date.now(),
        title,
        description,
        genre,
        runtime,
        time,
        date,
        location,
        capacity,
        ticketsSold: 0
    };

    movies.push(newMovie);
    saveMovies(movies);

    document.getElementById("movieTitle").value = "";
    document.getElementById("movieDescription").value = "";
    document.getElementById("movieGenre").value = "";
    document.getElementById("movieRuntime").value = "";
    document.getElementById("movieTime").value = "";
    document.getElementById("movieDate").value = "";
    document.getElementById("movieCapacity").value = "";

    msg.textContent = "Movie added!";
    msg.style.color = "green";

    loadMovies();
}

// ---------- LOAD MOVIES ----------
function loadMovies() {
    const movieList = document.getElementById("movieList");
    const scheduleList = document.getElementById("scheduleList");
    const movies = getMovies();

    if (movieList) {
        movieList.innerHTML = "";
        movies.forEach((movie, index) => {
            const remaining = movie.capacity - (movie.ticketsSold || 0);

            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${movie.title}</strong><br>
                    ${movie.time} - ${movie.date} - ${movie.location}<br>
                    Capacity: ${movie.capacity} |
                    Sold: ${movie.ticketsSold || 0} |
                    Remaining: ${remaining}
                </div>
                <button onclick="deleteMovie(${index})">Delete</button>
            `;
            movieList.appendChild(li);
        });
    }

    if (scheduleList) {
        displaySchedule(movies);
    }

    loadCart();
    populateBoxOfficeShowtimes();
}

// ---------- DISPLAY SCHEDULE WITH DETAILS & QUANTITY ----------
function displaySchedule(movies) {
    const list = document.getElementById("scheduleList");
    if (!list) return;

    list.innerHTML = "";

    if (movies.length === 0) {
        list.innerHTML = "<li>No movies scheduled.</li>";
        return;
    }

    movies.forEach((movie) => {
        const remaining = movie.capacity - (movie.ticketsSold || 0);
        const soldOut = remaining <= 0;

        const li = document.createElement("li");
        li.innerHTML = `
            <div style="width:100%">
                <strong>${movie.title}</strong><br>
                ${movie.time} - ${movie.date} - ${movie.location}
                ${soldOut ? '<span class="sold-out">Sold Out</span>' : ''}
                <div id="details-${movie.id}" class="movie-details" style="display:none;">
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                    <p><strong>Description:</strong> ${movie.description}</p>
                    <p><strong>Capacity:</strong> ${movie.capacity}</p>
                    <p><strong>Remaining Seats:</strong> ${remaining}</p>
                </div>
            </div>
            <div>
                <button onclick="toggleDetails(${movie.id}, this)">View Details</button><br><br>
                <label for="qty-${movie.id}">Qty</label>
                <input type="number" id="qty-${movie.id}" min="1" ${!soldOut ? `max="${remaining}" value="1"` : 'value="0"'} ${soldOut ? "disabled" : ""}>
                <button onclick="addToCart(${movie.id})" ${soldOut ? "disabled" : ""}>Add Ticket</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// ---------- TOGGLE DETAILS ----------
function toggleDetails(id, btn) {
    const details = document.getElementById(`details-${id}`);
    if (!details) return;

    if (details.style.display === "none") {
        details.style.display = "block";
        btn.textContent = "Hide Details";
    } else {
        details.style.display = "none";
        btn.textContent = "View Details";
    }
}

// ---------- CART ----------
function addToCart(showtimeId) {
    const qtyInput = document.getElementById(`qty-${showtimeId}`);
    let quantity = parseInt(qtyInput.value, 10);

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);

    const remaining = movie.capacity - (movie.ticketsSold || 0);

    const cart = getCart();
    const existing = cart.find(item => item.showtimeId === showtimeId);
    const already = existing ? existing.quantity : 0;

    if (quantity + already > remaining) {
        alert("Not enough tickets available.");
        return;
    }

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ showtimeId, quantity });
    }

    saveCart(cart);
    loadCart();
}

// ✅ LOAD CART WITH REMOVE BUTTON
function loadCart() {
    const list = document.getElementById("cartList");
    if (!list) return;

    const cart = getCart();
    const movies = getMovies();

    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = "<li>Your cart is empty.</li>";
        return;
    }

    cart.forEach((item, index) => {
        const movie = movies.find(m => m.id === item.showtimeId);
        if (!movie) return;

        const li = document.createElement("li");
        li.innerHTML = `
            ${movie.title} - ${movie.time} - ${movie.location} (Qty: ${item.quantity})
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        list.appendChild(li);
    });
}

// ✅ REMOVE ITEM
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCart();
}

// ---------- CHECKOUT ----------
function checkout() {
    const cart = getCart();
    const confirmationDiv = document.getElementById("purchaseConfirmation");

    if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const movies = getMovies();

    for (const item of cart) {
        const movie = movies.find(m => m.id === item.showtimeId);
        const remaining = movie.capacity - (movie.ticketsSold || 0);

        if (item.quantity > remaining) {
            alert(`Not enough seats for ${movie.title}`);
            return;
        }
    }

    cart.forEach(item => {
        const movie = movies.find(m => m.id === item.showtimeId);
        movie.ticketsSold += item.quantity;
    });

    saveMovies(movies);
    saveCart([]);
    loadCart();
    loadMovies();

    confirmationDiv.innerHTML = "<h4>Purchase Successful</h4>";
}

// ---------- BOX OFFICE ----------
function populateBoxOfficeShowtimes() {
    const select = document.getElementById("boxOfficeShowtime");
    if (!select) return;

    const movies = getMovies();
    select.innerHTML = "";

    movies.forEach(movie => {
        const remaining = movie.capacity - (movie.ticketsSold || 0);

        const opt = document.createElement("option");
        opt.value = movie.id;
        opt.textContent = `${movie.title} (${remaining} left)`;

        if (remaining <= 0) opt.disabled = true;

        select.appendChild(opt);
    });
}

function processBoxOfficeSale() {
    const select = document.getElementById("boxOfficeShowtime");
    const qtyInput = document.getElementById("boxOfficeQuantity");
    const msg = document.getElementById("boxOfficeMessage");

    const showtimeId = parseInt(select.value);
    const quantity = parseInt(qtyInput.value);

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);

    const remaining = movie.capacity - (movie.ticketsSold || 0);

    if (quantity > remaining) {
        msg.textContent = "Not enough tickets.";
        msg.style.color = "red";
        return;
    }

    movie.ticketsSold += quantity;

    saveMovies(movies);

    msg.textContent = "Sale complete!";
    msg.style.color = "green";

    loadMovies();
}

// ---------- DELETE MOVIE ----------
function deleteMovie(index) {
    const movies = getMovies();
    const cart = getCart();

    const removed = movies[index];
    movies.splice(index, 1);

    saveMovies(movies);
    saveCart(cart.filter(c => c.showtimeId !== removed.id));

    loadMovies();
}

function applyFilters() {
    const date = document.getElementById("filterDate").value;
    const location = document.getElementById("filterLocation").value;

    let movies = getMovies();

    if (date) {
        movies = movies.filter(m => m.date === date);
    }

    if (location) {
        movies = movies.filter(m => m.location === location);
    }

    displaySchedule(movies);
}
