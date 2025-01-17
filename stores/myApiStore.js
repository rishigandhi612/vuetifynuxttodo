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
        const response = await $fetch('/api/todos'); 
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
    
        const { data, message } = await response.json();
    
        if (!data?.id || !data?.title) {
          throw new Error("Invalid response from server.");
        }
    
        // Add the new todo to the list and adjust counts
        this.todos.push({
          ...data, // Use the response directly to ensure all fields are included
        });
    
        this.totalTodos++;
        if (!data.status) {
          this.remainingTodos++;
        } else {
          this.completedTodos++;
        }
    
        console.log(message); // Optionally log the success message
        return data; // Return the created todo for further processing
      } catch (err) {
        console.error("Error adding todo:", err);
        throw err;
      }
    }
    ,    
    async toggleTodoStatus(todoId, currentStatus) {
      try {
        const response = await $fetch(`/api/todos/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: { status: !currentStatus },
        });
    
        if (!response) throw new Error('Failed to toggle todo status.');
    
        // Find and update the task in the store
        const index = this.todos.findIndex((todo) => todo.id === todoId);
        if (index !== -1) {
          this.todos[index].status = !currentStatus;
    
          // Update the counts reactively
          if (!currentStatus) {
            this.completedTodos += 1;
            this.remainingTodos -= 1;
          } else {
            this.completedTodos -= 1;
            this.remainingTodos += 1;
          }
        }
    
        return response;
      } catch (error) {
        console.error('Error toggling todo status:', error);
        throw error;
      }
    },         
    async deleteTodo(todoId) {
      try {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
    
        if (!response.ok) throw new Error('Failed to delete todo.');
    
        // Find the todo being deleted
        const deletedTodo = this.todos.find(todo => todo.id === todoId);
    
        if (!deletedTodo) {
          console.error(`Todo with ID ${todoId} not found in the store.`);
          return;
        }
    
        // Update the local state
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    
        // Adjust counts
        this.totalTodos -= 1;
        if (deletedTodo.status) {
          this.completedTodos -= 1;
        }
        this.remainingTodos = this.totalTodos - this.completedTodos;
    
        console.log('Todo deleted successfully:', todoId);
      } catch (err) {
        console.error('Error deleting todo:', err);
        throw err;
      }
    }
    
  },
});
