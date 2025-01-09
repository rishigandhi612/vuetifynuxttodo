<template>
  <v-container class="mt-5">
    <v-row justify="center">
      <v-col md="5">
        <h1>Confirming...</h1>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores
          neque tenetur ab enim, ipsa et cumque nihil temporibus, commodi
          assumenda reprehenderit quae at consequuntur sit ut accusamus! Modi,
          exercitationem quis?
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Handle the OAuth callback
const handleAuthCallback = async () => {
  try {
    const { error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    
    // Redirect after successful authentication
    await navigateTo('/')
  } catch (e) {
    console.error('Error getting auth session:', e)
    // Redirect to login on error
    await navigateTo('/login')
  }
}

watch(
  user,
  () => {
    if (user.value) {
      // Redirect to protected page
      navigateTo("/");
    }
  },
  { immediate: true }
);


// Call handleAuthCallback on page load
onMounted(() => {
  handleAuthCallback()
})
</script>

<style>
</style>