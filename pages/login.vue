<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" required placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" required placeholder="Enter your password" />
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <p class="signup-text">
        Don't have an account? <NuxtLink to="/signup" class="signup-link">Sign Up</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const email = ref("rishigandhi021@gmail.com")
const password = ref("Rishi@123")
const error = ref(null)
const loading = ref(false)

const supabase = useSupabaseClient()

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (loginError) throw loginError

    // Redirect to Confirm Page to check user info
    navigateTo('/confirm')
  } catch (error) {
    error.value = error.message
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
onMounted(() => {
  //..
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f9fc;
  margin: 0;
  padding: 0;
}

.login-card {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.login-button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.login-button:hover:enabled {
  background: #0056b3;
}

.error-message {
  color: #ff4d4d;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.signup-text {
  margin-top: 1.5rem;
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
</style>
