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

    <!-- Grid View -->
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
    <v-row v-if="isGridView && sortedTodos.length">
      <v-btn v-if="hasMoreItems" block  @click="loadmoreItems" rounded>
        Load More ... 
      </v-btn>
      <!-- <v-btn v-if="!hasMoreItems" block disabled rounded>
        No more items to display. 
      </v-btn> -->

    </v-row>
    <!-- List View (v-data-table-server) -->
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

// Data and UI state
const loader = ref(false);
const dateRef = useDate();
const isGridView = ref(false);
let loadingToggleStatus = ref({});
const tableHeaders = [
  { text: "Status", value: "status", align: "start", width: "10%" },
  { text: "Title", value: "title", align: "start", width: "50%" },
  { text: "Created At", value: "createdAt", align: "start", width: "30%" },
  { text: "Actions", value: "actions", align: "end", width: "10%" },
];

const pagination = ref({
  page: 1,
  limit: 10,
});

const data = ref(null);
const error = ref(null);

const fetchTodos = async () => {
  loader.value = true;
  const endpoint = `/api/todos?page=${pagination.value.page}&limit=${pagination.value.limit}`;
  const { data: result, error: fetchError } = await fetchtodo(endpoint);
  loader.value = false;

  if (fetchError) {
    error.value = fetchError;
    return;
  }

  // Update `data` correctly based on the current view
  if (pagination.value.page === 1 || !isGridView.value) {
    data.value = result; // Replace data on the first page or in table view
  } else {
    // Append new todos in grid view
    data.value = {
      ...data.value,
      data: {
        ...data.value.data,
        todos: [...(data.value?.data?.todos || []), ...result.data.todos],
        pagination: result.data.pagination, // Ensure pagination is updated
      },
    };
  }
};


const hasMoreItems = computed(() => {
  return data?.value?.data?.pagination?.hasMore || false;
});

const totalItems = computed(() => data.value?.data?.pagination?.total || 0);

const sortedTodos = computed(() => {
  return (data.value?.data?.todos || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
});

const handleDelete = (deletedTodo) => {
  data.value.data = data.value.data.filter(
    (todo) => todo.id !== deletedTodo.id
  );
  fetchTodos();
};
const toggleStatus = async (todo) => {
  loadingToggleStatus.value[todo.id] = true;
  try {
    const response = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !todo.status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    todo.status = !todo.status;
    fetchTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    loadingToggleStatus.value[todo.id] = false;
  }
};

// Toggle between grid and list view
const toggleView = () => {
  isGridView.value = !isGridView.value;
};

// Load items based on pagination and options
const loadItems = async () => {
  pagination.value.page = pagination.value.page || 1;
  await fetchTodos(); 
};
const loadmoreItems = async () => {
  if (!hasMoreItems.value) return;
  pagination.value.page += 1; 
  await fetchTodos(); 
};

// Initial data fetch when component is created
fetchTodos();
</script>