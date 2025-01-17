<template>
    <v-row class="header" align="center">
      <!-- Centered Title -->
      <v-col cols="9" md="10" class="d-flex justify-center">
        <h1>
          <span class="text-primary">
            Hello <strong>{{ user?.email }}</strong>
          </span>
          <p>Welcome to Todo App!</p>
        </h1>
      </v-col>
  
      <!-- Right-aligned Logout Button -->
      <v-col cols="3" md="2" class="d-flex justify-end">
        <v-btn :loading="loadingLogout" color="error" @click="logout" outlined>
          Logout
        </v-btn>
      </v-col>
    </v-row>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  // Initialize Supabase and Router
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  // Loading state
  const loadingLogout = ref(false);
  
  // Snackbar utilities
  const { ShowSnackbar } = useSnackBar();
  
  // Logout function
  const logout = async () => {
    loadingLogout.value = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        ShowSnackbar("An error occurred while signing out. Please try again.", "error");
      } else {
        ShowSnackbar("You have been logged out successfully.", "success");
        navigateTo("/login");
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err.message);
      ShowSnackbar("An unexpected error occurred during the sign out process.", "error");
    } finally {
      loadingLogout.value = false;
    }
  };
  </script>
  