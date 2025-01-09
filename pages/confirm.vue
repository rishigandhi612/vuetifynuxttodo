<template>
  <div class="confirm-container">
    <h1 class="confirm-title">Confirm User...</h1>
    <p class="confirm-description">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et, aut autem
      tenetur repellendus dolor, commodi officiis ipsa inventore provident
      adipisci atque error velit obcaecati! Veritatis ducimus vero doloremque
      blanditiis quis.
    </p>

    {{ user }}
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();

watch(
  user,
  async () => {
    if (user.value) {
      navigateTo('/');
    } else {
      navigateTo('/login');
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.confirm-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;
  text-align: center;
}

.confirm-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.confirm-description {
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
  max-width: 600px;
}
</style>
