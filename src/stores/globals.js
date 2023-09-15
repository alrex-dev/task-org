import { defineStore } from 'pinia'

export const useGlobalsStore = defineStore('globals', () => {
  const apiURLRoot = 'http://localhost'
  
  return { apiURLRoot }
})