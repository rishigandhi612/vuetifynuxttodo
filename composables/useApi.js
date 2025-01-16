// import { ref } from "vue";
// import {useMyApiStore} from "../stores/api";
// const apiStore = useMyApiStore();

// export const useTodoActions = () => {
//   const error = ref(null);

//   // Fetch todos with optional endpoint
//   const fetchtodo = async () => {
//     apiStore.fetchTodos();
//   };

//   // Add a new todo
//   const addTodo = async (title) => {
//     try {
//       const response = await $fetch("/api/todos/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title, status: false }),
//       });

//       if (!response) {
//         throw new Error("Failed to add the todo.");
//       }

//       return response;
//     } catch (err) {
//       error.value = err;
//       throw err;
//     }
//   };

//   return {
//     fetchtodo,
//     addTodo,
//     error, // Export error for global handling
//   };
// };
