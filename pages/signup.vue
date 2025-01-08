<template>
    <div class="signup-container">
      <h1 class="signup-title">Sign Up</h1>
      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" required placeholder="Enter your email" />
        </div>
  
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" required placeholder="Enter your password" />
        </div>
  
        <button type="submit" class="signup-button" :disabled="loading">
          {{ loading ? 'Signing up...' : 'Sign Up' }}
        </button>
  
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
  
      <p class="login-text">
        Already have an account? <NuxtLink to="/login" class="login-link">Login</NuxtLink>
      </p>
    </div>
  </template>
  
  <script setup>
  const email = ref("");
  const password = ref("");
  const error = ref(null);
  const loading = ref(false);
  
  const supabase = useSupabaseClient();
  
  const handleSignup = async () => {
    loading.value = true;
    error.value = null;
  
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      });
  
      if (signupError) throw signupError;
  
      // Redirect to confirmation or another page after signup
      navigateTo('/confirm');
    } catch (error) {
      error.value = error.message;
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .signup-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 2rem;
    text-align: center;
  }
  
  .signup-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .signup-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
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
  
  .signup-button {
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
  
  .signup-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  
  .signup-button:hover:enabled {
    background: #0056b3;
  }
  
  .error-message {
    color: #ff4d4d;
    margin-top: 1rem;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .login-text {
    margin-top: 1.5rem;
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
  </style>
  