<template>
  <v-container class="todo-app mt-4">
    <!-- Header -->
    <v-row class="header" align="center">
  <!-- Centered Title -->
  <v-col cols="10" class="d-flex justify-center">
   <p> <span class="text-primary"> Hello <strong>{{ user.email }}</strong> <h1>Welcome to Todo App! </h1> </span> </p>
  </v-col>

  <!-- Right-aligned Logout Button -->
  <v-col cols="2" class="d-flex justify-end">
    <v-btn color="error" @click="logout" outlined>Logout</v-btn>
  </v-col>
</v-row>
<v-row>
  <v-col>
    
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
                @click="addTodo"
              ></v-btn>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-row>
    </v-form>

    <!-- Todo Summary -->
    <v-row>
      <v-col cols="8">
        <h2 class="text-h4 text-success ps-4">
          <span>Total Tasks:</span>
          <v-fade-transition leave-absolute>
            <span :key="`tasks-${data?.data?.length}`">
              {{ data?.data?.length || 0 }}
            </span>
          </v-fade-transition>
        </h2>
      </v-col>

      <v-col cols="4" class="d-flex justify-center align-center">
        <v-row>
          <v-col cols="6">
            <div>
              <h4>
                <span
                  >Completed: <strong>{{ completedTodos }}</strong></span
                >
              </h4>
              <h4>
                <span
                  >Remaining: <strong>{{ remainingTodos }}</strong></span
                >
              </h4>
            </div>
          </v-col>
          <v-col cols="6">
            <v-progress-circular
              v-model="completedPercentage"
              color="success"
              class="me-2"
              x-large
            ></v-progress-circular>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="mt-4"></v-divider>

    <!-- Todo List -->

    <!-- Loading State -->
    <v-alert v-if="loader" type="info" text outlined> Loading... </v-alert>

    <!-- Error State -->
    <v-alert v-if="error" type="error" text outlined>
      Error: {{ error.message }}
    </v-alert>

    <!-- Todo Items -->
    <v-container v-if="data?.data?.length">
      <v-list-item
        v-for="todo in data?.data"
        :key="todo.id"
        class="todo-item"
        rounded
      >
        <v-row align="center">
          <!-- Checkbox -->
          <v-col cols="2" md="2" sm="2">
            <v-checkbox
              v-model="todo.status"
              @click="toggleStatus(todo)"
              hide-details
            ></v-checkbox>
          </v-col>

          <!-- Task Title -->
          <v-col cols="8" md="8" sm="8">
            <v-list-item-title
              :class="{
                'text-decoration-line-through': todo.status,
                'text-body': !todo.status,
              }"
            >
              {{ todo.title }}
            </v-list-item-title>
          </v-col>

          <!-- Delete Button -->
          <v-col cols="2" md="2" sm="2">
            <v-icon color="error" @click="confirmDelete(todo.id)">
              mdi-delete
            </v-icon>
          </v-col>
        </v-row>
      </v-list-item>
    </v-container>

    <!-- Empty State -->
    <v-alert v-else type="info" text outlined>
      No todos yet! Add your first task.
    </v-alert>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>Are you sure you want to delete this task?</v-card-text>
        <v-card-actions>
          <v-btn color="grey" text @click="cancelDelete">Cancel</v-btn>
          <v-btn color="red" text @click="deleteTodoConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watchEffect } from "vue";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
// Reactive state variables
const newTodo = ref("");
let loader = ref(false);

// For managing the delete dialog visibility and selected todo ID
const deleteDialog = ref(false);
const todoToDelete = ref(null);

// Fetch todos with error handling
let { data, error, refresh } = await useFetch("/api/todos");

// Reactive counters for completed and remaining todos
const completedTodos = ref(0);
const remainingTodos = ref(0);

// Watch for changes in the fetched data and compute counts
watchEffect(() => {
  const todos = data?.value?.data || [];
  completedTodos.value = todos.filter((todo) => todo.status).length;
  remainingTodos.value = todos.filter((todo) => !todo.status).length;
});

// Function to add a new todo
const addTodo = async () => {
  loader.value = true;
  if (!newTodo.value.trim()) {
    alert("Please enter a todo title!");
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
    refresh(); // Refetch todos
    
  } catch (err) {
    alert(err.message || "An unexpected error occurred while adding the todo.");
  }finally{loader.value=false}
};

// Function to confirm the deletion of a todo
const confirmDelete = (id) => {
  todoToDelete.value = id;
  deleteDialog.value = true; // Open the delete confirmation dialog
};

// Function to delete a todo
const deleteTodoConfirm = async () => {
  loader.value = true;
  if (!todoToDelete.value) return;

  try {
    const response = await fetch(`/api/todos/${todoToDelete.value}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete the todo. Please try again.");
    }

    refresh();
    deleteDialog.value = false; // Close the dialog after deletion
    todoToDelete.value = null; // Clear the selected todo ID
  } catch (err) {
    alert(
      err.message || "An unexpected error occurred while deleting the todo."
    );
  }finally{loader.value=false}
};

// Function to cancel the delete action
const cancelDelete = () => {
  deleteDialog.value = false;
  todoToDelete.value = null;
};

// Function to toggle todo status
const toggleStatus = async (todo) => {
 loader.value = true;
  const updatedStatus = !todo.status;

  try {
    const response = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: updatedStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update the status. Please try again.");
    }

    refresh();
  } catch (err) {
    alert(
      err.message || "An unexpected error occurred while updating the status."
    );
  }finally{loader.value=false}
};

const totalTasks = computed(() => data?.value?.data?.length || 0);

const completedPercentage = computed(() =>
  totalTasks.value > 0
    ? Math.round((completedTodos.value / totalTasks.value) * 100)
    : 0
);

// Logout function
const logout = async () => {
  loader.value = true;
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
  }finally{loader.value=false}
};
</script>

<style scoped>
.todo-app {
  background: #f4f6f9;
  color: #333;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 20px;
}

.todo-form {
  margin-bottom: 20px;
}

.todo-item {
  margin-bottom: 10px;
  padding: 10px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.text-decoration-line-through {
  text-decoration: line-through;
  color: #999;
}
</style>
