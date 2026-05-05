const ADMIN_PASSWORD = "TwoKies123";
const TICKET_PRICE = 12.00;
const TAX_RATE = 0.0825;
const LOW_STOCK_LIMIT = 5;

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const addMovieBtn = document.getElementById("addMovieBtn");
    const boxOfficeSellBtn = document.getElementById("boxOfficeSellBtn");

    if (loginBtn) loginBtn.addEventListener("click", checkPassword);
    if (addMovieBtn) addMovieBtn.addEventListener("click", addMovie);
    if (boxOfficeSellBtn) boxOfficeSellBtn.addEventListener("click", processBoxOfficeSale);

    seedConcessions();
    loadMovies();
    loadConcessions();
    loadEmployees();
    loadEmployeeSchedules();
    loadSalesReport();
});

function checkPassword() {
    const input = document.getElementById("adminPassword").value;
    const msg = document.getElementById("loginMessage");

    if (input === ADMIN_PASSWORD) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadMovies();
        loadConcessions();
        loadEmployees();
        loadEmployeeSchedules();
        loadSalesReport();
    } else {
        msg.textContent = "Incorrect password.";
        msg.style.color = "red";
    }
}

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

function getSales() {
    return JSON.parse(localStorage.getItem("sales")) || [];
}

function saveSales(sales) {
    localStorage.setItem("sales", JSON.stringify(sales));
}

function getConcessions() {
    return JSON.parse(localStorage.getItem("concessions")) || [];
}

function saveConcessions(items) {
    localStorage.setItem("concessions", JSON.stringify(items));
}

function getEmployees() {
    return JSON.parse(localStorage.getItem("employees")) || [];
}

function saveEmployees(data) {
    localStorage.setItem("employees", JSON.stringify(data));
}

function getSchedules() {
    return JSON.parse(localStorage.getItem("employeeSchedules")) || [];
}

function saveSchedules(data) {
    localStorage.setItem("employeeSchedules", JSON.stringify(data));
}

function generateConfirmationCode() {
    return "TK-" + Date.now().toString(36).toUpperCase();
}

function money(amount) {
    return "$" + amount.toFixed(2);
}

function seedConcessions() {
    const existing = getConcessions();

    if (existing.length > 0) return;

    const starterItems = [
        { id: Date.now() + 1, name: "Small Popcorn", category: "Popcorn", price: 5.99, stock: 25, active: true },
        { id: Date.now() + 2, name: "Medium Popcorn", category: "Popcorn", price: 7.99, stock: 25, active: true },
        { id: Date.now() + 3, name: "Large Popcorn", category: "Popcorn", price: 9.99, stock: 25, active: true },
        { id: Date.now() + 4, name: "Small Drink", category: "Drinks", price: 3.99, stock: 30, active: true },
        { id: Date.now() + 5, name: "Medium Drink", category: "Drinks", price: 4.99, stock: 30, active: true },
        { id: Date.now() + 6, name: "Large Drink", category: "Drinks", price: 5.99, stock: 30, active: true },
        { id: Date.now() + 7, name: "Mozzarella Sticks", category: "Food", price: 8.99, stock: 15, active: true },
        { id: Date.now() + 8, name: "Chicken Tenders", category: "Food", price: 10.99, stock: 15, active: true },
        { id: Date.now() + 9, name: "Buffalo Wings", category: "Food", price: 11.99, stock: 15, active: true },
        { id: Date.now() + 10, name: "Pepperoni Pizza", category: "Pizza", price: 12.99, stock: 10, active: true },
        { id: Date.now() + 11, name: "Cheese Pizza", category: "Pizza", price: 11.99, stock: 10, active: true },
        { id: Date.now() + 12, name: "Skittles", category: "Candy", price: 4.49, stock: 20, active: true }
    ];

    saveConcessions(starterItems);
}

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

    movies.push({
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
    });

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

