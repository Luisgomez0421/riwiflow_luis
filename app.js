const API_URL = "http://localhost:3000";

const user = JSON.parse(localStorage.getItem("user"));

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");

const logoutBtn = document.getElementById("logoutBtn");
const createTaskBtn = document.getElementById("createTaskBtn");

userName.textContent = user.name;
userRole.textContent = user.role;

// Show create button only for admin

if (user.role === "admin") {
  createTaskBtn.classList.remove("hidden");
}

// Logout

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");

  window.location.href = "./login.html";
});

// Load tasks

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`);

    const tasks = await response.json();

    clearColumns();

    tasks.forEach((task) => {
      renderTask(task);
    });
  } catch (error) {
    console.error(error);

    alert("Error loading tasks");
  }
}

// Clear columns before render

function clearColumns() {
  document.getElementById("todo").innerHTML = "";

  document.getElementById("in-progress").innerHTML = "";

  document.getElementById("in-review").innerHTML = "";

  document.getElementById("done").innerHTML = "";
}

// Render task card

function renderTask(task) {
  const column = document.getElementById(task.status);

  const canEdit =
    user.role === "admin" ||
    (user.role === "coder" && task.userId === user.id);

  const card = document.createElement("div");

  card.className =
    "task-card bg-white rounded-xl p-4 shadow-sm border border-gray-200";

  card.innerHTML = `
  
    <h3 class="font-bold text-lg mb-2">
      ${task.title}
    </h3>

    <p class="text-gray-600 mb-4">
      ${task.description}
    </p>

    <p class="text-sm text-gray-400 mb-4">
      Assigned User ID: ${task.userId}
    </p>

    ${
      canEdit
        ? `
    
      <div class="space-y-3">

        ${
          user.role === "admin"
            ? `
          <input
            id="title-${task.id}"
            type="text"
            value="${task.title}"
            class="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            id="description-${task.id}"
            class="w-full border rounded-lg px-3 py-2"
          >${task.description}</textarea>

          <input
            id="user-${task.id}"
            type="number"
            value="${task.userId}"
            class="w-full border rounded-lg px-3 py-2"
          />
        `
            : `
          <textarea
            id="description-${task.id}"
            class="w-full border rounded-lg px-3 py-2"
          >${task.description}</textarea>
        `
        }

        <select
          id="status-${task.id}"
          class="w-full border rounded-lg px-3 py-2"
        >
          <option
            value="todo"
            ${task.status === "todo" ? "selected" : ""}
          >
            Todo
          </option>

          <option
            value="in-progress"
            ${task.status === "in-progress" ? "selected" : ""}
          >
            In Progress
          </option>

          <option
            value="in-review"
            ${task.status === "in-review" ? "selected" : ""}
          >
            In Review
          </option>

          <option
            value="done"
            ${task.status === "done" ? "selected" : ""}
          >
            Done
          </option>
        </select>

        <button
          onclick="updateTask(${task.id})"
          class="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg"
        >
          Save Changes
        </button>

      </div>
    
    `
        : `
      <p class="text-red-500 text-sm font-medium">
        You cannot edit this task
      </p>
    `
    }

  `;

  column.appendChild(card);
}

// Update task

async function updateTask(taskId) {
  try {
    const taskResponse = await fetch(`${API_URL}/tasks/${taskId}`);

    const task = await taskResponse.json();

    // Coder restriction

    if (
      user.role === "coder" &&
      task.userId !== user.id
    ) {
      alert("You cannot edit this task");

      return;
    }

    let updatedTask = {
      status: document.getElementById(`status-${taskId}`).value,
      description: document.getElementById(`description-${taskId}`).value,
    };

    // Admin permissions

    if (user.role === "admin") {
      updatedTask.title =
        document.getElementById(`title-${taskId}`).value;

      updatedTask.userId = Number(
        document.getElementById(`user-${taskId}`).value
      );
    }

    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedTask),
    });

    loadTasks();

  } catch (error) {
    console.error(error);

    alert("Error updating task");
  }
}

// Create task (admin only)

createTaskBtn.addEventListener("click", async () => {
  if (user.role !== "admin") {
    return;
  }

  const title = prompt("Task title");

  if (!title) return;

  const description = prompt("Task description");

  const userId = Number(
    prompt("Assign task to user ID")
  );

  const newTask = {
    title,
    description,
    status: "todo",
    userId,
  };

  try {
    await fetch(`${API_URL}/tasks`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newTask),
    });

    loadTasks();

  } catch (error) {
    console.error(error);

    alert("Error creating task");
  }
});

// Initial load

loadTasks();