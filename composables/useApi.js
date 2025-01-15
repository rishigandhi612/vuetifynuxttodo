export const fetchtodo = async (endpoint = "/api/todos") => {
   try {
     // Use $fetch for client-side API calls
     const data = await $fetch(endpoint);
     return { data, error: null };
   } catch (error) {
     return { data: null, error };
   }
 };
 