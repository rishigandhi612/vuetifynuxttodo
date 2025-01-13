<template>
  <v-row>
    <v-col cols="12" md="6" class="d-flex justify-start">
      <h1 class="text-success">
        <span>Total Tasks:</span>
        <v-fade-transition leave-absolute>
          <span :key="`tasks-${totalTasks}`">
            {{ totalTasks }}
          </span>
        </v-fade-transition>
      </h1>
    </v-col>

    <v-col cols="6" class="d-flex justify-center">
      <v-row class="d-flex align-center">
        <v-col cols="8" class="d-flex justify-center">
          <div>
            <h4>
              <span>Completed: <strong>{{ completedTodos }}</strong></span>
            </h4>
            <h4>
              <span>Remaining: <strong>{{ remainingTodos }}</strong></span>
            </h4>
          </div>
        </v-col>
        <v-col cols="4">
          <v-progress-circular
            :value="completedPercentage"
            color="success"
            class="me-2"
            x-large
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";

// Fetch data using the composable
const { data, error } = await fetchtodo(); // Call the composable to get data

// Reactive counters
const completedTodos = ref(0);
const remainingTodos = ref(0);

// Compute total tasks
const totalTasks = computed(() => data?.value?.data?.length || 0);

// Compute percentage of completed tasks
const completedPercentage = computed(() =>
  totalTasks.value > 0
    ? Math.round((completedTodos.value / totalTasks.value) * 100)
    : 0
);

// Watch for changes in `data` and update counters
watchEffect(() => {
  const todos = data?.value?.data || [];
  completedTodos.value = todos.filter((todo) => todo.status).length;
  remainingTodos.value = todos.filter((todo) => !todo.status).length;
});
</script>
