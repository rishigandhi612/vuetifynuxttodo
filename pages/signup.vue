<template>
  <v-container class="signup-container" fluid style="height: 100vh;">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" elevation="4">
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
              Already have an account? <NuxtLink to="/login" class="text-primary">Login</NuxtLink>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
   <AppSnackbar/>
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
const dialogVisible = ref(false);
const {
  
  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
  ShowSnackbar,
  HideSnackbar,
} = useSnackBar();
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
        ShowSnackbar("User already exists. Kindly sign in.");
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
      ShowSnackbar("User already exists. Kindly sign in.");
      navigateTo('/login');
    }
  }
});
</script>

