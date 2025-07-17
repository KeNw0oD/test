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
function handleRegister(e) {
  e.preventDefault();
  const nicknameRaw = document.getElementById("nicknameInput").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const nickname = nicknameRaw.toLowerCase();

  if (!nickname || !email || !password) {
    document.getElementById("registerMessage").textContent = "⚠️ Please fill in all fields";
    document.getElementById("registerMessage").style.color = "#e53e3e";
    return;
  }

  // Проверка nickname
  fetch(`${SUPABASE_URL}/rest/v1/users?nickname=eq.${nickname}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  })
  .then(res => res.json())
  .then(users => {
    if (users.length > 0) throw new Error("nickname_exists");

    // Проверка email
    return fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
  })
  .then(res => res.json())
  .then(usersByEmail => {
    if (usersByEmail.length > 0) throw new Error("email_exists");

    // Генерация соли и хеширование
    const salt = generateSalt();
    return hashPasswordWithSalt(password, salt).then(passwordHash => {
      return fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          nickname,
          email,
          password_hash: passwordHash,
          salt: salt
        })
      });
    });
  })
  .then(res => {
    if (res.ok) {
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
    if (err.message === "nickname_exists") {
      document.getElementById("registerMessage").textContent = "⚠️ This nickname is already taken";
    } else if (err.message === "email_exists") {
      document.getElementById("registerMessage").textContent = "⚠️ This email is already in use";
    } else {
      document.getElementById("registerMessage").textContent = "⚠️ Connection error";
    }
    document.getElementById("registerMessage").style.color = "#e53e3e";
  });
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase(); // 👈 lowercase
  const password = document.getElementById("loginPassword").value.trim();

  console.log("EMAIL:", email);

  if (!email || !password) {
    document.getElementById("loginMessage").textContent = "⚠️ Please fill in all fields";
    document.getElementById("loginMessage").style.color = "#e53e3e";
    return;
  }

  fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  })
  .then(res => res.json())
  .then(async users => {
    if (users.length === 0) throw new Error("not_found");

    const user = users[0];
    const hash = await hashPasswordWithSalt(password, user.salt);

    if (hash === user.password_hash) {
      localStorage.setItem("loggedInUser", user.nickname);
      document.getElementById("loginMessage").textContent = "✅ Welcome!";
      document.getElementById("loginMessage").style.color = "#38a169";
      setTimeout(() => location.reload(), 1000);
    } else {
      throw new Error("invalid");
    }
  })
  .catch(err => {
    let msg = "⚠️ Login failed";
    if (err.message === "not_found") msg = "⚠️ Email not found";
    if (err.message === "invalid") msg = "⚠️ Incorrect password";
    document.getElementById("loginMessage").textContent = msg;
    document.getElementById("loginMessage").style.color = "#e53e3e";
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

function generateSalt(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return salt;
}

async function hashPasswordWithSalt(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function switchTab(tab) {
  const regForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach(btn => btn.classList.remove("active"));

  if (tab === 'register') {
    regForm.style.display = "block";
    loginForm.style.display = "none";
    tabBtns[0].classList.add("active");
  } else {
    regForm.style.display = "none";
    loginForm.style.display = "block";
    tabBtns[1].classList.add("active");
  }
}
