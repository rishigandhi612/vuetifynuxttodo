<template>
  <v-form @submit.prevent="handleAddTodo">
    <v-row>
      <!-- Input for new todo -->
      <v-text-field
        v-model="newTodo"
        label="What are you working on?"
        variant="solo"
        maxlength="100" 
        counter
        :disabled="loading"
        @keydown.enter="handleAddTodo"
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
              aria-label="Add todo"
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
  const todoTitle = newTodo.value.trim();

  if (!todoTitle) {
    ShowSnackbar("Please enter a valid todo title!", "warning");
    return;
  }

  loading.value = true;

  try {
    const addedTodo = await apiStore.addTodo({ title: todoTitle, status: false });

    if (addedTodo) {
      ShowSnackbar("Todo added successfully!", "success");
    }

    // Clear the input field
    newTodo.value = "";
  } catch (err) {
    console.error("Error adding todo:", err);
    ShowSnackbar(err.message || "Failed to add todo. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

</script>
