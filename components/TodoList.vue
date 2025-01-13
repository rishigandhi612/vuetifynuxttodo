<template>
    <v-container>
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

    </v-container>
</template>

<script setup>
import { ref , computed } from "vue";
import { useDate } from 'vuetify'

let loader = ref(false);
const {
  
  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
  ShowSnackbar,
  HideSnackbar,
} = useSnackBar();
const dateRef = useDate()
let loadingDeleteTodo = ref({}); // Initialize as an object to track each todo
let loadingToggleStatus = ref({});
const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
let todoToDelete = ref(null); // Store the todo to delete
// Fetch todos with error handling
let { data, error } = await fetchtodo();

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
    fetchtodo();
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
    fetchtodo();
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
</script>