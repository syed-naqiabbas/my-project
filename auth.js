// =============================================
// auth.js — StudyTrack Authentication System
// Handles user registration, login, and session
// NOTE: This is a frontend-only demo authentication
// system using localStorage. Not for real-world use.
// =============================================

// ---- LocalStorage Key for the users list ----
var USERS_KEY = "studytrack_users";
var SESSION_KEY = "studytrack_session";

// =============================================
// LOAD & SAVE USERS
// =============================================

// Load all registered users from localStorage
function loadUsers() {
  var raw = localStorage.getItem(USERS_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  return []; // Return empty array if no users yet
}

// Save the users array to localStorage
function saveUser(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// =============================================
// REGISTER USER
// =============================================

// Register a new user account
// Returns: { success: true } or { success: false, message: "reason" }
function registerUser(fullName, username, password) {
  var users = loadUsers();

  // Check if username is already taken (case-insensitive)
  var exists = users.find(function (u) {
    return u.username.toLowerCase() === username.toLowerCase();
  });

  if (exists) {
    return { success: false, message: "That username is already taken. Please choose a different one." };
  }

  // Create the new user object
  var newUser = {
    fullName: fullName,
    username: username,
    password: password, // NOTE: Not hashed — demo only
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUser(users);

  // Create starter/demo tasks for this brand new user
  createDemoTasks(username);

  return { success: true };
}

// =============================================
// LOGIN USER
// =============================================

// Try to log in with username and password
// Returns: { success: true, user: {...} } or { success: false, message: "..." }
function loginUser(username, password) {
  var users = loadUsers();

  // Find user by username (case-insensitive)
  var user = users.find(function (u) {
    return u.username.toLowerCase() === username.toLowerCase();
  });

  if (!user) {
    return { success: false, message: "No account found with that username." };
  }

  if (user.password !== password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }

  // Save session — store the username of who is logged in
  localStorage.setItem(SESSION_KEY, user.username);

  return { success: true, user: user };
}

// =============================================
// LOGOUT USER
// =============================================

// Log out the current user
// Clears the session but keeps account and tasks
function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

// =============================================
// GET CURRENT USER
// =============================================

// Returns the currently logged-in user object, or null
function getCurrentUser() {
  var username = localStorage.getItem(SESSION_KEY);
  if (!username) return null;

  var users = loadUsers();
  var user = users.find(function (u) {
    return u.username === username;
  });

  return user || null;
}

// =============================================
// CHECK AUTHENTICATION
// =============================================

// Use this on protected pages (like index.html)
// Redirects to login if no session found
function checkAuthentication() {
  var user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

// =============================================
// DEMO TASKS FOR NEW USERS
// =============================================

// Create a few starter tasks when a user first registers
// so their dashboard doesn't look empty
function createDemoTasks(username) {
  var today = new Date();

  // Helper to get a date N days from now in YYYY-MM-DD format
  function futureDate(days) {
    var d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  // Helper to make a simple unique ID
  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  var demoTasks = [
    {
      id: makeId(),
      title: "Complete Mathematics Assignment",
      subject: "Mathematics",
      description: "Finish all exercises from Chapter 6. Show full working for each problem.",
      dueDate: futureDate(3),
      priority: "high",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId(),
      title: "Prepare Science Presentation",
      subject: "Science",
      description: "Create slides on the topic of renewable energy. Include graphs and real-world examples.",
      dueDate: futureDate(5),
      priority: "medium",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId(),
      title: "Submit Web Development Project",
      subject: "Web Development",
      description: "Final submission of the StudyTrack midterm project. Make sure all features are working.",
      dueDate: futureDate(7),
      priority: "high",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: makeId(),
      title: "Read History Chapter 4",
      subject: "History",
      description: "Read and make notes on Chapter 4. Focus on key dates and events.",
      dueDate: futureDate(2),
      priority: "low",
      completed: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Save under user-specific key
  var userTasksKey = "tasks_" + username;
  localStorage.setItem(userTasksKey, JSON.stringify(demoTasks));
}

// =============================================
// SHARED FORM HELPER FUNCTIONS
// (Used by both login.html and register.html)
// =============================================

// Show an error message under a specific form field
function showAuthFieldError(inputId, errorId, message) {
  var input = document.getElementById(inputId);
  var errorEl = document.getElementById(errorId);
  if (input) input.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

// Clear all errors from a list of input/error IDs
function clearAuthErrors(inputIds, errorIds) {
  inputIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
  errorIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}
