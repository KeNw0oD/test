const SUPABASE_URL = "https://zhqzyklwmqygixugujel.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocXp5a2x3bXF5Z2l4dWd1amVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODc2MDgsImV4cCI6MjA2ODM2MzYwOH0.ZXqFeFrG7SVTDlad6AqOAoG2ZgeRAqru_wKg4X0jmGM";

// Остальной код можешь оставить как есть (спарки, логика профиля и т.д.)


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
// === РЕГИСТРАЦИЯ ===
function handleRegister(e) {
  e.preventDefault();
  const nicknameRaw = document.getElementById("nicknameInput").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const nickname = nicknameRaw.toLowerCase();

  if (!nickname || !email || !password) {
    document.getElementById("registerMessage").textContent = "⚠️ Please fill in all fields";
    document.getElementById("registerMessage").style.color = "#e53e3e";
    return;
  }

  // 🔍 Проверка: такой nickname уже есть
  fetch(`${SUPABASE_URL}/rest/v1/users?nickname=eq.${nickname}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  })
  .then(res => res.json())
  .then(users => {
    if (users.length > 0) {
      document.getElementById("registerMessage").textContent = "⚠️ This nickname is already taken";
      document.getElementById("registerMessage").style.color = "#e53e3e";
      throw new Error("nickname exists");
    }

    // ✅ Регистрация, если ник свободен
    return fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ nickname, email, password })
    });
  })
  .then(res => {
    if (res?.ok) {
      document.getElementById("registerMessage").textContent = "✅ Successfully registered!";
      document.getElementById("registerMessage").style.color = "#38a169";
      localStorage.setItem("loggedInUser", nickname);
      setTimeout(() => location.reload(), 1200);
    } else {
      document.getElementById("registerMessage").textContent = "❌ Registration failed";
      document.getElementById("registerMessage").style.color = "#e53e3e";
    }
  })
  .catch(err => {
    if (err.message !== "nickname exists") {
      console.error("Registration error:", err);
      document.getElementById("registerMessage").textContent = "⚠️ Connection error";
      document.getElementById("registerMessage").style.color = "#e53e3e";
    }
  });
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
          if (entry.user.toLowerCase() === user.toLowerCase()) {
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

