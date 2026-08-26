const API_URL = "/api";

let tasks = [];
let currentUser = null;
let currentFilter = "all";

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const logoutBtn = document.getElementById("logoutBtn");

const welcomeMessage = document.getElementById("welcomeMessage");
const notification = document.getElementById("notification");

const taskForm = document.getElementById("taskForm");
const taskId = document.getElementById("taskId");
const title = document.getElementById("title");
const description = document.getElementById("description");
const dueDate = document.getElementById("dueDate");
const completed = document.getElementById("completed");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

const taskList = document.getElementById("taskList");
const loading = document.getElementById("loading");
const emptyMessage = document.getElementById("emptyMessage");


// INITIAL CHECK
document.addEventListener("DOMContentLoaded", checkAuthentication);


// AUTH TABS
loginTab.addEventListener("click", () => {
    loginForm.hidden = false;
    signupForm.hidden = true;

    loginTab.classList.add("active");
    signupTab.classList.remove("active");
});

signupTab.addEventListener("click", () => {
    loginForm.hidden = true;
    signupForm.hidden = false;

    signupTab.classList.add("active");
    loginTab.classList.remove("active");
});


// SIGNUP
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("signupName").value.trim(),
                email: document.getElementById("signupEmail").value.trim(),
                password: document.getElementById("signupPassword").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showNotification(
            "Account created successfully. Please log in.",
            "success"
        );

        signupForm.reset();
        loginTab.click();

    } catch (error) {
        showNotification(error.message, "error");
    }
});


// LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value.trim(),
                password: document.getElementById("loginPassword").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        currentUser = data.user;

        loginForm.reset();

        showDashboard();
        await fetchTasks();

    } catch (error) {
        showNotification(error.message, "error");
    }
});


// CHECK LOGIN SESSION
async function checkAuthentication() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include"
        });

        if (!response.ok) {
            showLogin();
            return;
        }

        const data = await response.json();

        currentUser = data.user;

        showDashboard();
        await fetchTasks();

    } catch (error) {
        showLogin();
    }
}


// LOGOUT
logoutBtn.addEventListener("click", async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });

        currentUser = null;
        tasks = [];

        showLogin();

    } catch (error) {
        showNotification(
            "Unable to log out.",
            "error"
        );
    }
});


// FETCH TASKS
async function fetchTasks() {

    loading.hidden = false;
    emptyMessage.hidden = true;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            credentials: "include"
        });

        if (response.status === 401) {
            showLogin();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        tasks = data;

        renderTasks();

    } catch (error) {
        showNotification(
            "Unable to load tasks: " + error.message,
            "error"
        );
    } finally {
        loading.hidden = true;
    }
}


// CREATE / UPDATE
taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = taskId.value;

    const taskData = {
        title: title.value.trim(),
        description: description.value.trim(),
        completed: completed.checked,
        dueDate: dueDate.value
            ? new Date(dueDate.value).toISOString()
            : undefined
    };

    if (!taskData.title) {
        showNotification(
            "Title is required.",
            "error"
        );
        return;
    }

    try {

        const response = await fetch(
            id
                ? `${API_URL}/tasks/${id}`
                : `${API_URL}/tasks`,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(taskData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (id) {
            tasks = tasks.map((task) =>
                task._id === id ? data : task
            );

            showNotification(
                "Task updated successfully.",
                "success"
            );

        } else {
            tasks.unshift(data);

            showNotification(
                "Task created successfully.",
                "success"
            );
        }

        resetForm();
        renderTasks();

    } catch (error) {
        showNotification(error.message, "error");
    }
});


// DELETE
async function deleteTask(id) {

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        tasks = tasks.filter(
            (task) => task._id !== id
        );

        renderTasks();

        showNotification(
            "Task deleted successfully.",
            "success"
        );

    } catch (error) {
        showNotification(error.message, "error");
    }
}


// TOGGLE COMPLETION
async function toggleTask(id, isCompleted) {

    try {

        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    completed: isCompleted
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        tasks = tasks.map((task) =>
            task._id === id ? data : task
        );

        renderTasks();

    } catch (error) {

        showNotification(
            error.message,
            "error"
        );

        fetchTasks();
    }
}


// EDIT
function editTask(id) {

    const task = tasks.find(
        (item) => item._id === id
    );

    if (!task) return;

    taskId.value = task._id;
    title.value = task.title;
    description.value = task.description || "";
    completed.checked = Boolean(task.completed);

    if (task.dueDate) {
        const date = new Date(task.dueDate);

        dueDate.value = new Date(
            date.getTime() -
            date.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 16);
    } else {
        dueDate.value = "";
    }

    formTitle.textContent = "Edit Task";
    submitBtn.textContent = "Update Task";
    cancelBtn.hidden = false;

    title.focus();
}


// RESET FORM
function resetForm() {

    taskForm.reset();

    taskId.value = "";

    formTitle.textContent = "Add New Task";
    submitBtn.textContent = "Add Task";

    cancelBtn.hidden = true;
}

cancelBtn.addEventListener(
    "click",
    resetForm
);


// FILTERS
document
    .querySelectorAll(".filter-btn")
    .forEach((button) => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".filter-btn")
                .forEach((btn) =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            currentFilter =
                button.dataset.filter;

            renderTasks();
        });
    });


// RENDER TASKS
function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        emptyMessage.hidden = false;
        return;
    }

    emptyMessage.hidden = true;

    filteredTasks.forEach((task) => {

        const item = document.createElement("article");

        item.className =
            `task-item ${task.completed ? "is-completed" : ""}`;

        const left = document.createElement("div");

        left.className = "task-left";

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.completed);
        checkbox.setAttribute(
            "aria-label",
            "Toggle task completion"
        );

        checkbox.addEventListener(
            "change",
            () => toggleTask(
                task._id,
                checkbox.checked
            )
        );

        const details =
            document.createElement("div");

        details.className = "task-details";

        const taskTitle =
            document.createElement("h3");

        taskTitle.textContent = task.title;

        const taskDescription =
            document.createElement("p");

        taskDescription.textContent =
            task.description || "No description";

        details.appendChild(taskTitle);
        details.appendChild(taskDescription);

        if (task.dueDate) {

            const date =
                document.createElement("small");

            date.textContent =
                `Due: ${new Date(task.dueDate).toLocaleString()}`;

            details.appendChild(date);
        }

        left.appendChild(checkbox);
        left.appendChild(details);

        const actions =
            document.createElement("div");

        actions.className = "task-actions";

        const editButton =
            document.createElement("button");

        editButton.textContent = "Edit";

        editButton.addEventListener(
            "click",
            () => editTask(task._id)
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener(
            "click",
            () => deleteTask(task._id)
        );

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        item.appendChild(left);
        item.appendChild(actions);

        taskList.appendChild(item);
    });
}


// UI
function showDashboard() {

    authSection.hidden = true;
    dashboardSection.hidden = false;

    welcomeMessage.textContent =
        `Welcome, ${currentUser.name}`;
}

function showLogin() {

    authSection.hidden = false;
    dashboardSection.hidden = true;
}

function showNotification(message, type) {

    notification.textContent = message;

    notification.className = type;

    setTimeout(() => {
        notification.textContent = "";
        notification.className = "";
    }, 4000);
}