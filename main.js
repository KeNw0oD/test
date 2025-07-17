// === СПАРКИ ===
const container = document.querySelector('.particles-container');
const count = 40;

for (let i = 0; i < count; i++) {
  const spark = document.createElement('span');
  spark.style.left = Math.random() * 100 + 'vw';
  spark.style.animationDuration = (3 + Math.random() * 2) + 's';
  spark.style.animationDelay = Math.random() * 10 + 's';
  spark.style.opacity = 0.3 + Math.random() * 0.4;
  spark.style.background = 'rgba(90, 103, 216, 0.7)';
  spark.style.width = spark.style.height = (Math.random() * 3 + 2) + 'px';
  container.appendChild(spark);
}

// === МОДАЛКА ===
function openModal() {
  document.getElementById("registerModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("registerModal").style.display = "none";
}
window.onclick = function(event) {
  const modal = document.getElementById("registerModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// === РЕГИСТРАЦИЯ ===
function handleRegister(e) {
  e.preventDefault();
  const nickname = document.getElementById("nicknameInput").value.trim();
  if (nickname) {
    localStorage.setItem("loggedInUser", nickname);
    location.reload();
  }
}

// === ПРОФИЛЬ ===
function logout() {
  localStorage.removeItem("loggedInUser");
  location.reload();
}

window.onload = function () {
  const user = localStorage.getItem("loggedInUser");

    if (user) {
      document.getElementById("profileBlock").style.display = "flex";
      document.getElementById("registerBtn").style.display = "none";
      document.getElementById("leaderboardBtn").style.display = "inline-block";
      document.getElementById("authButtons").style.justifyContent = "center";
      document.getElementById("nickname").textContent = user;

    // Центровка кнопок (если нужно)
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("leaderboardBtn").style.display = "inline-block";

    fetch("https://raw.githubusercontent.com/KeNw0oD/shuffle-wagers-data/refs/heads/main/wagers.json")
      .then(res => res.json())
      .then(data => {
        data.sort((a, b) => {
          const aVal = parseFloat((a.wager || "0").replace(/[$,]/g, ""));
          const bVal = parseFloat((b.wager || "0").replace(/[$,]/g, ""));
          return bVal - aVal;
        });

        for (let i = 0; i < data.length; i++) {
          const entry = data[i];
          if (entry.user === user) {
            document.getElementById("userRank").textContent = `Position:  #${i + 1}`;
            document.getElementById("userWager").textContent = `Wager:  ${entry.wager}`;
            break;
          }
        }
      });
  } else {
    // Гость → показать кнопки
    document.getElementById("authButtons").style.display = "flex";
    document.getElementById("profileBlock").style.display = "none";
  }
};


// === ДРОПДАУН ===
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("dropdown");
  const nicknameBlock = document.getElementById("nicknameDisplay");
  if (nicknameBlock && nicknameBlock.contains(e.target)) {
    dropdown.classList.toggle("show");
  } else {
    dropdown.classList.remove("show");
  }
});
