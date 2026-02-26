// Change this password if you want
const ADMIN_PASSWORD = "TwoKies123";

// LOGIN FUNCTION
function checkPassword() {
    const passwordInput = document.getElementById("adminPassword").value;
    const message = document.getElementById("loginMessage");

    if (passwordInput === ADMIN_PASSWORD) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadMovies();
    } else {
        message.textContent = "Incorrect password.";
        message.style.color = "red";
    }
}

// STORE MOVIES IN LOCAL STORAGE
function getMovies() {
    return JSON.parse(localStorage.getItem("movies")) || [];
}

function saveMovies(movies) {
    localStorage.setItem("movies", JSON.stringify(movies));
}

// ADD MOVIE
function addMovie() {
    const title = document.getElementById("movieTitle").value;
    const time = document.getElementById("movieTime").value;

    if (title === "" || time === "") {
        alert("Please fill in all fields.");
        return;
    }

    const movies = getMovies();
    movies.push({ title, time });
    saveMovies(movies);

    document.getElementById("movieTitle").value = "";
    document.getElementById("movieTime").value = "";

    loadMovies();
}

// LOAD MOVIES INTO ADMIN PANEL
function loadMovies() {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = "";

    const movies = getMovies();

    movies.forEach((movie, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${movie.title} - ${movie.time}
            <button onclick="deleteMovie(${index})">Delete</button>`;
        movieList.appendChild(li);
    });
}

// DELETE MOVIE
function deleteMovie(index) {
    const movies = getMovies();
    movies.splice(index, 1);
    saveMovies(movies);
    loadMovies();
}

// DISPLAY MOVIES ON CUSTOMER PAGE
function displayMovies() {
    const scheduleList = document.getElementById("scheduleList");
    if (!scheduleList) return;

    const movies = getMovies();
    scheduleList.innerHTML = "";

    if (movies.length === 0) {
        scheduleList.innerHTML = "<li>No movies scheduled yet.</li>";
        return;
    }

    movies.forEach(movie => {
        const li = document.createElement("li");
        li.textContent = `${movie.title} - ${movie.time}`;
        scheduleList.appendChild(li);
    });
}
