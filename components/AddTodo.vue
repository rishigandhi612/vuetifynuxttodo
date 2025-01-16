<template>
  <v-form @submit.prevent="handleAddTodo">
    <v-row>
      <!-- Input for new todo -->
      <v-text-field
        v-model="newTodo"
        label="What are you working on?"
        variant="solo"
        @keydown.enter="handleAddTodo"
        :disabled="loading"
      >
        <template v-slot:append-inner>
          <!-- Add Button -->
          <v-fade-transition>
            <v-btn
              v-show="newTodo.trim()"
              icon="mdi-plus-circle"
              variant="text"
              :loading="loading"
              @click="handleAddTodo"
            ></v-btn>
          </v-fade-transition>
        </template>
      </v-text-field>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from "vue";
import { useMyApiStore } from "@/stores/myApiStore";

// Access the store and snackbar
const apiStore = useMyApiStore();
const { ShowSnackbar } = useSnackBar();

// Reactive state for the new todo and loading status
const newTodo = ref("");
const loading = ref(false);

// Function to handle adding a new todo
const handleAddTodo = async () => {
  if (!newTodo.value.trim()) {
    ShowSnackbar("Please enter a valid todo title!", "warning");
    return;
  }

  loading.value = true;

  try {
    // Call the store action to add a new todo
    await apiStore.addTodo({ title: newTodo.value, status: false });
    ShowSnackbar("Todo added successfully!", "success");

    // Reset the input field
    newTodo.value = "";

    // Optional: Emit an event if this component is a child
    // emit("todoAdded");
  } catch (err) {
    console.error("Error adding todo:", err);
    ShowSnackbar("Failed to add todo. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};
</script>
