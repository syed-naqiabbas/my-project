"use strict";

/*
 * StudyTrack Authentication
 * -------------------------
 * Data is stored locally in the browser.
 *
 * Storage:
 * studytrack_users
 * studytrack_current_user
 * studytrack_remembered_user
 */

const USERS_KEY = "studytrack_users";
const CURRENT_USER_KEY = "studytrack_current_user";
const REMEMBERED_USER_KEY = "studytrack_remembered_user";

/* ---------- DOM Elements ---------- */

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const tabIndicator = document.getElementById("tabIndicator");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const regFullName = document.getElementById("regFullName");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");
const regConfirm = document.getElementById("regConfirm");

const toggleLoginPass = document.getElementById("toggleLoginPass");
const toggleRegPass = document.getElementById("toggleRegPass");

const rememberMe = document.getElementById("rememberMe");
const fillDemo = document.getElementById("fillDemo");

const passStrengthFill = document.getElementById("passStrengthFill");
const passStrengthLabel = document.getElementById("passStrengthLabel");

const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

const toast = document.getElementById("toast");

/* ---------- Storage Helpers ---------- */

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);

    if (!data) {
      return [];
    }

    const users = JSON.parse(data);

    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Could not read users:", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/* ---------- Toast ---------- */

let toastTimer;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ---------- Form Errors ---------- */

function setError(input, errorElement, message) {
  if (input) {
    input.classList.toggle("input-error", Boolean(message));
  }

  if (errorElement) {
    errorElement.textContent = message || "";
  }
}

function clearLoginErrors() {
  loginError.style.display = "none";
  loginError.textContent = "";

  setError(
    loginUsername,
    document.getElementById("loginUsernameError"),
    ""
  );

  setError(
    loginPassword,
    document.getElementById("loginPasswordError"),
    ""
  );
}

function clearRegisterErrors() {
  registerError.style.display = "none";
  registerError.textContent = "";

  setError(
    regFullName,
    document.getElementById("regFullNameError"),
    ""
  );

  setError(
    regUsername,
    document.getElementById("regUsernameError"),
    ""
  );

  setError(
    regPassword,
    document.getElementById("regPasswordError"),
    ""
  );

  setError(
    regConfirm,
    document.getElementById("regConfirmError"),
    ""
  );
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = "block";
}

function showRegisterError(message) {
  registerError.textContent = message;
  registerError.style.display = "block";
}

/* ---------- Tab Switching ---------- */

function showLogin() {
  loginForm.style.display = "block";
  registerForm.style.display = "none";

  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");

  tabLogin.setAttribute("aria-selected", "true");
  tabRegister.setAttribute("aria-selected", "false");

  tabIndicator.style.transform = "translateX(0)";

  clearRegisterErrors();
}

function showRegister() {
  loginForm.style.display = "none";
  registerForm.style.display = "block";

  tabLogin.classList.remove("active");
  tabRegister.classList.add("active");

  tabLogin.setAttribute("aria-selected", "false");
  tabRegister.setAttribute("aria-selected", "true");

  tabIndicator.style.transform = "translateX(100%)";

  clearLoginErrors();
}

tabLogin.addEventListener("click", showLogin);
tabRegister.addEventListener("click", showRegister);

goRegister.addEventListener("click", function (event) {
  event.preventDefault();
  showRegister();
});

goLogin.addEventListener("click", function (event) {
  event.preventDefault();
  showLogin();
});

/* ---------- Password Visibility ---------- */

function setupPasswordToggle(button, input) {
  if (!button || !input) return;

  button.addEventListener("click", function () {
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";

    button.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password"
    );

    button.setAttribute(
      "aria-pressed",
      String(isPassword)
    );
  });
}

setupPasswordToggle(
  toggleLoginPass,
  loginPassword
);

setupPasswordToggle(
  toggleRegPass,
  regPassword
);

/* ---------- Password Strength ---------- */

function updatePasswordStrength(password) {
  if (!passStrengthFill || !passStrengthLabel) {
    return;
  }

  if (!password) {
    passStrengthFill.style.width = "0%";
    passStrengthLabel.innerHTML = "&nbsp;";
    return;
  }

  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    passStrengthFill.style.width = "25%";
    passStrengthLabel.textContent = "Weak";
  } else if (score <= 3) {
    passStrengthFill.style.width = "60%";
    passStrengthLabel.textContent = "Medium";
  } else {
    passStrengthFill.style.width = "100%";
    passStrengthLabel.textContent = "Strong";
  }
}

