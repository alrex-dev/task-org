import { defineStore } from 'pinia'

export const useGlobalsStore = defineStore('globals', () => {
  const apiURLRoot = 'http://localhost:8000'
  
  return { apiURLRoot }
})