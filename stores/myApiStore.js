import { defineStore } from 'pinia';

export const useMyApiStore = defineStore('myApiStore', {
  state: () => ({
    todos: [],
    completedTodos: 0,
    remainingTodos: 0,
    totalTodos: 0,
    page: 1,
    per_page: 12,
    isGridView: true,
    loading: false, // For loading state
    error: null,    // For error handling
  }),
  actions: {
    async fetchTodos({ page = this.page, limit = this.per_page, append = false } = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch(`/api/todos?page=${page}&limit=${limit}`);
        if (response?.data?.todos) {
          this.todos = append ? [...this.todos, ...response.data.todos] : response.data.todos;
          this.page = page;
          this.per_page = limit;
          this.totalTodos = response.data.pagination.total;
          this.completedTodos = response.data.completedTodos;
          this.remainingTodos = response.data.pendingTodos;
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch todos';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async addTodo(todo) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('/api/todos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo),
        });

        if (!response.ok) throw new Error('Failed to add todo');

        const { data, message } = await response.json();
        if (!data?.id || !data?.title) throw new Error('Invalid server response');

        this.todos.push(data);
        this.totalTodos++;
        data.status ? this.completedTodos++ : this.remainingTodos++;
        console.log(message);
      } catch (err) {
        this.error = err.message || 'Failed to add todo';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async toggleTodoStatus(todoId, currentStatus) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch(`/api/todos/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: { status: !currentStatus },
        });

        if (!response) throw new Error('Failed to toggle todo status');

        const index = this.todos.findIndex((todo) => todo.id === todoId);
        if (index !== -1) {
          this.todos[index].status = !currentStatus;
          currentStatus ? this.completedTodos-- : this.completedTodos++;
          currentStatus ? this.remainingTodos++ : this.remainingTodos--;
        }
      } catch (error) {
        this.error = error.message || 'Failed to toggle todo status';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async deleteTodo(todoId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to delete todo');

        const deletedTodo = this.todos.find((todo) => todo.id === todoId);
        if (deletedTodo) {
          this.todos = this.todos.filter((todo) => todo.id !== todoId);
          this.totalTodos--;
          deletedTodo.status ? this.completedTodos-- : this.remainingTodos--;
        }
      } catch (err) {
        this.error = err.message || 'Failed to delete todo';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    toggleView() {
      this.isGridView = !this.isGridView;
    },
  },
});
