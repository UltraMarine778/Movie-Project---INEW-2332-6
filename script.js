const ADMIN_PASSWORD = "TwoKies123";

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");
  const addMovieBtn = document.getElementById("addMovieBtn");

  if (loginBtn) loginBtn.addEventListener("click", checkPassword);
  if (addMovieBtn) addMovieBtn.addEventListener("click", addMovie);

  loadMovies();
});

/* LOGIN */
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

/* STORAGE */
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

/* ADD MOVIE */
function addMovie() {
  const title = document.getElementById("movieTitle").value.trim();
  const description = document.getElementById("movieDescription").value.trim();
  const genre = document.getElementById("movieGenre").value.trim();
  const runtime = document.getElementById("movieRuntime").value.trim();
  const time = document.getElementById("movieTime").value.trim();
  const date = document.getElementById("movieDate").value;
  const location = document.getElementById("movieLocation").value;

  const msg = document.getElementById("adminMessage");

  if (!title || !description || !genre || !runtime || !time || !date || !location) {
    msg.textContent = "Please fill all fields.";
    msg.style.color = "red";
    return;
  }

  const movies = getMovies();

  movies.push({
    title,
    description,
    genre,
    runtime,
    time,
    date,
    location
  });

  saveMovies(movies);

  // Clear inputs
  document.getElementById("movieTitle").value = "";
  document.getElementById("movieDescription").value = "";
  document.getElementById("movieGenre").value = "";
  document.getElementById("movieRuntime").value = "";
  document.getElementById("movieTime").value = "";
  document.getElementById("movieDate").value = "";

  msg.textContent = "Movie added!";
  msg.style.color = "green";

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

  if (scheduleList) displaySchedule(movies);

  loadCart();
}

/* DISPLAY SCHEDULE WITH EXPANDABLE DETAILS */
function displaySchedule(movies) {
  const list = document.getElementById("scheduleList");
  if (!list) return;

  list.innerHTML = "";

  if (movies.length === 0) {
    list.innerHTML = "<li>No movies scheduled.</li>";
    return;
  }

  movies.forEach((movie, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div style="width:100%">
        <strong>${movie.title}</strong><br>
        ${movie.time} - ${movie.date} - ${movie.location}

        <div id="details-${index}" class="movie-details" style="display:none;">
          <p><strong>Genre:</strong> ${movie.genre}</p>
          <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
          <p><strong>Description:</strong> ${movie.description}</p>
        </div>
      </div>

      <div>
        <button onclick="toggleDetails(${index}, this)">View Details</button>
        <button onclick="addToCart(${index})">Add Ticket</button>
      </div>
    `;

    list.appendChild(li);
  });
}

/* TOGGLE DETAILS */
function toggleDetails(index, btn) {
  const details = document.getElementById(`details-${index}`);

  if (details.style.display === "none") {
    details.style.display = "block";
    btn.textContent = "Hide Details";
  } else {
    details.style.display = "none";
    btn.textContent = "View Details";
  }
}

/* FILTERS */
function applyFilters() {
  const date = document.getElementById("filterDate").value;
  const location = document.getElementById("filterLocation").value;

  let movies = getMovies();

  if (date) movies = movies.filter(m => m.date === date);
  if (location) movies = movies.filter(m => m.location === location);

  displaySchedule(movies);
}

/* CART */
function addToCart(index) {
  const movies = getMovies();
  const cart = getCart();

  cart.push(movies[index]);
  saveCart(cart);

  loadCart();
  alert("Ticket added!");
}

function loadCart() {
  const list = document.getElementById("cartList");
  if (!list) return;

  const cart = getCart();
  list.innerHTML = "";

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.title} - ${item.time} - ${item.location}`;
    list.appendChild(li);
  });
}

/* DELETE MOVIE + REMOVE FROM CART */
function deleteMovie(index) {
  const movies = getMovies();
  const cart = getCart();

  const removedMovie = movies[index];

  // Remove from schedule
  movies.splice(index, 1);
  saveMovies(movies);

  // Remove from cart
  const updatedCart = cart.filter(item =>
    !(item.title === removedMovie.title &&
      item.time === removedMovie.time &&
      item.date === removedMovie.date &&
      item.location === removedMovie.location)
  );

  saveCart(updatedCart);

  loadMovies();
}
