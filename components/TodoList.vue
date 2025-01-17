<template>
  <v-container>
    <!-- Icon Buttons for Grid/List View Toggle -->
    <v-row justify="end">
      <v-btn icon @click="toggleView" elevation="0">
        <v-icon>{{
          isGridView ? "mdi-format-list-checkbox" : "mdi-grid"
        }}</v-icon>
      </v-btn>
    </v-row>

    <!-- Loader -->
    <v-alert v-if="loader" type="info" text outlined>
      <v-progress-circular indeterminate></v-progress-circular> Loading...
    </v-alert>

    <!-- Error State -->
    <v-alert v-if="error" type="error" text outlined>
      Error: {{ error.message }}
      <v-btn text color="primary" @click="fetchTodos">Retry</v-btn>
    </v-alert>

    <!-- Grid View -->
    <v-row v-if="isGridView && sortedTodos.length">
      <v-col v-for="todo in sortedTodos" :key="todo.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>{{ todo.title }}</v-card-title>
          <v-card-subtitle>{{ dateRef.format(todo.createdAt, "fullDateTime12h") }}</v-card-subtitle>
          <v-card-actions>
            <v-checkbox
              :disabled="loadingToggleStatus[todo.id]"
              v-model="todo.status"
              @click="toggleStatus(todo)"
              hide-details
            >
              <template v-slot:label>
                <v-progress-circular
                  v-if="loadingToggleStatus[todo.id]"
                  indeterminate
                  size="20"
                  color="primary"
                ></v-progress-circular>
              </template>
            </v-checkbox>
            <DeleteTodoButton :todo="todo" @delete="fetchTodos" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isGridView && hasMoreItems">
      <v-btn block @click="loadMoreItems" rounded>Load More...</v-btn>
    </v-row>

    <!-- List View -->
    <v-data-table-server
      v-if="!isGridView && sortedTodos.length"
      :headers="tableHeaders"
      :items="sortedTodos"
      :items-length="totalTodos"
      @update:options="loadItems"   
    >
      <template #item.status="{ item }">
        <v-checkbox
          :disabled="loadingToggleStatus[item.id]"
          v-model="item.status"
          @click="toggleStatus(item)"
          hide-details
        >
          <template v-slot:label>
            <v-progress-circular
              v-if="loadingToggleStatus[item.id]"
              indeterminate
              size="20"
              color="primary"
            ></v-progress-circular>
          </template>
        </v-checkbox>
      </template>

      <template #item.createdAt="{ item }">
        {{ dateRef.format(item.createdAt, "fullDateTime12h") }}
      </template>

      <template #item.actions="{ item }">
        <DeleteTodoButton :todo="item" @delete="fetchTodos" />
      </template>

      <template #no-data>
        <v-alert type="info" text outlined>No todos yet! Add your first task.</v-alert>
      </template>
    </v-data-table-server>

    <!-- Empty State -->
    <v-alert v-if="!sortedTodos.length" type="info" text outlined>
      No todos yet! Add your first task.
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDate } from "vuetify";
import { useMyApiStore } from "../stores/myApiStore";

// Initialize store and references
const myApiStore = useMyApiStore();
const dateRef = useDate();
const isGridView = ref(false);
const loader = ref(false);
const error = ref(null);
const loadingToggleStatus = ref({});
const pagination = ref({ page: 1, limit: 10 });

const tableHeaders = [
  { text: "Status", value: "status", align: "start", width: "10%" },
  { text: "Title", value: "title", align: "start", width: "50%" },
  { text: "Created At", value: "createdAt", align: "start", width: "30%" },
  { text: "Actions", value: "actions", align: "end", width: "10%" },
];

// Computed properties
const totalTodos = computed(() => myApiStore.totalTodos);
const hasMoreItems = computed(() => myApiStore.todos.length < myApiStore.totalTodos);
const sortedTodos = computed(() =>
  myApiStore.todos.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);

// Methods
const fetchTodos = async () => {
  loader.value = true;
  try {
    await myApiStore.fetchTodos();
  } catch (err) {
    error.value = err;
  } finally {
    loader.value = false;
  }
};

const loadMoreItems = async () => {
  if (!hasMoreItems.value) return;
  pagination.value.page++;
  await fetchTodos();
};

const toggleStatus = async (todo) => {
  loadingToggleStatus.value[todo.id] = true;

  const newStatus = !todo.status; // Calculate the new status

  try {
    await myApiStore.toggleTodoStatus(todo.id, newStatus);
    todo.status = newStatus; // Update local state after successful response
  } catch (err) {
    console.error('Error updating todo status:', err);
  } finally {
    loadingToggleStatus.value[todo.id] = false;
  }
};


// Toggle between grid and list view
const toggleView = () => {
  isGridView.value = !isGridView.value;
};
// Load items from the backend (this will be triggered by the data table's options update)
const loadItems = async (options = {}) => {
  loader.value = true; // Show loader while fetching data

  // Use pagination values from the store instead of options
  const page = options.page || myApiStore.page; // Default to current store page if no page in options
  const limit = options.itemsPerPage || myApiStore.per_page; // Default to current store per_page if not provided

  try {
    // Make the request with pagination parameters (using the store's page and limit)
    const response = await fetch(`/api/todos?page=${page}&limit=${limit}`);
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Failed to fetch todos");

    // Update the pagination and todos data in the store
    myApiStore.page = page;  // Update the page in the store
    myApiStore.per_page = limit; // Update per_page in the store
    myApiStore.todos = result.data.todos; // Assuming the response has a data.todos array
    myApiStore.totalTodos = result.data.pagination.total; // Assuming the response has pagination info

    // Optionally, you could also update other counts like completedTodos or remainingTodos here.

  } catch (err) {
    error.value = err; // Set the error state to display the error alert
    console.error(err.message);
  } finally {
    loader.value = false; // Hide loader after the request completes
  }
};

// Fetch todos when the component is mounted
onMounted(() => {
  fetchTodos();
});
</script>
