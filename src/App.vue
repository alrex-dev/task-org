<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="main-nav">
    <div class="main-nav-inner d-flex align-items-center">
      <h1 class="">Task Organizer</h1>

      <ul class="nav-links" id="myTab" role="tablist">
        <li class="nav-link" role="presentation">
          <router-link class="nav-link-button" to="/">Home</router-link>
        </li>
        <li class="nav-link" role="presentation">
          <router-link class="nav-link-button" to="/recent">Recent Activities</router-link>
        </li>
      </ul>

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
