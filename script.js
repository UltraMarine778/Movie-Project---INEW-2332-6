const ADMIN_PASSWORD = "TwoKies123";

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");
  const addMovieBtn = document.getElementById("addMovieBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", checkPassword);
  }

  if (addMovieBtn) {
    addMovieBtn.addEventListener("click", addMovie);
  }

  loadMovies();
});

/* LOGIN FUNCTION */
function checkPassword() {
  const passwordInput = document.getElementById("adminPassword").value;
  const message = document.getElementById("loginMessage");

  if (passwordInput === ADMIN_PASSWORD) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    message.textContent = "Incorrect password.";
    message.style.color = "red";
  }
}

/* STORAGE FUNCTIONS */

function getMovies() {
  return JSON.parse(localStorage.getItem("movies")) || [];
}

function saveMovies(movies) {
  localStorage.setItem("movies", JSON.stringify(movies));
}

/* ADDED CART STORAGE */

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ADD MOVIE */

function addMovie() {

  const titleInput = document.getElementById("movieTitle");
  const timeInput = document.getElementById("movieTime");

  /* ADDED DATE + LOCATION INPUTS */


  const dateInput = document.getElementById("movieDate");
  const locationInput = document.getElementById("movieLocation");

  const msg = document.getElementById("adminMessage");

  const title = titleInput.value.trim();
  const time = timeInput.value.trim();
  const date = dateInput.value;
  const location = locationInput.value;

  if (!title || !time || !date || !location) {

    if (msg) {
      msg.textContent = "Please fill all fields.";
      msg.style.color = "red";
    }

    return;
  }

  const movies = getMovies();

  movies.push({
    title,
    time,
    date,
    location
  });

  saveMovies(movies);

  titleInput.value = "";
  timeInput.value = "";
  dateInput.value = "";

  if (msg) {
    msg.textContent = "Movie added successfully!";
    msg.style.color = "green";
  }

  loadMovies();
}

/* LOAD MOVIES */

function loadMovies() {

  const movieList = document.getElementById("movieList");
  const scheduleList = document.getElementById("scheduleList");
  const movies = getMovies();

  if (movieList) {

    movieList.innerHTML = "";

    movies.forEach((movie, index) => {

      const li = document.createElement("li");

      li.innerHTML = `
        <span>${movie.title} - ${movie.time} - ${movie.date} - ${movie.location}</span>
        <button onclick="deleteMovie(${index})">Delete</button>
      `;

      movieList.appendChild(li);

    });

  }

  if (scheduleList) {

    displaySchedule(movies);

  }

  loadCart();
}

/* NEW FUNCTION FOR DISPLAY */
function displaySchedule(movies) {

  const scheduleList = document.getElementById("scheduleList");

  if (!scheduleList) return;

  scheduleList.innerHTML = "";

  if (movies.length === 0) {

    const li = document.createElement("li");
    li.textContent = "No movies scheduled.";
    scheduleList.appendChild(li);

    return;
  }

  movies.forEach((movie, index) => {

    const li = document.createElement("li");

    li.innerHTML = `
      ${movie.title} - ${movie.time} - ${movie.date} - ${movie.location}
      <button onclick="addToCart(${index})">Add Ticket</button>
    `;

    scheduleList.appendChild(li);

  });

}

/* FILTER FEATURE */

function applyFilters() {

  const dateFilter = document.getElementById("filterDate").value;
  const locationFilter = document.getElementById("filterLocation").value;

  let movies = getMovies();

  if (dateFilter) {

    movies = movies.filter(movie => movie.date === dateFilter);

  }

  if (locationFilter) {

    movies = movies.filter(movie => movie.location === locationFilter);

  }

  displaySchedule(movies);

}

/* CART FUNCTIONS */

function addToCart(index) {

  const movies = getMovies();
  const cart = getCart();

  cart.push(movies[index]);

  saveCart(cart);

  loadCart();

  alert("Ticket added to cart!");

}

function loadCart() {

  const cartList = document.getElementById("cartList");

  if (!cartList) return;

  const cart = getCart();

  cartList.innerHTML = "";

  cart.forEach(item => {

    const li = document.createElement("li");

    li.textContent = `${item.title} - ${item.time} - ${item.location}`;

    cartList.appendChild(li);

  });

}

/* DELETE MOVIE */

function deleteMovie(index) {

  const movies = getMovies();

  movies.splice(index, 1);

  saveMovies(movies);

  loadMovies();

}
