// =============================================
// script.js — StudyTrack Dashboard Logic
// Handles tasks, UI sections, filters, and more
// =============================================

// ---- App State ----
var tasks = [];          // All tasks for the current user
var currentUser = null;  // The logged-in user object
var taskToDeleteId = null; // ID of the task waiting to be deleted

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener("DOMContentLoaded", function () {

  // Step 1: Check if a user is logged in (redirects if not)
  currentUser = checkAuthentication();
  if (!currentUser) return; // checkAuthentication already redirects

  // Step 2: Load this user's tasks from localStorage
  loadTasks();

  // Step 3: Set up the UI with user info
  setupUserUI();

  // Step 4: Render everything
  updateDashboard();
  renderTasks();
  renderDashboardPreview();

  // Step 5: Attach all event listeners
  initEventListeners();

  // Step 6: Show dashboard section by default
  showSection("dashboard");

  // Step 7: Display current date
  displayDate();
});

// =============================================
// USER UI SETUP
// =============================================

// Fill in all places where the user's name/username appears
function setupUserUI() {
  if (!currentUser) return;

  var firstName = currentUser.fullName.split(" ")[0]; // Just the first name
  var initial = currentUser.fullName.charAt(0).toUpperCase();
  var greeting = getTimeGreeting();

  // Header
  document.getElementById("headerWelcome").textContent = "Welcome, " + firstName + "!";

  // Welcome Banner
  document.getElementById("welcomeHeading").textContent = greeting + ", " + firstName + "! 👋";
  document.getElementById("welcomeSub").textContent = "Here's your study overview for today.";

  // Sidebar
  document.getElementById("sidebarUserName").textContent = currentUser.fullName;
  document.getElementById("sidebarUserHandle").textContent = "@" + currentUser.username;
  document.getElementById("sidebarAvatar").textContent = initial;

  // Profile section
  document.getElementById("profileAvatar").textContent = initial;
  document.getElementById("profileFullName").textContent = currentUser.fullName;
  document.getElementById("profileUsername").textContent = "@" + currentUser.username;
  document.getElementById("profileInfoName").textContent = currentUser.fullName;
  document.getElementById("profileInfoUsername").textContent = currentUser.username;
  document.getElementById("profileInfoDate").textContent = formatDate(currentUser.createdAt ? currentUser.createdAt.split("T")[0] : "");
}

// Return a greeting based on the time of day
function getTimeGreeting() {
  var hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Show today's date in the header
function displayDate() {
  var today = new Date();
  var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  var el = document.getElementById("headerDate");
  if (el) el.textContent = today.toLocaleDateString("en-US", options);
}

// =============================================
// SECTION NAVIGATION
// =============================================

// Show a specific content section and update sidebar active state
function showSection(sectionName) {
  // Hide all sections
  var allSections = document.querySelectorAll(".content-section");
  allSections.forEach(function (section) {
    section.classList.remove("active");
  });

  // Remove active from all nav links
  var allLinks = document.querySelectorAll(".sidebar-link");
  allLinks.forEach(function (link) {
    link.classList.remove("active");
  });

  // Show the selected section
  var targetSection = document.getElementById("section" + capitalizeFirst(sectionName));
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Set active nav link
  var targetLink = document.querySelector('[data-section="' + sectionName + '"]');
  if (targetLink) {
    targetLink.classList.add("active");
  }

  // Update header title
  var titles = {
    dashboard: "Dashboard",
    tasks: "My Tasks",
    add: "Add Task",
    profile: "Profile"
  };
  var titleEl = document.getElementById("headerTitle");
  if (titleEl) titleEl.textContent = titles[sectionName] || "StudyTrack";

  // If switching to tasks section, re-render
  if (sectionName === "tasks") {
    renderTasks();
  }

  // If switching to profile, update profile stats
  if (sectionName === "profile") {
    updateProfileStats();
  }

  // Close mobile sidebar after navigation
  closeSidebar();
}

// Capitalize first letter helper
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================
// LOCAL STORAGE — TASKS
// =============================================

// Each user's tasks are stored under "tasks_username"
function getUserTasksKey() {
  return "tasks_" + currentUser.username;
}

// Save the tasks array to localStorage under this user's key
function saveTasks() {
  localStorage.setItem(getUserTasksKey(), JSON.stringify(tasks));
}

// Load tasks from localStorage for the current user
function loadTasks() {
  var raw = localStorage.getItem(getUserTasksKey());
  if (raw) {
    tasks = JSON.parse(raw);
  } else {
    tasks = [];
  }
}

// =============================================
// DASHBOARD & PROFILE STATS
// =============================================

// Update the stat cards and progress bar
function updateDashboard() {
  var total = tasks.length;
  var completed = tasks.filter(function (t) { return t.completed; }).length;
  var pending = total - completed;
  var dueSoon = countDueSoon();

  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("dueSoonCount").textContent = dueSoon;

  // Progress bar
  var percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressBarFill").style.width = percent + "%";
}

// Update the profile section's task counts
function updateProfileStats() {
  var total = tasks.length;
  var completed = tasks.filter(function (t) { return t.completed; }).length;
  var pending = total - completed;

  document.getElementById("profileTotal").textContent = total;
  document.getElementById("profileCompleted").textContent = completed;
  document.getElementById("profilePending").textContent = pending;
}

// Count tasks due within the next 3 days (not completed)
function countDueSoon() {
  return tasks.filter(function (task) {
    if (task.completed) return false;
    var status = getDueDateStatus(task.dueDate);
    return status === "soon" || status === "today";
  }).length;
}

// =============================================
// DATE UTILITIES
// =============================================

// Get the due date status of a task
// Returns: "overdue", "today", "soon", or "normal"
function getDueDateStatus(dateString) {
  if (!dateString) return "normal";
  var parts = dateString.split("-");
  var due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  var diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 3) return "soon";
  return "normal";
}

