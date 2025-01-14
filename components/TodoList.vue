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


    <v-alert v-if="loader" type="info" text outlined>
      <v-progress-circular indeterminate></v-progress-circular> Loading...
    </v-alert>

    <!-- Error State -->
    <v-alert v-if="error" type="error" text outlined>
      Error: {{ error.message }}
      <v-btn text color="primary" @click="fetchTodos">Retry</v-btn>
    </v-alert>


    <v-row v-if="isGridView && sortedTodos.length">
      <v-col v-for="todo in sortedTodos" :key="todo.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>{{ todo.title }}</v-card-title>
          <v-card-subtitle>{{
            dateRef.format(todo.createdAt, "fullDateTime12h")
          }}</v-card-subtitle>
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
            <DeleteTodoButton :todo="todo" @delete="handleDelete" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-data-table-server
      v-if="!isGridView && sortedTodos.length"
      :headers="tableHeaders"
      :items="sortedTodos"
      :items-length="totalItems" 
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
        <DeleteTodoButton :todo="item" @delete="handleDelete" />
      </template>

      <!-- No data slot -->
      <template #no-data>
        <v-alert type="info" text outlined
          >No todos yet! Add your first task.</v-alert
        >
      </template>
    </v-data-table-server>

    <!-- Empty State -->
    <v-alert v-if="!sortedTodos.length" type="info" text outlined>
      No todos yet! Add your first task.
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useDate } from "vuetify";

let loader = ref(false);
const dateRef = useDate();
const isGridView = ref(false);
let loadingToggleStatus = ref({});
const tableHeaders = [
  { text: "Status", value: "status", align: "start", width: "10%" },
  { text: "Title", value: "title", align: "start", width: "50%" },
  { text: "Created At", value: "createdAt", align: "start", width: "30%" },
  { text: "Actions", value: "actions", align: "end", width: "10%" },
];

// State for pagination options
let pagination = ref({
  page: 1,  // Default page
  limit: 10, // Default limit (items per page)
});

const { data, error } = await fetchtodo();

// Computed property for total items
let totalItems = computed(() => data.value.data.pagination.total);

// Computed property for sorted todos
const sortedTodos = computed(() =>
  [...(data.value.data.todos || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
);

// Handle delete action
const handleDelete = (deletedTodo) => {
  data.value.data = data.value.data.filter(
    (todo) => todo.id !== deletedTodo.id
  );
};

// Handle status toggle (mark as complete or incomplete)
const toggleStatus = async (todo) => {
  loadingToggleStatus.value[todo.id] = true; // Start loader for this todo
  try {
    const response = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !todo.status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    todo.status = !todo.status; // Update local status
    loadItems(); // Reload todos
  } catch (err) {
    alert(err.message);
  } finally {
    loadingToggleStatus.value[todo.id] = false; // Stop loader
  }
};

// Toggle between grid and list view
const toggleView = () => {
  isGridView.value = !isGridView.value;
};

// Load items from the backend (this will be triggered by the data table's options update)
const loadItems = async (options = {}) => {
  loader.value = true; // Show loader while fetching data

  // Merge current pagination with options (if available)
  const page = options.page || pagination.value.page;
  const limit = options.itemsPerPage || pagination.value.limit;

  try {
    // Make the request with pagination parameters
    const response = await fetch(`/api/todos?page=${page}&limit=${limit}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch todos");

    // Update the pagination and todos data
    pagination.value = { page, limit }; // Update pagination state
    data.value = result; // Assuming the backend response structure has a `data` field with pagination and todos
  } catch (err) {
    error.value = err; // Set the error state to display the error alert
    console.error(err.message);
  } finally {
    loader.value = false; // Hide loader after the request completes
  }
};
</script>
