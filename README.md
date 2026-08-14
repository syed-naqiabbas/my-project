# 📚 StudyTrack — Student Task Manager

> Web Development Midterm Project | 2025

---

## 1. Project Title

**StudyTrack — Student Task Manager**

A complete student productivity web application built with pure HTML5, CSS3, and Vanilla JavaScript.

---

## 2. Team Members

| Role | Member |
|------|--------|
| HTML Structure & Layout | Member 1: [Name] |
| CSS3 / UI Design & Responsiveness | Member 2: [Name] |
| JavaScript / Auth / Task Logic | Member 3: [Name] |

---

## 3. Problem Statement

Students often struggle to track multiple assignments, projects, and deadlines across different subjects. Without a centralized system, tasks get forgotten, priorities get mixed up, and deadlines get missed — causing stress and poor academic performance.

---

## 4. Project Solution

StudyTrack is a browser-based student task manager that allows students to:

- Create a personal account and log in securely (demo authentication)
- Manage all assignments and tasks in one organized dashboard
- Set priorities, due dates, and subjects for each task
- Filter, search, and sort tasks to find what matters most
- Track overall progress with live statistics

All data is saved in the browser using **localStorage** — no internet connection or server required after the initial page load.

---

## 5. Features

### Authentication
- ✅ User Registration with Full Name, Username, and Password
- ✅ Login with username/password validation
- ✅ Show/Hide password toggle
- ✅ "Remember Me" functionality
- ✅ Logout (session cleared, account preserved)
- ✅ Duplicate username prevention
- ✅ Protected dashboard (cannot access without login)
- ✅ Auto-redirect if already logged in

### Dashboard
- ✅ Personalized welcome message with greeting
- ✅ 4 live stat cards: Total, Pending, Completed, Due Soon
- ✅ Overall progress bar
- ✅ Recent tasks preview (4 most recent)

### Task Management
- ✅ Add Task (Title, Subject, Description, Due Date, Priority)
- ✅ Edit Task (pre-filled form in modal)
- ✅ Delete Task (confirmation required)
- ✅ Mark Complete / Mark Pending (toggle)
- ✅ Priority levels: High, Medium, Low (color-coded)
- ✅ Overdue and due-soon visual indicators
- ✅ 4 demo tasks auto-created on first registration

### Search & Filters
- ✅ Live search by title, subject, or description
- ✅ Filter by Status: All / Pending / Completed
- ✅ Filter by Priority: All / High / Medium / Low
- ✅ Sort by: Newest / Oldest / Due Date / Priority
- ✅ Clear filters button

### Profile
- ✅ Shows Full Name, Username, Member Since date
- ✅ Live task statistics (Total / Completed / Pending)
- ✅ Logout button

### UX & Design
- ✅ Sidebar navigation with active state
- ✅ Mobile responsive with slide-in sidebar drawer
- ✅ Toast notifications for all actions
- ✅ Empty state messages
- ✅ Form validation with inline error messages
- ✅ CSS Grid used meaningfully throughout

---

## 6. Authentication System

StudyTrack uses a **frontend-only demo authentication system** built with localStorage.

**How it works:**

1. When a user registers, their account (name, username, password) is saved in `localStorage` under the key `studytrack_users`.
2. When a user logs in, the app checks the entered credentials against the saved users array.
3. Upon successful login, the username is saved as a session under `studytrack_session`.
4. Every protected page (`index.html`) checks for this session key. If it doesn't exist, the user is redirected to `login.html`.
5. Logout removes the session key, but keeps the user account and tasks.

**⚠️ Important Notice:**
This is a **demonstration authentication system only**. Passwords are stored in plain text in the browser's localStorage. This is acceptable for a frontend academic project but is **NOT suitable for any real-world application**.

---

## 7. User-Specific Task Storage

Each user's tasks are stored separately in localStorage using a **user-specific key**.

**Key format:**
```
tasks_{username}
```

**Examples:**
```
tasks_ali123      → Ali's tasks
tasks_ahmed456    → Ahmed's tasks
tasks_student01   → Student01's tasks
```

When a user logs in, only their own tasks are loaded. When they add, edit, or delete a task, changes are saved only under their key. Different users **never see each other's tasks**.

---

## 8. Technologies Used

| Technology | Usage |
|-----------|-------|
| **HTML5** | Page structure, semantic elements, forms |
| **CSS3** | Styling, CSS Grid layout, CSS custom properties (variables), responsive design |
| **Vanilla JavaScript** | Authentication logic, task CRUD, DOM manipulation, localStorage |
| **localStorage** | Persistent data storage for users, tasks, and session |

