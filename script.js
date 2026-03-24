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

/* DISPLAY SCHEDULE */
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
      <div>
        <strong>${movie.title}</strong><br>
        ${movie.time} - ${movie.date} - ${movie.location}
      </div>
      <div>
        <button onclick="showDetails(${index})">View Details</button>
        <button onclick="addToCart(${index})">Add Ticket</button>
      </div>
    `;

    list.appendChild(li);
  });
}

/* VIEW DETAILS */
function showDetails(index) {
  const movie = getMovies()[index];

  alert(
`Title: ${movie.title}
Genre: ${movie.genre}
Runtime: ${movie.runtime} minutes
Description: ${movie.description}`
  );
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

/* DELETE */
function deleteMovie(index) {
  const movies = getMovies();
  movies.splice(index, 1);
  saveMovies(movies);
  loadMovies();
}
