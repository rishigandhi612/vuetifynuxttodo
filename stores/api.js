import { defineStore } from 'pinia';

export const useMyApiStore = defineStore('myApiStore', {
  state: () => ({
    todos: [], // List of todos
    completedTodos: 0, // Number of completed todos
    remainingTodos: 0, // Number of remaining todos
  }),

  actions: {
    async fetchTodos() {
      try {
        const response = await $fetch(endpoint);
        if (response?.data?.todos) {
          this.todos = response.data.todos;
          this.updateCounters(); // Update counters after fetching todos
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    },

    async addTodo(newTodoTitle) {
      try {
        const response = await $fetch('/api/todos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTodoTitle, status: false }),
        });

        if (response) {
          // Add the new todo to the todos list
          this.todos.unshift(response); // Insert at the beginning
          this.updateCounters(); // Update counters
        }
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    },

    updateCounters() {
      this.completedTodos = this.todos.filter(todo => todo.status).length;
      this.remainingTodos = this.todos.filter(todo => !todo.status).length;
    },
  },
});
