// stores/myApiStore.js
import { defineStore } from 'pinia';

export const useMyApiStore = defineStore('myApiStore', {
  state: () => ({
    todos: [],
    completedTodos: 0,
    remainingTodos: 0,
    totalTodos: 0,
    page: 1,
    per_page: 10,
  }),

  actions: {
    async fetchTodos() {
      try {
        const response = await $fetch('/api/todos'); // Update endpoint as needed
        if (response?.data?.todos) {
          this.todos = response.data.todos;
          this.totalTodos = response.data.pagination.total;
          this.completedTodos = response.data.completedTodos;
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    },

    async addTodo(todo) {
      try {
        const response = await fetch("/api/todos/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todo),
        });
        if (!response.ok) throw new Error("Failed to add todo.");
        const newTodo = await response.json();
        this.todos.push(newTodo); // Update the store
        return newTodo;
      } catch (err) {
        console.error("Error adding todo:", err);
        throw err;
      }
    },
    async toggleTodoStatus(todoId, currentStatus) {
      try {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: !currentStatus }),
        });

        if (!response.ok) throw new Error('Failed to toggle todo status.');

        // Update the local state
        const updatedTodo = await response.json();
        const index = this.todos.findIndex((todo) => todo.id === todoId);

        if (index !== -1) {
          this.todos[index].status = updatedTodo.status;
          this.completedTodos = this.todos.filter(todo => todo.status).length;
          this.remainingTodos = this.totalTodos - this.completedTodos;
        }

        return updatedTodo;
      } catch (err) {
        console.error('Error toggling todo status:', err);
        throw err;
      }
    },
  },
});