function loadMovies() {
    const movieList = document.getElementById("movieList");
    const scheduleList = document.getElementById("scheduleList");
    const movies = getMovies();

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

    if (scheduleList) {
        displaySchedule(movies);
    }

    loadCart();
    loadCustomerConcessions();
    populateBoxOfficeShowtimes();
    populateShiftShowtimes();
}

function displaySchedule(movies) {
    const list = document.getElementById("scheduleList");
    if (!list) return;

    list.innerHTML = "";

    if (movies.length === 0) {
        list.innerHTML = "<li>No movies scheduled.</li>";
        return;
    }

    movies.forEach(movie => {
        const remaining = movie.capacity - (movie.ticketsSold || 0);
        const soldOut = remaining <= 0;

        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${movie.title}</strong><br>
                ${movie.time} - ${movie.date} - ${movie.location}
                ${soldOut ? '<span class="sold-out">Sold Out</span>' : ''}
                <div id="details-${movie.id}" class="movie-details" style="display:none;">
                    <p><strong>Genre:</strong> ${movie.genre}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                    <p><strong>Description:</strong> ${movie.description}</p>
                    <p><strong>Remaining Seats:</strong> ${remaining}</p>
                    <p><strong>Ticket Price:</strong> ${money(TICKET_PRICE)}</p>
                </div>
            </div>
            <div>
                <button onclick="toggleDetails(${movie.id}, this)">View Details</button><br><br>
                <label>Qty</label>
                <select id="qty-${movie.id}" ${soldOut ? "disabled" : ""}>
                    ${buildQuantityOptions(Math.min(remaining, 30))}
                </select>
                <button onclick="addTicketToCart(${movie.id})" ${soldOut ? "disabled" : ""}>Add Ticket</button>
            </div>
        `;

        list.appendChild(li);
    });
}

function buildQuantityOptions(max) {
    let html = "";

    for (let i = 1; i <= max; i++) {
        html += `<option value="${i}">${i}</option>`;
    }

    return html;
}

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

function applyFilters() {
    const date = document.getElementById("filterDate").value;
    const location = document.getElementById("filterLocation").value;

    let movies = getMovies();

    if (date) movies = movies.filter(m => m.date === date);
    if (location) movies = movies.filter(m => m.location === location);

    displaySchedule(movies);
}

function addTicketToCart(showtimeId) {
    const qtyInput = document.getElementById(`qty-${showtimeId}`);
    let quantity = parseInt(qtyInput.value, 10);

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);

    if (!movie) {
        alert("Showtime not found.");
        return;
    }

    const remaining = movie.capacity - (movie.ticketsSold || 0);
    const cart = getCart();

    const existing = cart.find(item => item.type === "ticket" && item.showtimeId === showtimeId);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (quantity + alreadyInCart > remaining) {
        alert(`Only ${remaining - alreadyInCart} more tickets can be added.`);
        return;
    }

    if (quantity > 20) {
        const confirmLargeOrder = confirm("You are ordering more than 20 tickets. Do you want to continue?");
        if (!confirmLargeOrder) return;
    }

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            type: "ticket",
            showtimeId,
            title: movie.title,
            date: movie.date,
            time: movie.time,
            location: movie.location,
            quantity,
            price: TICKET_PRICE
        });
    }

    saveCart(cart);
    loadCart();
}

function loadCustomerConcessions() {
    const list = document.getElementById("customerConcessionList");
    if (!list) return;

    const concessions = getConcessions().filter(item => item.active);
    list.innerHTML = "";

    if (concessions.length === 0) {
        list.innerHTML = "<li>No concessions available.</li>";
        return;
    }

    concessions.forEach(item => {
        const disabled = item.stock <= 0;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.category} - ${money(item.price)}<br>
                Stock: ${item.stock}
            </div>
            <div>
                <label>Qty</label>
                <select id="conQty-${item.id}" ${disabled ? "disabled" : ""}>
                    ${buildQuantityOptions(Math.min(item.stock, 20))}
                </select>
                <button onclick="addConcessionToCart(${item.id})" ${disabled ? "disabled" : ""}>
                    Add
                </button>
            </div>
        `;

        list.appendChild(li);
    });
}

