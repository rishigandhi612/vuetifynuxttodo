<template>
  <v-container fluid style="height: 100vh">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" elevation="4">
          <v-card-title class="login-title">
            <span>Login</span> 
          </v-card-title>

          <v-form @submit.prevent="handleLogin" v-model="formValid">
            <v-text-field
              id="email"
              type="email"
              v-model="email"
              required
              label="Enter your email"
              class="mb-4"
            />

            <v-text-field
              id="password"
              type="password"
              v-model="password"
              required
              label="Enter your password"
              class="mb-4"
            />

            <v-btn
              :disabled="loading || !formValid"
              type="submit"
              color="primary"
              block
            >
              {{ loading ? "Logging in..." : "Login" }}
            </v-btn>

            <!-- Error Alert -->
            <v-alert v-if="error" type="error" dismissible class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>

          <v-card-actions>
            <p>
              Don't have an account?
              <NuxtLink to="/signup" class="text-primary">Sign Up</NuxtLink>
            </p>
            <p>
              Forgot Password?
              <span class="text-primary" @click="showResetDialog = true"
                >Reset</span
              >
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for success -->
    <!-- <v-snackbar v-model="snackbarVisible" top>
      {{ snackbarMessage }}
    </v-snackbar> -->
    <AppSnackbar/>
    <!-- Password Reset Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Reset Password</v-card-title>
        <v-card-text>
          <v-form v-model="resetFormValid">
            <v-text-field
              v-model="resetEmail"
              label="Enter your email"
              :rules="[emailRules]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            :disabled="loading || !resetFormValid"
            @click="handlePasswordReset"
          >
            {{ loading ? "Sending..." : "Send Reset Link" }}
          </v-btn>
          <v-btn color="secondary" text @click="showResetDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const {
  
  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
  ShowSnackbar,
  HideSnackbar,
} = useSnackBar();

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);
const formValid = ref(false);
const showResetDialog = ref(false);
const resetEmail = ref("");
const resetFormValid = ref(false);

const supabase = useSupabaseClient();


const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (loginError) throw loginError;

    // Update snackbar message and show it
    else ShowSnackbar("Login successful! Redirecting...");
    // Redirect
    navigateTo("/confirm");
  } catch (err) {
    error.value = err.message || "An error occurred during login";
  } finally {
    loading.value = false;
  }
};

const handlePasswordReset = async () => {
  loading.value = true;
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail.value
    );
    if (resetError) throw resetError;

    // Call snackbar composable to show success message
    else ShowSnackbar("Password reset link sent to your email!");

    // Close reset dialog
    showResetDialog.value = false;
  } catch (err) {
    error.value = err.message || "Failed to send reset link";
  } finally {
    loading.value = false;
  }
};
</script>
