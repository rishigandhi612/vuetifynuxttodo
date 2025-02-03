<template>
  <v-container>
    <v-row>
    <v-col cols="12" class="d-flex justify-center" v-if="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-col>
    <!-- Total Tasks Display -->
     <template v-if="!loading">
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

    <!-- Completed and remaining Tasks -->
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
  </template>
  
  </v-row>
  <v-row>
    <v-btn @click="analyze" color="primary"> Analyze Todos </v-btn>
    <!-- <p v-if="analysis">{{ analysis }}</p> -->
    <MDC :value="analysis" >
    </MDC>
  </v-row>
  </v-container>
 
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { useMyApiStore } from "../stores/myApiStore";

const myApiStore = useMyApiStore();

// Bind the loading state from the store
const loading = computed(() => myApiStore.loading);
const analysis = ref("");
// Computed properties for total, completed, and remaining tasks
const totalTasks = computed(() => myApiStore.totalTodos || 0);
const completedTodos = computed(() => myApiStore.completedTodos || 0);
const remainingTodos = computed(() => totalTasks.value - completedTodos.value);

// Compute the percentage of completed tasks
const completedPercentage = computed(() => {
  if (totalTasks.value === 0) return 0;
  return (completedTodos.value / totalTasks.value) * 100;
});
const analyze = async () => {
  console.log("analyze called");
  
  analysis.value = await myApiStore.analyzeTodos();
  console.log(analysis);
};

// Fetch tasks when the component is mounted
watchEffect(() => {
  myApiStore.fetchTodos();
});
</script>
