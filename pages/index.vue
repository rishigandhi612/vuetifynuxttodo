<template>
  <v-container class="todo-app mt-4">
    <!-- Header -->
    <v-row class="header" align="center">
      <!-- Centered Title -->
      <v-col cols="12" md="10" class="d-flex justify-center">
        <p>
          <span class="text-primary">
            Hello <strong>{{ user.email }}</strong>
            <h1>Welcome to Todo App!</h1>
          </span>
        </p>
      </v-col>

      <!-- Right-aligned Logout Button -->
      <v-col cols="12" md="2" class="d-flex justify-end">
        <v-btn :loading="loadingLogout" color="error" @click="logout" outlined>
          Logout
        </v-btn>
      </v-col>
    </v-row>

    <!-- Form to add a new todo -->
    <v-form @submit.prevent="addTodo" class="todo-form mt-4">
      <v-row>
        <v-text-field
          v-model="newTodo"
          label="What are you working on?"
          variant="solo"
          @keydown.enter="addTodo"
        >
          <template v-slot:append-inner>
            <v-fade-transition>
              <v-btn
                v-show="newTodo"
                icon="mdi-plus-circle"
                variant="text"
                :loading="loadingAddTodo"
                @click="addTodo"
              ></v-btn>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-row>
    </v-form>
    
    <!-- Todo Summary -->
    <TodoSummary /> 
    <!-- Todo Summary -->
    <v-divider class="mt-4"></v-divider>
 
    <!-- Todo List -->
    <TodoList />
    <!-- Todo List -->

    <!-- Snackbar -->
    <AppSnackbar />
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const {
  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
  ShowSnackbar,
  HideSnackbar,
} = useSnackBar();

const supabase = useSupabaseClient();
const user = useSupabaseUser();
let loadingLogout = ref(false);
// Reactive state variables
const newTodo = ref("");
let loadingAddTodo = ref(false);

// Function to add a new todo
const addTodo = async () => {
  loadingAddTodo.value = true;
  if (!newTodo.value.trim()) {
    alert("Please enter a todo title!");
    loadingAddTodo.value = false;
    return;
  }
  try {
    const response = await fetch("/api/todos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo.value, status: false }),
    });

    if (!response.ok) {
      throw new Error("Failed to add the todo. Please try again.");
    }

    newTodo.value = ""; // Reset input
    fetchtodo(); // Refetch todos
    ShowSnackbar("Todo added successfully!");
  } catch (err) {
    alert(err.message || "An unexpected error occurred while adding the todo.");
  } finally {
    loadingAddTodo.value = false;
  }
};

// Logout function
const logout = async () => {
  loadingLogout.value = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
      alert("An error occurred while signing out. Please try again.");
    } else {
      console.log("User signed out successfully.");
      alert("You have been logged out successfully.");
      navigateTo("/login");
    }
  } catch (err) {
    console.error("Unexpected error during sign out:", err.message);
    alert("An unexpected error occurred during the sign out process.");
  } finally {
    loadingLogout.value = false;
  }
};
</script>
