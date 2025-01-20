<template>
  <v-app-bar color="success">
    <v-toolbar-title>
      <span class="text-h5">Todo</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>


    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          @click="refreshTodos" 
          :loading="loadingRefresh"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </template>
      <span>Refresh todos</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          @click="myApiStore.toggleView"
        >
          <v-icon>{{ myApiStore.isGridView ? 'mdi-format-list-checkbox' : 'mdi-grid' }}</v-icon>
        </v-btn>
      </template>
      <span>Switch to {{ myApiStore.isGridView ? 'list' : 'grid' }} view</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          @click="toggleTheme"
        >
          <v-icon>{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-btn>
      </template>
      <span>Switch to {{ isDarkMode ? 'light' : 'dark' }} mode</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-menu location="bottom end">
          <template v-slot:activator="{ props: menuProps }">
            <v-avatar 
              v-bind="{ ...props, ...menuProps }"
              class="cursor-pointer" 
              size="36"
            >
              <v-icon icon="mdi-account-circle"></v-icon>
            </v-avatar>
          </template>
          
          <v-list>
            <v-list-item>
              <v-list-item-title class="text-body-2">
                {{ user?.email }}
              </v-list-item-title>
            </v-list-item>
            
            <v-divider></v-divider>
            
            <v-list-item @click="logout" :disabled="loadingLogout">
              <v-btn :loading="loadingLogout" color="error" block outlined @click="logout">
                <template v-slot:prepend>
               
                <v-icon 
                  :icon="loadingLogout ? 'mdi-loading' : 'mdi-logout'" 
                  :class="{ 'rotating': loadingLogout }"
                ></v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-btn>
            </v-list-item>
  
          </v-list>
        </v-menu>
      </template>
      <span>Account menu</span>
    </v-tooltip>
  </v-app-bar>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useMyApiStore } from "../stores/myApiStore";
const supabase = useSupabaseClient();


const user = useSupabaseUser();
const props = defineProps({
  isDarkMode: Boolean
});
const emit = defineEmits(['toggle-theme']);

const myApiStore = useMyApiStore();
const loadingLogout = ref(false);
const loadingRefresh = ref(false);

const refreshTodos = async () => {
  loadingRefresh.value = true;
  try {
    await myApiStore.fetchTodos();
  } catch (error) {
    console.error("Error refreshing todos:", error.message);
  } finally {
    loadingRefresh.value = false;
  }
};

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  navigateTo('/login')
}

const toggleTheme = () => {
  emit('toggle-theme');
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>