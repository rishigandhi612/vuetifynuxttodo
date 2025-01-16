<template>
    <v-form @submit.prevent="handleAddTodo">
      <v-row>
        <v-text-field
          v-model="newTodo"
          label="What are you working on?"
          variant="solo"
          @keydown.enter="handleAddTodo"
        >
          <template v-slot:append-inner>
            <v-fade-transition>
              <v-btn
                v-show="newTodo"
                icon="mdi-plus-circle"
                variant="text"
                :loading="loading"
                @click="handleAddTodo"
              ></v-btn>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-row>
    </v-form>
  </template>
  
  <script setup>
  import { ref } from "vue";
 
  const { addTodo, error } = useTodoActions();
  const newTodo = ref("");
  const loading = ref(false);
  
  const handleAddTodo = async () => {
  try {
    const response = await addTodo("New Task Title");
    console.log("Todo added:", response);
  } catch (err) {
    console.error("Error adding todo:", error.value);
  }
};
  </script>
  