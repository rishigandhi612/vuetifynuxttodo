export const fetchtodo= async () => {
   let { data, error } = await useFetch("/api/todos");

   return { data, error };
};