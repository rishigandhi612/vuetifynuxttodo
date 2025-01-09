<template>
  <v-container class="login-container" fluid style="height: 100vh;">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="login-card" elevation="4">
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
              {{ loading ? 'Logging in...' : 'Login' }}
            </v-btn>

            <!-- Error Alert -->
            <v-alert v-if="error" type="error" dismissible class="mt-4">
              {{ error }}
            </v-alert>
          </v-form>

          <v-card-actions>
            <p class="signup-text">
              Don't have an account? <NuxtLink to="/signup" class="signup-link">Sign Up</NuxtLink>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for success -->
    <v-snackbar v-model="snackbarVisible" color="green" top>
      Login successful! Redirecting...
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const email = ref("rishigandhi021@gmail.com");
const password = ref("Rishi@123");
const error = ref(null);
const loading = ref(false);
const snackbarVisible = ref(false);
const formValid = ref(false);

const supabase = useSupabaseClient();

// Validation rules for Vuetify text fields
const emailRules = [(v) => !!v || 'Email is required'];
const passwordRules = [(v) => !!v || 'Password is required'];

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (loginError) throw loginError;

    // Show snackbar on success
    snackbarVisible.value = true;

    // Redirect to Confirm Page to check user info
    navigateTo('/confirm');
  } catch (err) {
    // Handle specific error code and message from backend
    if (err.code === 'invalid_credentials') {
      error.value = 'Invalid login credentials';
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};

// Redirect if already logged in
onMounted(() => {
  //..
});
</script>

<style scoped>
.login-container {
  background-color: #f7f9fc;
}

.login-card {
  padding: 2rem;
  border-radius: 8px;
}

.login-title {
  font-size: 1.8rem;
  text-align: center;
  color: #333;
}

.signup-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.signup-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.signup-link:hover {
  color: #0056b3;
}

.v-alert {
  margin-top: 1rem;
}
</style>
