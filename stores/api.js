import { defineStore } from 'pinia'

export const useMyApiStore = defineStore({
  id: 'myApiStore',
  state: () => ({ }),
  actions: {}
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}