"use strict";

/*
 * StudyTrack Dashboard Script
 *
 * This file handles:
 * - Current user information
 * - Logout
 * - User-specific tasks
 * - Adding tasks
 * - Completing tasks
 * - Deleting tasks
 * - Filtering tasks
 * - Sorting tasks
 * - Progress statistics
 */

const CURRENT_USER_KEY = "studytrack_current_user";
const TASKS_KEY = "studytrack_tasks";

/* ---------- Current User ---------- */

function getCurrentUser() {
  try {
    const data = localStorage.getItem(
      CURRENT_USER_KEY
    );

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

const currentUser = getCurrentUser();

/*
 * If this script is used on dashboard.html,
 * make sure only logged-in users can access it.
 */
if (
  document.body &&
  document.body.classList.contains("dashboard-body") &&
  !currentUser
) {
  window.location.href = "index.html";
}

/* ---------- Task Storage ---------- */

function getAllTasks() {
  try {
    const data = localStorage.getItem(
      TASKS_KEY
    );

    if (!data) return [];

    const tasks = JSON.parse(data);

    return Array.isArray(tasks) ? tasks : [];
  } catch {
    return [];
  }
}

function saveAllTasks(tasks) {
  localStorage.setItem(
    TASKS_KEY,
    JSON.stringify(tasks)
  );
}

function getUserTasks() {
  if (!currentUser) return [];

  return getAllTasks().filter(
    task => task.username === currentUser.username
  );
}

/* ---------- User Information ---------- */

function displayUserInfo() {
  if (!currentUser) return;

  const userNameElements = document.querySelectorAll(
    "[data-user-name]"
  );

  userNameElements.forEach(element => {
    element.textContent =
      currentUser.fullName;
  });

  const usernameElements =
    document.querySelectorAll(
      "[data-username]"
    );

  usernameElements.forEach(element => {
    element.textContent =
      currentUser.username;
  });
}

/* ---------- Logout ---------- */

function logout() {
  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  window.location.href = "index.html";
}

document.addEventListener(
  "click",
  function (event) {
    const logoutButton =
      event.target.closest(
        "[data-logout]"
      );

    if (logoutButton) {
      logout();
    }
  }
);

/* ---------- Task ID ---------- */

function createTaskId() {
  return (
    Date.now().toString() +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );
}

/* ---------- Add Task ---------- */

function addTask(taskData) {
  if (!currentUser) return null;

  const allTasks = getAllTasks();

  const task = {
    id: createTaskId(),

    username: currentUser.username,

    title: String(
      taskData.title || ""
    ).trim(),

    subject: String(
      taskData.subject || "General"
    ).trim(),

    priority:
      taskData.priority || "Medium",

    dueDate:
      taskData.dueDate || "",

    completed: false,

    createdAt:
      new Date().toISOString()
  };

  if (!task.title) {
    return null;
  }

  allTasks.push(task);

  saveAllTasks(allTasks);

  return task;
}

/* ---------- Complete Task ---------- */

function toggleTask(taskId) {
  const allTasks = getAllTasks();

  const index = allTasks.findIndex(
    task =>
      task.id === taskId &&
      task.username ===
        currentUser?.username
  );

  if (index === -1) return;

  allTasks[index].completed =
    !allTasks[index].completed;

  saveAllTasks(allTasks);

  renderTasks();
}

/* ---------- Delete Task ---------- */

function deleteTask(taskId) {
  const allTasks = getAllTasks();

  const filteredTasks =
    allTasks.filter(
      task =>
        !(
          task.id === taskId &&
          task.username ===
            currentUser?.username
        )
    );

  saveAllTasks(filteredTasks);

  renderTasks();
}

/* ---------- Task Rendering ---------- */

let activeFilter = "all";
let activeSort = "date";

function renderTasks() {
  const container =
    document.querySelector(
      "[data-task-list]"
    );

  if (!container) return;

  let tasks = getUserTasks();

  if (activeFilter === "active") {
    tasks = tasks.filter(
      task => !task.completed
    );
  }

  if (activeFilter === "completed") {
    tasks = tasks.filter(
      task => task.completed
    );
  }

  if (activeFilter !== "all") {
    tasks = tasks.filter(task => {
      if (
        ["high", "medium", "low"].includes(
          activeFilter
        )
      ) {
        return (
          task.priority.toLowerCase() ===
          activeFilter
        );
      }

      return true;
    });
  }

  tasks.sort((a, b) => {
    if (activeSort === "date") {
      return (
        new Date(a.dueDate || "9999-12-31") -
        new Date(b.dueDate || "9999-12-31")
      );
    }

    if (activeSort === "priority") {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
      };

      return (
        (priorityOrder[a.priority] || 2) -
        (priorityOrder[b.priority] || 2)
      );
    }

    return a.title.localeCompare(
      b.title
    );
  });

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No tasks found</strong>
        <span>Add a task to get started.</span>
      </div>
    `;

    updateStats();
    return;
  }

  container.innerHTML = tasks
    .map(task => {
      const priority =
        task.priority.toLowerCase();

      return `
        <article
          class="task-card ${
            task.completed
              ? "task-completed"
              : ""
          }"
          data-task-id="${escapeHTML(
            task.id
          )}"
        >

          <button
            type="button"
            class="task-check"
            data-action="complete"
            data-task-id="${escapeHTML(
              task.id
            )}"
            aria-label="${
              task.completed
                ? "Mark task incomplete"
                : "Mark task complete"
            }"
          >
            ${
              task.completed
                ? "✓"
                : ""
            }
          </button>

          <div class="task-content">
            <h3>
              ${escapeHTML(task.title)}
            </h3>

            <span class="task-subject">
              ${escapeHTML(task.subject)}
            </span>

            ${
              task.dueDate
                ? `
                  <span class="task-due">
                    Due ${formatDate(
                      task.dueDate
                    )}
                  </span>
                `
                : ""
            }
          </div>

          <span
            class="task-priority priority-${priority}"
          >
            ${escapeHTML(
              task.priority
            )}
          </span>

          <button
            type="button"
            class="task-delete"
            data-action="delete"
            data-task-id="${escapeHTML(
              task.id
            )}"
            aria-label="Delete task"
          >
            ×
          </button>

        </article>
      `;
    })
    .join("");

  updateStats();
}

/* ---------- Statistics ---------- */

function updateStats() {
  const tasks = getUserTasks();

  const total = tasks.length;

  const completed = tasks.filter(
    task => task.completed
  ).length;

  const active = total - completed;

  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  setText(
    "[data-stat-total]",
    total
  );

  setText(
    "[data-stat-completed]",
    completed
  );

  setText(
    "[data-stat-active]",
    active
  );

  setText(
    "[data-stat-progress]",
    `${progress}%`
  );

  const progressBars =
    document.querySelectorAll(
      "[data-progress-bar]"
    );

  progressBars.forEach(bar => {
    bar.style.width = `${progress}%`;
  });
}

/* ---------- Event Delegation ---------- */

document.addEventListener(
  "click",
  function (event) {
    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) return;

    const action =
      button.dataset.action;

    const taskId =
      button.dataset.taskId;

    if (action === "complete") {
      toggleTask(taskId);
    }

    if (action === "delete") {
      deleteTask(taskId);
    }
  }
);

/* ---------- Filters ---------- */

document.addEventListener(
  "click",
  function (event) {
    const filterButton =
      event.target.closest(
        "[data-filter]"
      );

    if (!filterButton) return;

    activeFilter =
      filterButton.dataset.filter;

    document
      .querySelectorAll(
        "[data-filter]"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button === filterButton
        );
      });

    renderTasks();
  }
);

/* ---------- Sorting ---------- */

document.addEventListener(
  "change",
  function (event) {
    if (
      event.target.matches(
        "[data-sort]"
      )
    ) {
      activeSort =
        event.target.value;

      renderTasks();
    }
  }
);

/* ---------- Add Task Form ---------- */

document.addEventListener(
  "submit",
  function (event) {
    const form =
      event.target.closest(
        "[data-task-form]"
      );

    if (!form) return;

    event.preventDefault();

    const formData =
      new FormData(form);

    const task = addTask({
      title:
        formData.get("title"),

      subject:
        formData.get("subject"),

      priority:
        formData.get("priority"),

      dueDate:
        formData.get("dueDate")
    });

    if (!task) return;

    form.reset();

    renderTasks();

    const modal =
      document.querySelector(
        "[data-task-modal]"
      );

    if (modal) {
      modal.classList.remove("open");
    }
  }
);

/* ---------- Helpers ---------- */

function setText(selector, value) {
  document
    .querySelectorAll(selector)
    .forEach(element => {
      element.textContent = value;
    });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

/* ---------- Initialize ---------- */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    displayUserInfo();
    renderTasks();
  }
);