> No frameworks, libraries, or external dependencies were used.

---

## 9. Project Structure

```
StudyTrack/
│
├── index.html       → Main dashboard (protected, requires login)
├── login.html       → Login page (entry point)
├── register.html    → User registration page
├── style.css        → All CSS styles (auth + dashboard + responsive)
├── auth.js          → Authentication logic (register, login, logout, session)
├── script.js        → Dashboard logic (tasks, filters, UI, navigation)
└── README.md        → Project documentation
```

**File responsibilities (good for team division):**
- `index.html` + `login.html` + `register.html` → **Member 1** (HTML structure)
- `style.css` → **Member 2** (CSS, layout, responsive design)
- `auth.js` + `script.js` → **Member 3** (JavaScript logic)

---

## 10. How to Run Locally

No installation or server required.

**Steps:**

1. **Download or clone the project:**
   ```bash
   git clone https://github.com/your-username/studytrack.git
   cd studytrack
   ```

2. **Open `login.html` in your browser:**
   - Double-click `login.html` in File Explorer, **OR**
   - Right-click → Open with → Your browser, **OR**
   - Use **VS Code Live Server** extension (right-click → "Open with Live Server")

3. **Register a new account** on the registration page.

4. **Log in** and start managing your tasks!

> **Important:** Always open `login.html` as the entry point, not `index.html` directly.

---

## 11. How localStorage Works in This Project

| Key | Type | Contents |
|-----|------|---------|
| `studytrack_users` | JSON Array | All registered user accounts |
| `studytrack_session` | String | Currently logged-in username |
| `studytrack_remember` | String | Saved username for "Remember Me" |
| `tasks_{username}` | JSON Array | Task list for each specific user |

**localStorage lifecycle:**
- **Register** → user added to `studytrack_users`, demo tasks saved to `tasks_{username}`
- **Login** → `studytrack_session` = `username` is set
- **Add Task** → `tasks_{username}` is updated
- **Logout** → `studytrack_session` is removed (account and tasks remain)
- **Re-login** → session restored, all previous tasks are still there

---

## 12. Vercel Deployment

To deploy this project on [Vercel](https://vercel.com) for free:

1. Push the project to a **GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — StudyTrack"
   git remote add origin https://github.com/your-username/studytrack.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click **"Add New Project"** → Select your repository

4. Vercel auto-detects it as a **static site** — no build configuration needed

5. Click **Deploy** — your project will be live in seconds!

6. Share your URL (e.g., `https://studytrack-username.vercel.app`)

> **Entry point note:** Vercel will serve `login.html` when you navigate to it. Make sure to share the URL with `/login.html` as the starting page.

---

## 13. Limitations

Because this project uses only frontend JavaScript and localStorage:

1. **Passwords are NOT encrypted** — Passwords are stored in plain text in localStorage. Anyone who can access a user's browser can read them.

2. **No real authentication security** — A tech-savvy user could manually set the `studytrack_session` key to any username and bypass the login.

3. **Data is browser-specific** — Tasks saved on Chrome on one computer won't appear on another computer or browser. There is no cloud sync.

4. **localStorage is limited** — Most browsers allow only ~5MB of localStorage per domain.

5. **No password recovery** — There is no "Forgot Password" feature since there is no email or server backend.

> **Note:** All of these limitations are expected and acceptable for a frontend academic demonstration project.

---

## 14. Future Improvements

If this project were to be developed further:

- 🔐 **Real backend authentication** using Node.js/Express or Firebase with proper password hashing (bcrypt)
- ☁️ **Cloud database** (MongoDB, Firebase Firestore) so data syncs across devices
- 📧 **Email verification** and password reset functionality
- 🔔 **Browser push notifications** for upcoming deadlines
- 📊 **Analytics page** with charts showing study habits over time
- 🌙 **Dark mode** toggle
- 📁 **Multiple task boards** (by semester, course, or project)
- 📤 **Export tasks** to PDF or CSV
- 🏷️ **Custom tags** for more flexible organization
- 📱 **Progressive Web App (PWA)** so it can be installed on mobile devices
- 👥 **Group task sharing** for collaborative assignments

---

*StudyTrack — Web Development Midterm Project | 2025*
*Built with HTML5, CSS3, and Vanilla JavaScript*