// Format YYYY-MM-DD into "Dec 25, 2025"
function formatDate(dateString) {
  if (!dateString) return "—";
  var parts = dateString.split("-");
  if (parts.length < 3) return dateString;
  var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// =============================================
// FILTER & SORT
// =============================================

// Apply search, status, priority filters and sorting
function filterTasks() {
  var search = document.getElementById("searchInput").value.trim().toLowerCase();
  var status = document.getElementById("filterStatus").value;
  var priority = document.getElementById("filterPriority").value;
  var sort = document.getElementById("sortOrder").value;

  var result = tasks.slice(); // Copy the array

  // Search filter
  if (search) {
    result = result.filter(function (t) {
      return (
        t.title.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
      );
    });
  }

  // Status filter
  if (status === "pending") result = result.filter(function (t) { return !t.completed; });
  if (status === "completed") result = result.filter(function (t) { return t.completed; });

  // Priority filter
  if (priority !== "all") result = result.filter(function (t) { return t.priority === priority; });

  // Sort
  result.sort(function (a, b) {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
    if (sort === "priority") {
      var order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  return result;
}

// Live search handler
function searchTasks() {
  renderTasks();
}

// =============================================
// RENDER TASKS (My Tasks section)
// =============================================

function renderTasks() {
  var grid = document.getElementById("tasksGrid");
  var emptyEl = document.getElementById("tasksEmpty");
  var countEl = document.getElementById("tasksCountLabel");

  var filtered = filterTasks();

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.style.display = "none";
    emptyEl.style.display = "flex";
    countEl.textContent = "0 tasks";
  } else {
    grid.style.display = "grid";
    emptyEl.style.display = "none";
    countEl.textContent = filtered.length + " task" + (filtered.length !== 1 ? "s" : "");
    filtered.forEach(function (task) {
      grid.appendChild(buildTaskCard(task));
    });
  }
}

// =============================================
// RENDER DASHBOARD PREVIEW (recent tasks)
// =============================================

function renderDashboardPreview() {
  var listEl = document.getElementById("tasksPreviewList");
  var emptyEl = document.getElementById("dashboardEmpty");

  listEl.innerHTML = "";

  // Show the 4 most recently created tasks
  var recent = tasks.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }).slice(0, 4);

  if (recent.length === 0) {
    listEl.style.display = "none";
    emptyEl.style.display = "flex";
  } else {
    listEl.style.display = "flex";
    emptyEl.style.display = "none";
    recent.forEach(function (task) {
      listEl.appendChild(buildPreviewRow(task));
    });
  }
}

// Build a compact preview row for the dashboard
function buildPreviewRow(task) {
  var row = document.createElement("div");
  row.className = "preview-row" + (task.completed ? " preview-row-done" : "");

  var dueDateStatus = getDueDateStatus(task.dueDate);
  var dueCls = "";
  if (!task.completed) {
    if (dueDateStatus === "overdue") dueCls = "due-overdue";
    else if (dueDateStatus === "today" || dueDateStatus === "soon") dueCls = "due-soon";
  }

  row.innerHTML =
    '<div class="preview-row-left">' +
      '<div class="preview-check ' + (task.completed ? "checked" : "") + '" onclick="toggleTask(\'' + task.id + '\')">' +
        (task.completed ? "✓" : "") +
      '</div>' +
      '<div class="preview-row-info">' +
        '<span class="preview-row-title' + (task.completed ? " done-text" : "") + '">' + escapeHtml(task.title) + '</span>' +
        '<span class="preview-row-subject">' + escapeHtml(task.subject) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="preview-row-right">' +
      '<span class="badge-priority ' + task.priority + '">' + capitalizeFirst(task.priority) + '</span>' +
      '<span class="preview-due ' + dueCls + '">' + formatDate(task.dueDate) + '</span>' +
    '</div>';

  return row;
}

// =============================================
// BUILD TASK CARD (for My Tasks grid)
// =============================================

function buildTaskCard(task) {
  var card = document.createElement("div");
  card.className = "task-card priority-" + task.priority + (task.completed ? " is-completed" : "");
  card.setAttribute("data-id", task.id);

  var dueDateStatus = getDueDateStatus(task.dueDate);
  var dueCls = "task-due";
  var duePrefix = "📅";
  var dueSuffix = "";

  if (!task.completed) {
    if (dueDateStatus === "overdue") { dueCls += " is-overdue"; duePrefix = "⚠️"; dueSuffix = " (Overdue)"; }
    else if (dueDateStatus === "today") { dueCls += " is-soon"; duePrefix = "🔔"; dueSuffix = " (Today!)"; }
    else if (dueDateStatus === "soon") { dueCls += " is-soon"; duePrefix = "🔔"; }
  }

  var toggleLabel = task.completed ? "↩ Pending" : "✓ Complete";

  card.innerHTML =
    '<div class="task-card-top">' +
      '<span class="task-title">' + escapeHtml(task.title) + '</span>' +
      '<div class="task-badges">' +
        '<span class="badge-priority ' + task.priority + '">' + capitalizeFirst(task.priority) + '</span>' +
        '<span class="badge-status ' + (task.completed ? "completed" : "pending") + '">' +
          (task.completed ? "Done" : "Pending") +
        '</span>' +
      '</div>' +
    '</div>' +
    '<span class="task-subject-tag">' + escapeHtml(task.subject) + '</span>' +
    (task.description ? '<p class="task-desc">' + escapeHtml(task.description) + '</p>' : '') +
    '<div class="' + dueCls + '">' +
      '<span>' + duePrefix + '</span>' +
      '<span>' + formatDate(task.dueDate) + dueSuffix + '</span>' +
    '</div>' +
    '<div class="task-card-actions">' +
      '<button class="btn btn-card-complete" onclick="toggleTask(\'' + task.id + '\')">' + toggleLabel + '</button>' +
      '<button class="btn btn-card-edit" onclick="openEditModal(\'' + task.id + '\')">✏️ Edit</button>' +
      '<button class="btn btn-card-delete" onclick="askDeleteTask(\'' + task.id + '\')">🗑️</button>' +
    '</div>';

  return card;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =============================================
// TASK CRUD
// =============================================

// Add a new task
function addTask(data) {
  var newTask = {
    id: generateId(),
    title: data.title,
    subject: data.subject,
    description: data.description,
    dueDate: data.dueDate,
    priority: data.priority,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask); // Put new task at the top
  saveTasks();
  updateDashboard();
  renderDashboardPreview();
  showToast("Task added successfully! 🎉", "success");
}

// Edit an existing task
function editTask(taskId, data) {
  tasks = tasks.map(function (t) {
    if (t.id === taskId) {
      return {
        id: t.id,
        title: data.title,
        subject: data.subject,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        completed: t.completed,
        createdAt: t.createdAt
      };
    }
    return t;
  });
  saveTasks();
  updateDashboard();
  renderTasks();
  renderDashboardPreview();
  showToast("Task updated. ✏️", "info");
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter(function (t) { return t.id !== taskId; });
  saveTasks();
  updateDashboard();
  renderTasks();
  renderDashboardPreview();
  showToast("Task deleted.", "error");
}

// Toggle task complete / pending
function toggleTask(taskId) {
  tasks = tasks.map(function (t) {
    if (t.id === taskId) {
      return Object.assign({}, t, { completed: !t.completed });
    }
    return t;
  });
  saveTasks();
  updateDashboard();
  renderTasks();
  renderDashboardPreview();

  var updated = tasks.find(function (t) { return t.id === taskId; });
  if (updated && updated.completed) {
    showToast("Great work! Task completed. ✅", "success");
  } else {
    showToast("Task marked as pending.", "info");
  }
}

// Show delete confirmation
function askDeleteTask(taskId) {
  taskToDeleteId = taskId;
  openModal("deleteModalOverlay");
}

// =============================================
// FORM VALIDATION
// =============================================

// Validate the Add Task form
function validateAddForm() {
  var title = document.getElementById("taskTitle").value.trim();
  var subject = document.getElementById("taskSubject").value.trim();
  var dueDate = document.getElementById("taskDueDate").value;
  var valid = true;

  clearFieldError(["taskTitle", "taskSubject", "taskDueDate"], ["titleError", "subjectError", "dueDateError"]);

  if (!title || title.length < 3) {
    markFieldError("taskTitle", "titleError", title ? "Title too short (min 3 chars)." : "Task title is required.");
    valid = false;
  }
  if (!subject) {
    markFieldError("taskSubject", "subjectError", "Subject is required.");
    valid = false;
  }
  if (!dueDate) {
    markFieldError("taskDueDate", "dueDateError", "Please select a due date.");
    valid = false;
  }
  return valid;
}

// Validate the Edit Task form
function validateEditForm() {
  var title = document.getElementById("editTaskTitle").value.trim();
  var subject = document.getElementById("editTaskSubject").value.trim();
  var dueDate = document.getElementById("editTaskDueDate").value;
  var valid = true;

  clearFieldError(["editTaskTitle", "editTaskSubject", "editTaskDueDate"], ["editTitleError", "editSubjectError", "editDueDateError"]);

  if (!title || title.length < 3) {
    markFieldError("editTaskTitle", "editTitleError", title ? "Title too short (min 3 chars)." : "Task title is required.");
    valid = false;
  }
  if (!subject) {
    markFieldError("editTaskSubject", "editSubjectError", "Subject is required.");
    valid = false;
  }
  if (!dueDate) {
    markFieldError("editTaskDueDate", "editDueDateError", "Please select a due date.");
    valid = false;
  }
  return valid;
}

function markFieldError(inputId, errorId, message) {
  var el = document.getElementById(inputId);
  var er = document.getElementById(errorId);
  if (el) el.classList.add("input-error");
  if (er) er.textContent = message;
}

function clearFieldError(inputIds, errorIds) {
  inputIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
  errorIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

// =============================================
// MODAL HELPERS
// =============================================

function openModal(overlayId) {
  document.getElementById(overlayId).classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeModal(overlayId) {
  document.getElementById(overlayId).classList.remove("is-open");
  document.body.style.overflow = "";
}

// Open the edit modal and populate it with the task's data
function openEditModal(taskId) {
  var task = tasks.find(function (t) { return t.id === taskId; });
  if (!task) return;

  document.getElementById("editingTaskId").value = taskId;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskSubject").value = task.subject;
  document.getElementById("editTaskDescription").value = task.description || "";
  document.getElementById("editTaskDueDate").value = task.dueDate;
  document.getElementById("editTaskPriority").value = task.priority;

  clearFieldError(["editTaskTitle", "editTaskSubject", "editTaskDueDate"], ["editTitleError", "editSubjectError", "editDueDateError"]);

  openModal("editModalOverlay");
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================

function showToast(message, type) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast toast-show toast-" + (type || "success");
  setTimeout(function () {
    toast.className = "toast";
  }, 3000);
}

// =============================================
// SIDEBAR (Mobile)
// =============================================

function openSidebar() {
  document.getElementById("sidebar").classList.add("sidebar-open");
  document.getElementById("sidebarOverlay").classList.add("overlay-visible");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("sidebar-open");
  document.getElementById("sidebarOverlay").classList.remove("overlay-visible");
}

// =============================================
// EVENT LISTENERS
// =============================================

function initEventListeners() {

  // ---- Sidebar navigation links ----
  document.querySelectorAll(".sidebar-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var section = this.getAttribute("data-section");
      if (section === "add") {
        // Reset form when navigating to Add Task
        document.getElementById("addTaskForm").reset();
        clearFieldError(["taskTitle", "taskSubject", "taskDueDate"], ["titleError", "subjectError", "dueDateError"]);
        document.getElementById("addTaskSuccess").style.display = "none";
      }
      showSection(section);
    });
  });

  // "View All" link on dashboard
  document.querySelector(".view-all-link").addEventListener("click", function (e) {
    e.preventDefault();
    showSection("tasks");
  });

  // ---- Mobile sidebar toggle ----
  document.getElementById("sidebarToggle").addEventListener("click", openSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);

  // ---- Logout buttons ----
  document.getElementById("sidebarLogoutBtn").addEventListener("click", logoutUser);
  document.getElementById("headerLogoutBtn").addEventListener("click", logoutUser);
  document.getElementById("mobileLogoutBtn").addEventListener("click", logoutUser);
  document.getElementById("profileLogoutBtn").addEventListener("click", logoutUser);

  // ---- Add Task form ----
  document.getElementById("tasksAddBtn").addEventListener("click", function () {
    document.getElementById("addTaskForm").reset();
    clearFieldError(["taskTitle", "taskSubject", "taskDueDate"], ["titleError", "subjectError", "dueDateError"]);
    document.getElementById("addTaskSuccess").style.display = "none";
    showSection("add");
  });

  document.getElementById("dashEmptyAddBtn") && document.getElementById("dashEmptyAddBtn").addEventListener("click", function () {
    showSection("add");
  });

  document.getElementById("tasksEmptyAddBtn").addEventListener("click", function () {
    showSection("add");
  });

  document.getElementById("addTaskCancelBtn").addEventListener("click", function () {
    showSection("tasks");
  });

  document.getElementById("addTaskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateAddForm()) return;

    addTask({
      title: document.getElementById("taskTitle").value.trim(),
      subject: document.getElementById("taskSubject").value.trim(),
      description: document.getElementById("taskDescription").value.trim(),
      dueDate: document.getElementById("taskDueDate").value,
      priority: document.getElementById("taskPriority").value
    });

    document.getElementById("addTaskForm").reset();
    clearFieldError(["taskTitle", "taskSubject", "taskDueDate"], ["titleError", "subjectError", "dueDateError"]);

    var successBox = document.getElementById("addTaskSuccess");
    successBox.textContent = "Task added successfully! Go to My Tasks to view it.";
    successBox.style.display = "block";
    setTimeout(function () { successBox.style.display = "none"; }, 4000);
  });

  // ---- Edit Task modal ----
  document.getElementById("editTaskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateEditForm()) return;

    var taskId = document.getElementById("editingTaskId").value;
    editTask(taskId, {
      title: document.getElementById("editTaskTitle").value.trim(),
      subject: document.getElementById("editTaskSubject").value.trim(),
      description: document.getElementById("editTaskDescription").value.trim(),
      dueDate: document.getElementById("editTaskDueDate").value,
      priority: document.getElementById("editTaskPriority").value
    });
    closeModal("editModalOverlay");
  });

  document.getElementById("closeEditModal").addEventListener("click", function () {
    closeModal("editModalOverlay");
  });

  document.getElementById("cancelEditBtn").addEventListener("click", function () {
    closeModal("editModalOverlay");
  });

  document.getElementById("editModalOverlay").addEventListener("click", function (e) {
    if (e.target === this) closeModal("editModalOverlay");
  });

  // ---- Delete confirm modal ----
  document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId);
      taskToDeleteId = null;
    }
    closeModal("deleteModalOverlay");
  });

  document.getElementById("cancelDeleteBtn").addEventListener("click", function () {
    taskToDeleteId = null;
    closeModal("deleteModalOverlay");
  });

  document.getElementById("deleteModalOverlay").addEventListener("click", function (e) {
    if (e.target === this) {
      taskToDeleteId = null;
      closeModal("deleteModalOverlay");
    }
  });

  // ---- Search and filters ----
  document.getElementById("searchInput").addEventListener("input", searchTasks);
  document.getElementById("filterStatus").addEventListener("change", renderTasks);
  document.getElementById("filterPriority").addEventListener("change", renderTasks);
  document.getElementById("sortOrder").addEventListener("change", renderTasks);

  document.getElementById("clearFiltersBtn").addEventListener("click", function () {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterStatus").value = "all";
    document.getElementById("filterPriority").value = "all";
    document.getElementById("sortOrder").value = "newest";
    renderTasks();
  });

  // ---- Escape key closes modals ----
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal("editModalOverlay");
      closeModal("deleteModalOverlay");
    }
  });

  // ---- Inline error clearing ----
  ["taskTitle", "taskSubject", "taskDueDate"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      this.classList.remove("input-error");
      var errMap = { taskTitle: "titleError", taskSubject: "subjectError", taskDueDate: "dueDateError" };
      var el = document.getElementById(errMap[id]);
      if (el) el.textContent = "";
    });
  });

  ["editTaskTitle", "editTaskSubject", "editTaskDueDate"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      this.classList.remove("input-error");
      var errMap = { editTaskTitle: "editTitleError", editTaskSubject: "editSubjectError", editTaskDueDate: "editDueDateError" };
      var el = document.getElementById(errMap[id]);
      if (el) el.textContent = "";
    });
  });

}
