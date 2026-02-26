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

  // Load movies whenever the script is present (schedule + admin pages)
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

/* ADD MOVIE */
function addMovie() {
  const titleInput = document.getElementById("movieTitle");
  const timeInput = document.getElementById("movieTime");
  const msg = document.getElementById("adminMessage");

  const title = titleInput.value.trim();
  const time = timeInput.value.trim();

  if (!title || !time) {
    if (msg) {
      msg.textContent = "Please enter both fields.";
      msg.style.color = "red";
    }
    return;
  }

  const movies = getMovies();
  movies.push({ title, time });
  saveMovies(movies);

  // Clear form fields
  titleInput.value = "";
  timeInput.value = "";

  if (msg) {
    msg.textContent = "Movie added successfully!";
    msg.style.color = "green";
  }

  loadMovies();
}

/* LOAD MOVIES (ADMIN + SCHEDULE PAGE) */
function loadMovies() {
  const movieList = document.getElementById("movieList");
  const scheduleList = document.getElementById("scheduleList");
  const movies = getMovies();

  // Admin page list with delete buttons
  if (movieList) {
    movieList.innerHTML = "";
    movies.forEach((movie, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${movie.title} - ${movie.time}</span>
        <button onclick="deleteMovie(${index})">Delete</button>
      `;
      movieList.appendChild(li);
    });
  }

  // Schedule page list
  if (scheduleList) {
    scheduleList.innerHTML = "";

    if (movies.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No movies scheduled.";
      scheduleList.appendChild(li);
      return;
    }

    movies.forEach(movie => {
      const li = document.createElement("li");
      li.textContent = `${movie.title} - ${movie.time}`;
      scheduleList.appendChild(li);
    });
  }
}

/* DELETE MOVIE */
function deleteMovie(index) {
  const movies = getMovies();
  movies.splice(index, 1);
  saveMovies(movies);
  loadMovies();
}
``
