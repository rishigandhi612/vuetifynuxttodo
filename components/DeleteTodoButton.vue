<template>
    <div>
      <!-- Delete Button -->
      <v-btn
        icon="mdi-delete"
        color="error"
        @click="openDialog"
        variant="outlined"
        size="small"
      ></v-btn>
  
      <!-- Confirmation Dialog -->
      <v-dialog v-model="dialogVisible" max-width="400px">
        <v-card>
          <v-card-title class="headline">
            Are you sure you want to delete this task?
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="cancel">Cancel</v-btn>
            <v-btn :loading="loading" color="green" @click="confirm">Confirm</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  // Props
  const props = defineProps({
    todo: { type: Object, required: true }, // Define the `todo` prop
  });
  
  // Emit event
  const emit = defineEmits(["delete"]);
  
  // State
  const dialogVisible = ref(false);
  const loading = ref(false);
  
  // Open dialog
  const openDialog = () => {
    dialogVisible.value = true; // Open the dialog when delete button is clicked
  };
  
  // Cancel dialog
  const cancel = () => {
    dialogVisible.value = false; // Close the dialog without taking action
  };
  
  // Confirm delete
  const confirm = async () => {
    if (!props.todo || !props.todo.id) {
      console.error("Todo is not defined or invalid.");
      return;
    }
  
    loading.value = true;
  
    try {
      const response = await fetch(`/api/todos/${props.todo.id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete the todo. Please try again.");
      }
  
      emit("delete", props.todo); // Emit delete event to parent
      fetchtodo();
    } catch (err) {
      console.error(err.message || "An unexpected error occurred while deleting the todo.");
    } finally {
      loading.value = false;
      dialogVisible.value = false; // Close the dialog after the action
    }
  };
  </script>
  