<template>
  <div>
    <v-btn
      icon="mdi-delete"
      color="error"
      @click="openDialog"
      variant="outlined"
      size="small"
    ></v-btn>

    <v-dialog v-model="dialogVisible" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to delete this task?
        </v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="cancel">Cancel</v-btn>
          <v-btn :loading="loading" color="green" @click="confirm">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMyApiStore } from "../stores/myApiStore";

// Props
const props = defineProps({
  todo: { type: Object, required: true },
});

// Emit event
const emit = defineEmits(["delete"]);

// State
const dialogVisible = ref(false);
const loading = ref(false);

// Store
const myApiStore = useMyApiStore();

// Methods
const openDialog = () => {
  dialogVisible.value = true;
};

const cancel = () => {
  dialogVisible.value = false;
};

const confirm = async () => {
  loading.value = true;
  try {
    await myApiStore.deleteTodo(props.todo.id);
    emit("delete"); // Notify parent to refresh todos
  } catch (err) {
    console.error(err.message || "An error occurred while deleting the todo.");
  } finally {
    loading.value = false;
    dialogVisible.value = false;
  }
};
</script>
