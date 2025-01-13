<template>
  <v-container>
    <!-- Icon Buttons for Grid/List View Toggle -->
    <v-row align="right" justify="end">
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

    <v-data-table
      v-if="!isGridView && sortedTodos.length"
      :headers="tableHeaders"
      :items="sortedTodos"
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
    </v-data-table>

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
const { data, error } = await fetchtodo();

const sortedTodos = computed(() =>
  [...(data.value.data || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
);

const handleDelete = (deletedTodo) => {
  data.value.data = data.value.data.filter(
    (todo) => todo.id !== deletedTodo.id
  );
};

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
    fetchtodo(); // Refetch todos
  } catch (err) {
    alert(err.message);
  } finally {
    loadingToggleStatus.value[todo.id] = false; // Stop loader
  }
};

const toggleView = () => {
  isGridView.value = !isGridView.value;
};
</script>
