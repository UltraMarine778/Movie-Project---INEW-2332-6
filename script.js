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

// ---------- STORAGE HELPERS ----------
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

// ---------- UTILS ----------
function generateConfirmationCode() {
    // Simple unique code
    return "TK-" + Date.now().toString(36).toUpperCase();
}

// ---------- ADD MOVIE (ADMIN) ----------
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

    const capacity = parseInt(capacityValue, 10);
    if (isNaN(capacity) || capacity <= 0) {
        msg.textContent = "Capacity must be a positive number.";
        msg.style.color = "red";
        return;
    }

    const movies = getMovies();

    const newMovie = {
        id: Date.now(),             // unique showtime ID
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

    // Clear inputs
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

// ---------- LOAD MOVIES (BOTH ADMIN & SCHEDULE) ----------
function loadMovies() {
    const movieList = document.getElementById("movieList");
    const scheduleList = document.getElementById("scheduleList");
    const movies = getMovies();

    // Admin movie list
    if (movieList) {
        movieList.innerHTML = "";
        if (movies.length === 0) {
            movieList.innerHTML = "<li>No movies scheduled.</li>";
        } else {
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
    }

    // Public schedule list
    if (scheduleList) {
        displaySchedule(movies);
    }

    // Cart for schedule page
    loadCart();

    // Box office dropdown (admin page)
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

// ---------- FILTERS ----------
function applyFilters() {
    const date = document.getElementById("filterDate").value;
    const location = document.getElementById("filterLocation").value;
    let movies = getMovies();

    if (date) movies = movies.filter(m => m.date === date);
    if (location) movies = movies.filter(m => m.location === location);

    displaySchedule(movies);
}

// ---------- CART (ONLINE) ----------
function addToCart(showtimeId) {
    const qtyInput = document.getElementById(`qty-${showtimeId}`);
    if (!qtyInput) {
        alert("Quantity input not found.");
        return;
    }

    let quantity = parseInt(qtyInput.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid ticket quantity.");
        return;
    }

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);
    if (!movie) {
        alert("Showtime not found.");
        return;
    }

    const remaining = movie.capacity - (movie.ticketsSold || 0);

    // Check against remaining seats
    const cart = getCart();
    const existing = cart.find(item => item.showtimeId === showtimeId);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (quantity + alreadyInCart > remaining) {
        alert(`Only ${remaining - alreadyInCart} more tickets can be added to the cart for this showtime.`);
        return;
    }

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            showtimeId: showtimeId,
            quantity: quantity
        });
    }

    saveCart(cart);
    loadCart();
    alert("Ticket(s) added!");
}

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

    cart.forEach(item => {
        const movie = movies.find(m => m.id === item.showtimeId);
        if (!movie) return;

        const li = document.createElement("li");
        li.textContent = `${movie.title} - ${movie.time} - ${movie.location} (Qty: ${item.quantity})`;
        list.appendChild(li);
    });
}

// ---------- CHECKOUT (ONLINE PURCHASE) ----------
function checkout() {
    const cart = getCart();
    const confirmationDiv = document.getElementById("purchaseConfirmation");

    if (confirmationDiv) {
        confirmationDiv.innerHTML = "";
    }

    if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const movies = getMovies();

    // First pass: verify capacity for all items
    for (const item of cart) {
        const movie = movies.find(m => m.id === item.showtimeId);
        if (!movie) {
            alert("A showtime in your cart no longer exists.");
            return;
        }
        const remaining = movie.capacity - (movie.ticketsSold || 0);
        if (item.quantity > remaining) {
            alert(`Not enough seats left for ${movie.title}. Remaining: ${remaining}`);
            return;
        }
    }

    // All good – create tickets and update capacity
    const tickets = getTickets();
    const confirmationCode = generateConfirmationCode();
    const purchaseDetails = [];

    cart.forEach(item => {
        const movie = movies.find(m => m.id === item.showtimeId);
        const quantity = item.quantity;

        movie.ticketsSold = (movie.ticketsSold || 0) + quantity;

        tickets.push({
            confirmationCode,
            showtimeId: movie.id,
            quantity,
            channel: "online",
            timestamp: new Date().toISOString()
        });

        purchaseDetails.push(
            `${movie.title} - ${movie.date} ${movie.time} @ ${movie.location} (Qty: ${quantity})`
        );
    });

    saveMovies(movies);
    saveTickets(tickets);
    saveCart([]);
    loadCart();
    loadMovies(); // Refresh remaining seats / sold-out

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

// ---------- BOX OFFICE FLOW (EMPLOYEE) ----------
function populateBoxOfficeShowtimes() {
    const select = document.getElementById("boxOfficeShowtime");
    if (!select) return;

    const movies = getMovies();
    select.innerHTML = "";

    if (movies.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "No showtimes available";
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
        return;
    }

    movies.forEach(movie => {
        const remaining = movie.capacity - (movie.ticketsSold || 0);
        const opt = document.createElement("option");
        opt.value = movie.id;
        
        let text = `${movie.title} - ${movie.date} ${movie.time} @ ${movie.location} (Remaining: ${remaining})`;
        if (remaining <= 0) {
            text += " [SOLD OUT]";
            opt.disabled = true;
        }
        opt.textContent = text;
        select.appendChild(opt);
    });
}

function processBoxOfficeSale() {
    const select = document.getElementById("boxOfficeShowtime");
    const qtyInput = document.getElementById("boxOfficeQuantity");
    const msg = document.getElementById("boxOfficeMessage");

    if (!select || !qtyInput || !msg) return;

    const showtimeId = parseInt(select.value, 10);
    let quantity = parseInt(qtyInput.value, 10);

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

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);

    if (!movie) {
        msg.textContent = "Showtime not found.";
        msg.style.color = "red";
        return;
    }

    const remaining = movie.capacity - (movie.ticketsSold || 0);
    if (quantity > remaining) {
        msg.textContent = `Only ${remaining} tickets remaining for this showtime.`;
        msg.style.color = "red";
        return;
    }

    const tickets = getTickets();
    const confirmationCode = generateConfirmationCode();

    movie.ticketsSold = (movie.ticketsSold || 0) + quantity;
    tickets.push({
        confirmationCode,
        showtimeId: movie.id,
        quantity,
        channel: "boxOffice",
        timestamp: new Date().toISOString()
    });

    saveMovies(movies);
    saveTickets(tickets);

    msg.textContent = `Sale complete! Confirmation code: ${confirmationCode}`;
    msg.style.color = "green";

    qtyInput.value = "1";

    loadMovies(); // Refresh schedule and box office dropdown
}

// ---------- DELETE MOVIE ----------
function deleteMovie(index) {
    const movies = getMovies();
    const cart = getCart();
    const tickets = getTickets();

    const removedMovie = movies[index];
    if (!removedMovie) return;

    // Remove from movies
    movies.splice(index, 1);
    saveMovies(movies);

    // Remove from cart
    const updatedCart = cart.filter(item => item.showtimeId !== removedMovie.id);
    saveCart(updatedCart);

    // Remove tickets for that showtime
    const updatedTickets = tickets.filter(t => t.showtimeId !== removedMovie.id);
    saveTickets(updatedTickets);

    loadMovies();
}
