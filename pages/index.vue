<template>
  <v-app>
    <v-container >
      <HeaderComponent />

      <!-- Form to add a new todo -->
      <v-divider class="my-10"></v-divider>
      <AddTodo />

      <!-- Todo Summary -->
      <TodoSummary />

      <!-- Todo List -->
      <TodoList />

      <!-- Snackbar -->
      <AppSnackbar />
    </v-container>
  </v-app>
</template>
