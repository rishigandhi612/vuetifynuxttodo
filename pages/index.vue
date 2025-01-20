<template>
  <v-theme-provider :theme="isDarkMode ? 'dark' : 'light'" with-background>
    <v-app>
      <v-container>
        <HeaderComponent :is-dark-mode="isDarkMode" @toggle-theme="toggleTheme" />
        
        <!-- Form to add a new todo -->
        <v-divider class="my-10"></v-divider>
        <AddTodo />
        
        <!-- Todo Summary -->
        <TodoSummary />
        
        <!-- Todo List -->
        <TodoList />
        
        <!-- Snackbar -->
        <AppSnackbar />
      </v-container>
    </v-app>
  </v-theme-provider>
</template>

<script setup>
import { ref } from 'vue';

const isDarkMode = ref(false);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>