function addConcessionToCart(id) {
    const qtySelect = document.getElementById(`conQty-${id}`);
    const quantity = parseInt(qtySelect.value, 10);

    const concessions = getConcessions();
    const item = concessions.find(c => c.id === id);

    if (!item) return;

    if (quantity > item.stock) {
        alert("Not enough stock.");
        return;
    }

    const cart = getCart();
    const existing = cart.find(c => c.type === "concession" && c.id === id);

    if (existing) {
        if (existing.quantity + quantity > item.stock) {
            alert("Not enough stock.");
            return;
        }

        existing.quantity += quantity;
    } else {
        cart.push({
            type: "concession",
            id: item.id,
            name: item.name,
            price: item.price,
            quantity
        });
    }

    saveCart(cart);
    loadCart();
}

function loadCart() {
    const list = document.getElementById("cartList");
    if (!list) return;

    const cart = getCart();
    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = "<li>Your cart is empty.</li>";
        updateTotals();
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");

        if (item.type === "ticket") {
            li.innerHTML = `
                <div>
                    <strong>Ticket:</strong> ${item.title}<br>
                    ${item.date} ${item.time} @ ${item.location}<br>
                    Qty: ${item.quantity} | ${money(item.price * item.quantity)}
                </div>
                <button onclick="removeCartItem(${index})">Remove</button>
            `;
        } else {
            li.innerHTML = `
                <div>
                    <strong>Concession:</strong> ${item.name}<br>
                    Qty: ${item.quantity} | ${money(item.price * item.quantity)}
                </div>
                <button onclick="removeCartItem(${index})">Remove</button>
            `;
        }

        list.appendChild(li);
    });

    updateTotals();
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCart();
}

function updateTotals() {
    const cart = getCart();

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const subEl = document.getElementById("subtotalAmount");
    const taxEl = document.getElementById("taxAmount");
    const totalEl = document.getElementById("totalAmount");

    if (subEl) subEl.textContent = money(subtotal);
    if (taxEl) taxEl.textContent = money(tax);
    if (totalEl) totalEl.textContent = money(total);
}

function checkout() {
    const cart = getCart();
    const confirmationDiv = document.getElementById("purchaseConfirmation");

    if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const movies = getMovies();
    const concessions = getConcessions();
    const sales = getSales();
    const confirmationCode = generateConfirmationCode();

    for (const item of cart) {
        if (item.type === "ticket") {
            const movie = movies.find(m => m.id === item.showtimeId);

            if (!movie) {
                alert("A showtime no longer exists.");
                return;
            }

            const remaining = movie.capacity - (movie.ticketsSold || 0);

            if (item.quantity > remaining) {
                alert(`Not enough seats left for ${movie.title}.`);
                return;
            }
        }

        if (item.type === "concession") {
            const con = concessions.find(c => c.id === item.id);

            if (!con || item.quantity > con.stock) {
                alert(`Not enough stock for ${item.name}.`);
                return;
            }
        }
    }

    cart.forEach(item => {
        if (item.type === "ticket") {
            const movie = movies.find(m => m.id === item.showtimeId);
            movie.ticketsSold += item.quantity;

            sales.push({
                id: Date.now() + Math.random(),
                type: "ticket",
                name: movie.title,
                quantity: item.quantity,
                amount: item.quantity * item.price,
                channel: "online",
                confirmationCode,
                timestamp: new Date().toISOString()
            });
        }

        if (item.type === "concession") {
            const con = concessions.find(c => c.id === item.id);
            con.stock -= item.quantity;

            sales.push({
                id: Date.now() + Math.random(),
                type: "concession",
                name: item.name,
                quantity: item.quantity,
                amount: item.quantity * item.price,
                channel: "online",
                confirmationCode,
                timestamp: new Date().toISOString()
            });
        }
    });

    saveMovies(movies);
    saveConcessions(concessions);
    saveSales(sales);
    saveCart([]);

    loadMovies();
    loadConcessions();
    loadCart();

    if (confirmationDiv) {
        confirmationDiv.innerHTML = `
            <h4>Purchase Complete!</h4>
            <p>Your confirmation code:</p>
            <p><strong>${confirmationCode}</strong></p>
            <p>Show this code at the theater.</p>
        `;
    }
}

