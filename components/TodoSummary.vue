<template>
  <v-row>
    <!-- Total Tasks Display -->
    <v-col cols="6" md="6" class="d-flex justify-start pa-4">
      <h1 class="text-success">
        <span>Total Tasks:</span>
        <v-fade-transition leave-absolute>
          <span :key="`tasks-${totalTasks}`">
            {{ totalTasks }}
          </span>
        </v-fade-transition>
      </h1>
    </v-col>

    <!-- Completed and Remaining Tasks -->
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
            v-model="completedPercentage"
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
import { useMyApiStore } from "../stores/myApiStore";

const myApiStore = useMyApiStore();

// Computed properties for total, completed, and remaining tasks
const totalTasks = computed(() => myApiStore.totalTodos || 0);
const completedTodos = computed(() => myApiStore.completedTodos || 0);
const remainingTodos = computed(() => totalTasks.value - completedTodos.value);

// Compute the percentage of completed tasks
const completedPercentage = computed(() => {
  if (totalTasks.value === 0) return 0;
  return (completedTodos.value / totalTasks.value) * 100;
});
console.log(completedPercentage.value);
// Fetch tasks when the component is mounted
watchEffect(() => {
  myApiStore.fetchTodos();
});
</script>
