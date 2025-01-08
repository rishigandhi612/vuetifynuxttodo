<template>
    <div class="todo-container">
      <NuxtRouteAnnouncer />
      <header class="todo-header">
        <h1>TODO App</h1>
        <button class="logout-button" @click="logoutUser">Logout</button>
      </header>
  
      <div class="user-info">
        <p>Welcome, {{ user?.email }}</p>
        <p>Last Login: {{ user?.last_sign_in_at }}</p>
      </div>
  
      <section class="todo-form-section">
        <form @submit.prevent="addTodo" class="todo-form">
          <input
            v-model="newTodo"
            type="text"
            class="todo-input"
            placeholder="Enter a new todo"
          />
          <button type="submit" class="add-button">Add Todo</button>
        </form>
      </section>
  
      <section class="todo-list-section">
        <ul class="todo-list">
          <li
            v-for="todo in todos"
            :key="todo.id"
            class="todo-item"
            :class="{ completed: todo.completed }"
          >
            <span class="todo-text">{{ todo.text }}</span>
            <div class="todo-actions">
              <button class="toggle-button" @click="toggleComplete(todo)">
                {{ todo.completed ? "Unmark" : "Complete" }}
              </button>
              <button class="delete-button" @click="deleteTodo(todo.id)">Delete</button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  
  const todos = ref([]);
  const newTodo = ref("");
  
  const logoutUser = async () => {
    await supabase.auth.signOut();
    navigateTo("/login");
  };
  
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });
  
    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      todos.value = data;
    }
  };
  
  const addTodo = async () => {
    if (newTodo.value.trim() === "") return;
  
    const { data, error } = await supabase
      .from("todos")
      .insert([{ text: newTodo.value, completed: false }]);
  
    if (error) {
      console.error("Error adding todo:", error);
      return;
    }
  
    if (data) {
      todos.value.push(...data);
      newTodo.value = "";
    }
    fetchTodos();
  };
  
  const toggleComplete = async (todo) => {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);
  
    if (error) {
      console.error("Error toggling complete:", error);
    } else {
      todo.completed = !todo.completed;
    }
  };
  
  const deleteTodo = async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
  
    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      todos.value = todos.value.filter((todo) => todo.id !== id);
    }
  };
  
  onMounted(() => {
    fetchTodos();
  });
  </script>
  
  <style scoped>
  .todo-container {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .todo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .logout-button {
    background: #ff4d4f;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .logout-button:hover {
    background: #e04344;
  }
  
  .user-info {
    margin-bottom: 20px;
    font-size: 14px;
    color: #555;
  }
  
  .todo-form-section {
    margin-bottom: 20px;
  }
  
  .todo-form {
    display: flex;
    gap: 10px;
  }
  
  .todo-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .add-button {
    background: #4caf50;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .add-button:hover {
    background: #43a047;
  }
  
  .todo-list-section {
    margin-top: 20px;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .todo-item.completed .todo-text {
    text-decoration: line-through;
    color: #aaa;
  }
  
  .todo-actions button {
    margin-left: 10px;
    border: none;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .toggle-button {
    background: #2196f3;
    color: #fff;
  }
  
  .toggle-button:hover {
    background: #1976d2;
  }
  
  .delete-button {
    background: #ff4d4f;
    color: #fff;
  }
  
  .delete-button:hover {
    background: #e04344;
  }
  </style>
  