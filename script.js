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

/* ADD MOVIE */
function addMovie() {
    const title = document.getElementById("movieTitle").value;
    const time = document.getElementById("movieTime").value;

    if (!title || !time) {
        alert("Please enter both fields.");
        return;
    }

    const movies = getMovies();
    movies.push({ title, time });
    saveMovies(movies);

    document.getElementById("movieTitle").value = "";
    document.getElementById("movieTime").value = "";

    loadMovies();
}

/* LOAD MOVIES (ADMIN + SCHEDULE PAGE) */
function loadMovies() {
    const movieList = document.getElementById("movieList");
    const scheduleList = document.getElementById("scheduleList");

    const movies = getMovies();

    if (movieList) {
        movieList.innerHTML = "";
        movies.forEach((movie, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${movie.title} - ${movie.time}
                <button onclick="deleteMovie(${index})">Delete</button>`;
            movieList.appendChild(li);
        });
    }

    if (scheduleList) {
        scheduleList.innerHTML = "";
        if (movies.length === 0) {
            scheduleList.innerHTML = "<li>No movies scheduled.</li>";
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