regPassword.addEventListener("input", function () {
  updatePasswordStrength(regPassword.value);
});

/* ---------- Username Validation ---------- */

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/* ---------- Login ---------- */

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  clearLoginErrors();

  const username = normalizeUsername(
    loginUsername.value
  );

  const password = loginPassword.value;

  let valid = true;

  if (!username) {
    setError(
      loginUsername,
      document.getElementById("loginUsernameError"),
      "Please enter your username."
    );

    valid = false;
  }

  if (!password) {
    setError(
      loginPassword,
      document.getElementById("loginPasswordError"),
      "Please enter your password."
    );

    valid = false;
  }

  if (!valid) return;

  const users = getUsers();

  const user = users.find(
    item =>
      item.username === username &&
      item.password === password
  );

  if (!user) {
    showLoginError(
      "Incorrect username or password."
    );

    return;
  }

  loginSubmitBtn.classList.add("loading");

  setTimeout(() => {
    const sessionUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username
    };

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(sessionUser)
    );

    if (rememberMe.checked) {
      localStorage.setItem(
        REMEMBERED_USER_KEY,
        user.username
      );
    } else {
      localStorage.removeItem(
        REMEMBERED_USER_KEY
      );
    }

    showToast("Login successful!");

    /*
     * Change this filename if your dashboard
     * has a different filename.
     */
    window.location.href = "dashboard.html";
  }, 600);
});

/* ---------- Register ---------- */

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  clearRegisterErrors();

  const fullName = regFullName.value.trim();
  const username = normalizeUsername(
    regUsername.value
  );
  const password = regPassword.value;
  const confirmPassword = regConfirm.value;

  let valid = true;

  if (fullName.length < 2) {
    setError(
      regFullName,
      document.getElementById("regFullNameError"),
      "Please enter your full name."
    );

    valid = false;
  }

  if (!isValidUsername(username)) {
    setError(
      regUsername,
      document.getElementById("regUsernameError"),
      "Use 3–20 letters, numbers, or underscores."
    );

    valid = false;
  }

  if (password.length < 6) {
    setError(
      regPassword,
      document.getElementById("regPasswordError"),
      "Password must contain at least 6 characters."
    );

    valid = false;
  }

  if (confirmPassword !== password) {
    setError(
      regConfirm,
      document.getElementById("regConfirmError"),
      "Passwords do not match."
    );

    valid = false;
  }

  if (!valid) return;

  const users = getUsers();

  const existingUser = users.find(
    user => user.username === username
  );

  if (existingUser) {
    setError(
      regUsername,
      document.getElementById("regUsernameError"),
      "This username is already registered."
    );

    return;
  }

  registerSubmitBtn.classList.add("loading");

  setTimeout(() => {
    const newUser = {
      id:
        Date.now().toString() +
        Math.random().toString(36).slice(2),

      fullName,
      username,
      password,

      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    saveUsers(users);

    registerSubmitBtn.classList.remove(
      "loading"
    );

    registerForm.reset();

    updatePasswordStrength("");

    showToast(
      "Account created successfully!"
    );

    setTimeout(() => {
      loginUsername.value = username;
      loginPassword.focus();
      showLogin();
    }, 500);
  }, 600);
});

/* ---------- Demo Login ---------- */

fillDemo.addEventListener("click", function () {
  const users = getUsers();

  const demoUsername = "demo_student";
  const demoPassword = "demo123";

  const exists = users.some(
    user => user.username === demoUsername
  );

  if (!exists) {
    users.push({
      id: "demo-user",
      fullName: "Demo Student",
      username: demoUsername,
      password: demoPassword,
      createdAt: new Date().toISOString()
    });

    saveUsers(users);
  }

  loginUsername.value = demoUsername;
  loginPassword.value = demoPassword;

  showLogin();

  showToast(
    "Demo login details filled in."
  );
});

/* ---------- Remembered Username ---------- */

document.addEventListener("DOMContentLoaded", function () {
  const rememberedUsername =
    localStorage.getItem(
      REMEMBERED_USER_KEY
    );

  if (rememberedUsername) {
    loginUsername.value = rememberedUsername;
    rememberMe.checked = true;
  }

  const currentUser = getCurrentUser();

  /*
   * If already logged in, don't force the user
   * to log in again.
   */
  if (currentUser) {
    // Uncomment if you want automatic redirect:
    // window.location.href = "dashboard.html";
  }
});