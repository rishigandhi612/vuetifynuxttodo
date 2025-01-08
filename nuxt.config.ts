// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  modules: ["@nuxtjs/supabase"],
  supabase: {
    redirectOptions:{
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ['/about','/login','/signup'],
      cookieRedirect: false,
    }
  },
})
