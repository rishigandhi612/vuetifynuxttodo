<template>
  <v-container class="signup-container" fluid style="height: 100vh;">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="signup-card" elevation="4">
          <v-card-title class="signup-title">
            <span>Sign Up</span>
          </v-card-title>

          <v-form @submit.prevent="handleSignup" v-model="formValid">
            <v-text-field
              id="email"
              type="email"
              v-model="email"
              required
              label="Enter your email"
              :rules="[emailRules]"
              class="mb-4"
            />

            <v-text-field
              id="password"
              type="password"
              v-model="password"
              required
              label="Enter your password"
              :rules="[passwordRules]"
              class="mb-4"
            />

            <v-btn
              :disabled="loading || !formValid"
              type="submit"
              color="primary"
              block
            >
              {{ loading ? 'Signing up...' : 'Sign Up' }}
            </v-btn>

            <!-- Error Alert -->
            <v-alert v-if="error" type="error" dismissible class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>

          <v-card-actions>
            <p class="login-text">
              Already have an account? <NuxtLink to="/login" class="login-link">Login</NuxtLink>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for success or error messages -->
    <v-snackbar v-model="snackbarVisible" :color="snackbarColor" top>
      {{ snackbarMessage }}
      <template #action>
        <v-btn color="pink" text @click="snackbarVisible = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog for email verification -->
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title>Confirm Your Email</v-card-title>
        <v-card-text>
          Please check your email inbox and confirm your account. If you haven’t received the email, please check the entered email.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="dialogVisible = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);
const formValid = ref(false);
const snackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const dialogVisible = ref(false);

const supabase = useSupabaseClient();

// Validation rules for Vuetify text fields
const emailRules = [(v) => !!v || 'Email is required'];
const passwordRules = [(v) => !!v || 'Password is required'];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const handleSignup = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (signupError) throw signupError;

    // Check user metadata for email verification
    const user = data.user;
    if (user && user.user_metadata) {
      if (user.user_metadata.email_verified === false) {
        // Email not verified: show dialog
        dialogVisible.value = true;
      } else {
        // Email verified: user already exists
        snackbarMessage.value = "User already exists. Kindly sign in.";
        snackbarColor.value = "warning";
        snackbarVisible.value = true;
        await delay(2000);
        navigateTo('/login'); // Redirect to login
      }
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Redirect if already logged in
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check user metadata
    if (user.user_metadata && user.user_metadata.email_verified === false) {
      // Email not verified: show dialog
      dialogVisible.value = true;
    } else {
      // User already exists
      snackbarMessage.value = "User already exists. Kindly sign in.";
      snackbarColor.value = "warning";
      snackbarVisible.value = true;
      navigateTo('/login');
    }
  }
});
</script>

<style scoped>
.signup-container {
  background-color: #f8f9fa;
}

.signup-card {
  padding: 2rem;
  border-radius: 8px;
}

.signup-title {
  font-size: 2rem;
  text-align: center;
  color: #333;
}

.login-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.login-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #0056b3;
}

.v-alert {
  margin-top: 1rem;
}
</style>
