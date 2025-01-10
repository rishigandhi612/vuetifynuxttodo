<template>
  <v-container fluid style="height: 100vh;">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="forgot-password-card" elevation="4">
          <v-card-title class="text-h5 text-center">Reset Your Password</v-card-title>

          <v-form v-model="formValid" @submit.prevent="handlePasswordUpdate">
            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              :rules="passwordRules"
              required
              class="mb-4"
            />
            <v-text-field
              v-model="confirmPassword"
              label="Confirm New Password"
              type="password"
              :rules="confirmPasswordRules"
              required
              class="mb-4"
            />
            <v-btn :disabled="loading || !formValid" type="submit" color="primary" block>
              {{ loading ? "Updating..." : "Update Password" }}
            </v-btn>

            <v-alert v-if="error" type="error" dismissible class="mt-4">
              {{ error }}
            </v-alert>

            <v-snackbar v-model="snackbarVisible" color="green" top>
              Password updated successfully! Redirecting...
            </v-snackbar>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const newPassword = ref("");
const confirmPassword = ref("");
const error = ref(null);
const loading = ref(false);
const formValid = ref(false);
const snackbarVisible = ref(false);

const router = useRouter();
const supabase = useSupabaseClient();

// Validation rules
const passwordRules = [
  (v) => !!v || "Password is required",
  (v) => v.length >= 6 || "Password must be at least 6 characters",
];
const confirmPasswordRules = [
  (v) => !!v || "Confirm Password is required",
  (v) => v === newPassword.value || "Passwords do not match",
];

const handlePasswordUpdate = async () => {
  loading.value = true;
  error.value = null;

  try {
    const accessToken = window.localStorage.getItem("supabase_token");
    if (!accessToken) throw new Error("Reset token is missing!");

    // Update the user's password using the access token
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    });

    if (updateError) throw updateError;

    // Show success message and redirect
    snackbarVisible.value = true;
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    error.value = err.message || "Failed to update password";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Extract the token from the URL fragment
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace("#", ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken) {
    try {
      // Store the tokens temporarily in localStorage
      window.localStorage.setItem("supabase_token", accessToken);
      window.localStorage.setItem("supabase_refresh_token", refreshToken);

      // Set the session for Supabase
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;
    } catch (err) {
      error.value = "Failed to validate reset token.";
    }
  } else {
    error.value = "Reset token is missing!";
  }
});
</script>

<style scoped>
.forgot-password-card {
  padding: 2rem;
  border-radius: 8px;
}

.v-alert {
  margin-top: 1rem;
}
</style>