function populateBoxOfficeShowtimes() {
    const select = document.getElementById("boxOfficeShowtime");
    if (!select) return;

    const movies = getMovies();
    select.innerHTML = "";

    movies.forEach(movie => {
        const remaining = movie.capacity - movie.ticketsSold;
        const opt = document.createElement("option");

        opt.value = movie.id;
        opt.textContent = `${movie.title} - ${movie.date} ${movie.time} @ ${movie.location} (${remaining} left)`;

        if (remaining <= 0) opt.disabled = true;

        select.appendChild(opt);
    });
}

function processBoxOfficeSale() {
    const select = document.getElementById("boxOfficeShowtime");
    const qtyInput = document.getElementById("boxOfficeQuantity");
    const msg = document.getElementById("boxOfficeMessage");

    const showtimeId = parseInt(select.value, 10);
    const quantity = parseInt(qtyInput.value, 10);

    const movies = getMovies();
    const movie = movies.find(m => m.id === showtimeId);

    if (!movie) {
        msg.textContent = "Showtime not found.";
        msg.style.color = "red";
        return;
    }

    const remaining = movie.capacity - movie.ticketsSold;

    if (quantity > remaining) {
        msg.textContent = `Only ${remaining} tickets left.`;
        msg.style.color = "red";
        return;
    }

    movie.ticketsSold += quantity;

    const sales = getSales();

    sales.push({
        id: Date.now(),
        type: "ticket",
        name: movie.title,
        quantity,
        amount: quantity * TICKET_PRICE,
        channel: "boxOffice",
        confirmationCode: generateConfirmationCode(),
        timestamp: new Date().toISOString()
    });

    saveMovies(movies);
    saveSales(sales);

    msg.textContent = "Ticket sale complete.";
    msg.style.color = "green";

    qtyInput.value = "1";

    loadMovies();
    loadSalesReport();
}

function addConcession() {
    const name = document.getElementById("conName").value.trim();
    const category = document.getElementById("conCategory").value.trim();
    const price = parseFloat(document.getElementById("conPrice").value);
    const stock = parseInt(document.getElementById("conStock").value, 10);

    if (!name || !category || isNaN(price) || isNaN(stock)) {
        alert("Please fill out all concession fields.");
        return;
    }

    const concessions = getConcessions();

    concessions.push({
        id: Date.now(),
        name,
        category,
        price,
        stock,
        active: true
    });

    saveConcessions(concessions);

    document.getElementById("conName").value = "";
    document.getElementById("conCategory").value = "";
    document.getElementById("conPrice").value = "";
    document.getElementById("conStock").value = "";

    loadConcessions();
}

function loadConcessions() {
    const list = document.getElementById("concessionList");
    const lowList = document.getElementById("lowStockList");
    const posSelect = document.getElementById("posItem");

    const concessions = getConcessions();

    if (list) {
        list.innerHTML = "";

        concessions.forEach(item => {
            const li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    Category: ${item.category}<br>
                    Price: ${money(item.price)}<br>
                    Stock: ${item.stock}<br>
                    Status: ${item.active ? "Active" : "Inactive"}
                </div>
                <button onclick="toggleConcessionStatus(${item.id})">
                    ${item.active ? "Deactivate" : "Activate"}
                </button>
            `;

            list.appendChild(li);
        });
    }

    if (lowList) {
        lowList.innerHTML = "";

        const lowItems = concessions.filter(item => item.stock <= LOW_STOCK_LIMIT);

        if (lowItems.length === 0) {
            lowList.innerHTML = "<li>No low stock alerts.</li>";
        } else {
            lowItems.forEach(item => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${item.name}</strong> is low stock. Current stock: ${item.stock}`;
                lowList.appendChild(li);
            });
        }
    }

    if (posSelect) {
        posSelect.innerHTML = "";

        concessions.filter(c => c.active).forEach(item => {
            const opt = document.createElement("option");
            opt.value = item.id;
            opt.textContent = `${item.name} - ${money(item.price)} - Stock: ${item.stock}`;
            posSelect.appendChild(opt);
        });
    }

    loadCustomerConcessions();
}

