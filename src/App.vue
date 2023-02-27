<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="main-nav">
    <div class="main-nav-inner d-flex align-items-center">
      <h1 class="">Task Organizer</h1>
    </div>
  </header>

  <main class="main-content">
    <div class="main-content-inner">
      <RouterView />
    </div>
  </main>
</template>

<script>
export default {
  title: 'Task Organizer',
  data: function () {
    return {
        //userid: 10
    }
  }
}
</script>

<style scoped>
</style>
