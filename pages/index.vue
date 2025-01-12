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
        <v-btn :loading="loadingLogout" color="error" @click="logout" outlined >
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
    <v-row>
      <v-col cols="12" md="6" class="d-flex justify-start">
        <h1 class="text-success">
          <span>Total Tasks:</span>
          <v-fade-transition leave-absolute>
            <span :key="`tasks-${data?.data?.length}`">
              {{ data?.data?.length || 0 }}
            </span>
          </v-fade-transition>
        </h1>
      </v-col>

      <v-col cols="6" class="d-flex justify-center">
        <v-row class="d-flex align-center">
          <v-col cols="8" class="d-flex justify-center">
            <div>
              <h4 >
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
          <v-col cols="4">
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
    <v-alert v-if="loader" type="info" text outlined>
      <v-progress-circular indeterminate></v-progress-circular> Loading...
    </v-alert>

    <!-- Error State -->
    <v-alert v-if="error" type="error" text outlined>
      Error: {{ error.message }}
    </v-alert>

    <!-- Todo Items -->
  
    <!-- Todo Items -->
    <v-container v-if="sortedTodos?.length">
      <v-list-item
        v-for="todo in sortedTodos"
        :key="todo.id"
        class="todo-item"
        rounded
      >
        <v-row align="center">
          <!-- Checkbox -->
          <v-col cols="2" md="2" sm="2">
            <template v-if="loadingToggleStatus[todo.id]">
              <v-progress-circular
                :size="24"
                :width="4"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </template>
            <template v-else>
              <v-checkbox
                v-model="todo.status"
                @click="toggleStatus(todo)"
                hide-details
              ></v-checkbox>
            </template>
          </v-col>

          <!-- Task Title -->
          <v-col cols="8" md="4" sm="4">
            <v-list-item-title
              :class="{
                'text-decoration-line-through': todo.status,
                'text-body': !todo.status,
              }"
            >
              {{ todo.title }}
            </v-list-item-title>
          </v-col>
          
          <v-col cols="6" md="4" sm="4"   class="d-none d-sm-flex">
            <v-list-item-title
              :class="{
                'text-decoration-line-through': todo.status,
                'text-body': !todo.status,
              }"
            >
              {{dateRef.format(todo.createdAt,'fullDateTime12h') }}
            </v-list-item-title>
          </v-col>

          <!-- Delete Button with confirmation -->
          <v-col cols="2" md="2" sm="2">
            <template v-if="loadingDeleteTodo[todo.id]">
              <v-progress-circular
                :size="24"
                :width="4"
                color="error"
                indeterminate
              />
            </template>
            <template v-else>
              <v-btn icon="mdi-delete"
                color="error"
                @click="openDeleteDialog(todo)"
                variant="outlined"
                size="small"
              >
                
              </v-btn>
            </template>
          </v-col>
        </v-row>
      </v-list-item>
    </v-container>
    <!-- Empty State -->
    <v-alert v-else type="info" text outlined>
      No todos yet! Add your first task.
    </v-alert>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="deleteDialogVisible" max-width="400px">
      <v-card>
        <v-card-title class="headline">Are you sure you want to delete this task?</v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="deleteDialogVisible = false">Cancel</v-btn>
          <v-btn color="green" :loading="deleteLoading" @click="confirmDelete">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <AppSnackbar/>
  </v-container>
</template>

<script setup>
import { ref, watchEffect, computed } from "vue";
import { useDate } from 'vuetify'

const {
  
  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
  ShowSnackbar,
  HideSnackbar,
} = useSnackBar();

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const dateRef = useDate()
// Reactive state variables
const newTodo = ref("");
let loader = ref(false);
let loadingAddTodo = ref(false);
let loadingDeleteTodo = ref({}); // Initialize as an object to track each todo
let loadingToggleStatus = ref({});
const snackbar = ref({
  visible: false,
  message: "",
  color: "success", // 'success' or 'error'
});
let loadingLogout = ref(false);
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
let todoToDelete = ref(null); // Store the todo to delete

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
    refresh(); // Refetch todos
    ShowSnackbar("Todo added successfully!");
  } catch (err) {
    alert(err.message || "An unexpected error occurred while adding the todo.");
  } finally {
    loadingAddTodo.value = false;
  }
};
// Sort todos by 'createdAt' in ascending order (earliest first) and then reverse it
const sortedTodos = computed(() => {
  return (data?.value?.data || [])
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by 'createdAt' ascending
    .reverse(); // Reverse the sorted array to get the latest at the top
});

// Function to open the delete confirmation dialog
const openDeleteDialog = (todo) => {
  todoToDelete.value = todo; // Store the todo to delete
  deleteDialogVisible.value = true; // Show the dialog
};
// Function to confirm delete
const confirmDelete = async () => {
  if (!todoToDelete.value) return;

  deleteLoading.value = true; // Set loading state for delete button

  try {
    const response = await fetch(`/api/todos/${todoToDelete.value.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete the todo. Please try again.");
    }

    // Refetch todos after successful deletion
    refresh();
    ShowSnackbar("Todo deleted successfully!");
  } catch (err) {
    alert(
      err.message || "An unexpected error occurred while deleting the todo."
    );
  } finally {
    deleteDialogVisible.value = false; // Close the dialog
    deleteLoading.value = false; // Reset the loading state
  }
};
// Function to toggle todo status
const toggleStatus = async (todo) => {
  // Set loading state to true for the specific todo
  loadingToggleStatus.value[todo.id] = true;

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

    // Refetch todos after updating the status
    refresh();
    ShowSnackbar("Todo status updated successfully!");
  } catch (err) {
    alert(
      err.message || "An unexpected error occurred while updating the status."
    );
  } finally {
    // Set loading state back to false after the operation is completed
    loadingToggleStatus.value[todo.id] = false;
  }
};

const totalTasks = computed(() => data?.value?.data?.length || 0);

const completedPercentage = computed(() =>
  totalTasks.value > 0
    ? Math.round((completedTodos.value / totalTasks.value) * 100)
    : 0
);
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
