// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr:false,
   build: {
    transpile: ['vuetify'],
  },
  future: {
    compatibilityVersion: 4
  },
  modules: [(_options, nuxt) => {
    nuxt.hooks.hook('vite:extendConfig', (config) => {
      // @ts-expect-error
      config.plugins.push(vuetify({ autoImport: true }))
    })
  },"@nuxtjs/supabase"],
  supabase: {
    redirectOptions:{
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ['/about','/login','/signup'],
      cookieRedirect: false,
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
