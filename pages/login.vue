<template>
  <v-container fluid style="height: 100vh">
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="position-absolute"
      style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;"
    />
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" elevation="4">
          <v-card-title class="login-title">
            <p>Login</p>
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
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              required
              label="Enter your password"
              class="mb-4"
            >
              <template v-slot:append>
                <v-icon @click="showPassword = !showPassword">
                  {{ showPassword ? "mdi-eye-off" : "mdi-eye" }}
                </v-icon>
              </template>
            </v-text-field>

            <v-btn
              :disabled="loading || !formValid"
              type="submit"
              color="success"
              block
              rounded
            >
              {{ loading ? "Logging in..." : "Login" }}
            </v-btn>

            <!-- Google OAuth Button -->
            <v-btn
              @click="loginWithGoogle"
              color="black"
              block
              variant="outlined" 
              class="mt-4"
              rounded
              :disabled="loading"
            >  <v-icon> mdi-google</v-icon>
              Sign in with Google
            </v-btn>

            <v-alert v-if="error" type="error" dismissible class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>

          <v-card-actions class="text-center" justify="center">
            <p>
              Don't have an account?
              <NuxtLink to="/signup" class="text-primary">Sign Up</NuxtLink>
            </p>
            <p>
              Forgot Password?
              <span
                class="text-primary text-center"
                @click="showResetDialog = true"
                >Reset</span
              >
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for success -->
    <AppSnackbar />
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
            color="success"
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

const showPassword = ref(false); // To toggle password visibility

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

// Google OAuth login function
const loginWithGoogle = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (googleError) throw googleError;

    // Success
    ShowSnackbar("Login successful with Google!");
    console.log("Navigating to /confirm");
    navigateTo("/confirm"); // Redirect to the desired page after successful login
  } catch (err) {
    error.value = err.message || "Failed to log in with Google";
  } finally {
    loading.value = false;
  }
};
</script>
