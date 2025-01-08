<template>
  <div class="todo-app">
    <header class="header">
      <h1>TODO App</h1>
    </header>

    <main class="main-content">
      <!-- Form to add a new todo -->
      <form @submit.prevent="addTodo" class="todo-form">
        <input
          v-model="newTodo"
          type="text"
          placeholder="Add a new todo"
          class="todo-input"
        />
        <button type="submit" class="add-button">Add</button>
      </form>

      <!-- List of todo items -->
      <ul class="todo-list">
        <!-- Loading state -->
        <p v-if="!data" class="loading-text">Loading...</p>
        
        <!-- Error state -->
        <p v-if="error" class="error-text">Error: {{ error.message }}</p>

        <!-- Iterate through the todo items if data is available -->
        <li v-for="todo in data?.data" :key="todo.id" class="todo-item">
          <span :class="{ completed: todo.status }" class="todo-title">
            {{ todo.title }}
          </span>

          <!-- Toggle status button -->
          <button @click="toggleStatus(todo)" class="toggle-button">
            {{ todo.status ? 'Mark Incomplete' : 'Mark Complete' }}
          </button>

          <!-- Delete button -->
          <button @click="deleteTodo(todo.id)" class="delete-button">Delete</button>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Reactive variable for new todo input
const newTodo = ref('');

// Fetch todos and handle loading and errors
let { data, error, refresh } = await useFetch('/api/todos');
console.log('Fetched data:', data);  // Log the fetched data
console.log('Error:', error);        // Log errors if any

// Function to add a new todo with validation and error handling
const addTodo = async () => {
  if (!newTodo.value.trim()) {
    alert("Please enter a todo title!");
    return; // Prevent adding an empty todo
  }

  try {
    // POST request to create a new todo
    const response = await fetch('/api/todos/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo.value , status: false }),
    });

    if (!response.ok) {
      throw new Error("Failed to add the todo. Please try again.");
    }

    // Clear input field
    newTodo.value = '';

    // Refetch the todo list after adding the new todo
    refresh();
  } catch (err) {
    alert(err.message || "An unexpected error occurred while adding the todo.");
  }
};

// Delete Todo function with error handling
const deleteTodo = async (id) => {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error("Failed to delete the todo. Please try again.");
    }

    // Refetch the todos after deleting
    refresh();  // This will re-fetch the data and update the UI
  } catch (err) {
    alert(err.message || "An unexpected error occurred while deleting the todo.");
  }
};

// Function to toggle the todo's status (complete/incomplete) with error handling
const toggleStatus = async (todo) => {
  const updatedStatus = !todo.status; // Toggle the current status

  try {
    const response = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: updatedStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update the status. Please try again.");
    }

    // Refetch the todo list after updating the status
    refresh();
  } catch (err) {
    alert(err.message || "An unexpected error occurred while updating the status.");
  }
};
</script>

<style scoped>
/* General Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

/* Main app styling */
.todo-app {
  background: #f4f6f9;
  color: #333;
  max-width: 600px;
  margin: 30px auto;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: background 0.3s ease;
}

.todo-app:hover {
  background: #e0e5ec;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 36px;
  color: #3a3a3a;
}

/* Form and input styling */
.todo-form {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.todo-input {
  flex-grow: 1;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.todo-input:focus {
  border-color: #4c90f5;
}

.add-button {
  padding: 10px 20px;
  background-color: #4c90f5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #3578d0;
}

/* Todo list styling */
.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.todo-item:hover {
  background-color: #f4f8fc;
}

.todo-title {
  font-size: 18px;
  color: #333;
  text-decoration: none;
  transition: text-decoration 0.3s ease;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #888;
}

.toggle-button,
.delete-button {
  background-color: transparent;
  border: none;
  color: #4c90f5;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.toggle-button:hover,
.delete-button:hover {
  color: #3578d0;
}

/* Loading and error messages */
.loading-text,
.error-text {
  text-align: center;
  color: #888;
  font-size: 18px;
  margin: 20px 0;
}

.error-text {
  color: red;
}
</style>
