<template>
    <v-app-bar color="success">
      <!-- Application Name -->
      <v-toolbar-title>
        <span class="text-h5">Todo</span>
      </v-toolbar-title>
  
      <!-- Spacer -->
      <v-spacer></v-spacer>
  
      <!-- Refresh Button -->
      <v-btn icon @click="refreshTodos" :loading="loadingRefresh">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
  
      <!-- View Toggle Button -->
      <v-btn icon @click="myApiStore.toggleView">
        <v-icon>{{ myApiStore.isGridView ? "mdi-format-list-checkbox" : "mdi-grid" }}</v-icon>
      </v-btn>
  
      <!-- Theme Toggle Button -->
      <v-btn icon @click="toggleTheme">
        <v-icon>{{
          isDarkMode ? "mdi-white-balance-sunny" : "mdi-moon-waning-crescent"
        }}</v-icon>
      </v-btn>
  
      <!-- User Avatar -->
      <v-avatar @click="showDialog = true" class="cursor-pointer" size="36">
        <v-icon icon="mdi-account-circle"></v-icon>
      </v-avatar>
  
      <!-- Logout Dialog -->
      <v-dialog v-model="showDialog" max-width="300">
        <v-card>
          <v-card-text class="text-h6">
            {{ user?.email }}
  
            <v-btn
              :loading="loadingLogout"
              color="error"
              block
              outlined
              @click="logout"
            >
              Logout
            </v-btn>
          </v-card-text>
          <v-card-actions>
            <v-btn text block @click="showDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useMyApiStore } from "../stores/myApiStore"; // Import the store
  
  const myApiStore = useMyApiStore(); // Use the store
  
  const isDarkMode = ref(false);
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };
  
  const showDialog = ref(false);
  const loadingLogout = ref(false);
  const loadingRefresh = ref(false);
  
  const refreshTodos = async () => {
    loadingRefresh.value = true;
    try {
      await myApiStore.fetchTodos();
    } catch (error) {
      console.error("Error refreshing todos:", error.message);
    } finally {
      loadingRefresh.value = false;
    }
  };
  </script>
  
  <style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
  </style>
  