function toggleConcessionStatus(id) {
    const concessions = getConcessions();
    const item = concessions.find(c => c.id === id);

    if (!item) return;

    item.active = !item.active;

    saveConcessions(concessions);
    loadConcessions();
}

function processConcessionPOS() {
    const select = document.getElementById("posItem");
    const qtyInput = document.getElementById("posQuantity");
    const msg = document.getElementById("posMessage");

    const id = parseInt(select.value, 10);
    const quantity = parseInt(qtyInput.value, 10);

    const concessions = getConcessions();
    const item = concessions.find(c => c.id === id);

    if (!item) {
        msg.textContent = "Item not found.";
        msg.style.color = "red";
        return;
    }

    if (quantity > item.stock) {
        msg.textContent = "Not enough stock.";
        msg.style.color = "red";
        return;
    }

    item.stock -= quantity;

    const sales = getSales();

    sales.push({
        id: Date.now(),
        type: "concession",
        name: item.name,
        quantity,
        amount: quantity * item.price,
        channel: "POS",
        timestamp: new Date().toISOString()
    });

    saveConcessions(concessions);
    saveSales(sales);

    msg.textContent = "Concession sale complete.";
    msg.style.color = "green";

    qtyInput.value = "1";

    loadConcessions();
    loadSalesReport();
}

function addEmployee() {
    const name = document.getElementById("empName").value.trim();
    const contact = document.getElementById("empContact").value.trim();
    const role = document.getElementById("empRole").value.trim();
    const hireDate = document.getElementById("empHireDate").value;
    const pay = parseFloat(document.getElementById("empPay").value);
    const theater = document.getElementById("empTheater").value;

    if (!name || !contact || !role || !hireDate || isNaN(pay)) {
        alert("Please fill out all employee fields.");
        return;
    }

    const employees = getEmployees();

    employees.push({
        id: Date.now(),
        name,
        contact,
        role,
        hireDate,
        pay,
        theater,
        active: true
    });

    saveEmployees(employees);

    document.getElementById("empName").value = "";
    document.getElementById("empContact").value = "";
    document.getElementById("empRole").value = "";
    document.getElementById("empHireDate").value = "";
    document.getElementById("empPay").value = "";

    loadEmployees();
}

function loadEmployees() {
    const list = document.getElementById("employeeList");
    const select = document.getElementById("shiftEmployee");

    const employees = getEmployees();

    if (list) {
        list.innerHTML = "";

        if (employees.length === 0) {
            list.innerHTML = "<li>No employees added.</li>";
        } else {
            employees.forEach(emp => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <div>
                        <strong>${emp.name}</strong><br>
                        Contact: ${emp.contact}<br>
                        Role: ${emp.role}<br>
                        Hire Date: ${emp.hireDate}<br>
                        Pay: ${money(emp.pay)}<br>
                        Theater: ${emp.theater}<br>
                        Status: ${emp.active ? "Active" : "Inactive"}
                    </div>
                    <button onclick="toggleEmployeeStatus(${emp.id})">
                        ${emp.active ? "Deactivate" : "Activate"}
                    </button>
                `;

                list.appendChild(li);
            });
        }
    }

    if (select) {
        select.innerHTML = "";

        employees.filter(e => e.active).forEach(emp => {
            const opt = document.createElement("option");
            opt.value = emp.id;
            opt.textContent = `${emp.name} - ${emp.role}`;
            select.appendChild(opt);
        });
    }
}

function toggleEmployeeStatus(id) {
    const employees = getEmployees();
    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    emp.active = !emp.active;

    saveEmployees(employees);
    loadEmployees();
}

function populateShiftShowtimes() {
    const select = document.getElementById("shiftShowtime");
    if (!select) return;

    const movies = getMovies();

    select.innerHTML = "<option value=''>No showtime selected</option>";

    movies.forEach(movie => {
        const opt = document.createElement("option");
        opt.value = movie.id;
        opt.textContent = `${movie.title} - ${movie.date} ${movie.time} @ ${movie.location}`;
        select.appendChild(opt);
    });
}

function addShift() {
    const empId = parseInt(document.getElementById("shiftEmployee").value, 10);
    const date = document.getElementById("shiftDate").value;
    const start = document.getElementById("shiftStart").value;
    const end = document.getElementById("shiftEnd").value;
    const position = document.getElementById("shiftPosition").value;
    const showtimeId = document.getElementById("shiftShowtime").value;
    const msg = document.getElementById("shiftMessage");

    if (!empId || !date || !start || !end || !position) {
        msg.textContent = "Please fill out all shift fields.";
        msg.style.color = "red";
        return;
    }

    if (end <= start) {
        msg.textContent = "End time must be after start time.";
        msg.style.color = "red";
        return;
    }

    const schedules = getSchedules();

    const conflict = schedules.find(s =>
        s.empId === empId &&
        s.date === date &&
        !(end <= s.start || start >= s.end)
    );

    if (conflict) {
        msg.textContent = "Schedule conflict. This employee already has a shift during that time.";
        msg.style.color = "red";
        return;
    }

    schedules.push({
        id: Date.now(),
        empId,
        date,
        start,
        end,
        position,
        showtimeId
    });

    saveSchedules(schedules);

    msg.textContent = "Shift added.";
    msg.style.color = "green";

    loadEmployeeSchedules();
}

function loadEmployeeSchedules() {
    const list = document.getElementById("scheduleEmployeeList");
    if (!list) return;

    const schedules = getSchedules();
    const employees = getEmployees();
    const movies = getMovies();

    list.innerHTML = "";

    if (schedules.length === 0) {
        list.innerHTML = "<li>No employee shifts scheduled.</li>";
        return;
    }

    schedules.forEach(shift => {
        const emp = employees.find(e => e.id === shift.empId);
        const movie = movies.find(m => String(m.id) === String(shift.showtimeId));

        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${emp ? emp.name : "Unknown Employee"}</strong><br>
                Date: ${shift.date}<br>
                Time: ${shift.start} - ${shift.end}<br>
                Position: ${shift.position}<br>
                Showtime: ${movie ? movie.title + " at " + movie.time : "Not linked"}
            </div>
            <button onclick="deleteShift(${shift.id})">Delete</button>
        `;

        list.appendChild(li);
    });
}

function deleteShift(id) {
    const schedules = getSchedules().filter(s => s.id !== id);
    saveSchedules(schedules);
    loadEmployeeSchedules();
}

function loadSalesReport() {
    const ticketEl = document.getElementById("ticketSalesTotal");
    const concessionEl = document.getElementById("concessionSalesTotal");
    const allEl = document.getElementById("allSalesTotal");

    if (!ticketEl || !concessionEl || !allEl) return;

    const sales = getSales();

    const ticketTotal = sales
        .filter(s => s.type === "ticket")
        .reduce((sum, s) => sum + s.amount, 0);

    const concessionTotal = sales
        .filter(s => s.type === "concession")
        .reduce((sum, s) => sum + s.amount, 0);

    ticketEl.textContent = money(ticketTotal);
    concessionEl.textContent = money(concessionTotal);
    allEl.textContent = money(ticketTotal + concessionTotal);
}

function deleteMovie(index) {
    const movies = getMovies();
    const removedMovie = movies[index];

    if (!removedMovie) return;

    movies.splice(index, 1);
    saveMovies(movies);

    const cart = getCart().filter(item => item.showtimeId !== removedMovie.id);
    saveCart(cart);

    loadMovies();
}
