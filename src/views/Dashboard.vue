<script setup>
import Projects from '@/components/Projects.vue'
</script>

<template>
  <div class="main-content-wrapper">
    <Projects />
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('Dashboard loaded');
  },
  data: function () {
    return {
    }
  },
  methods: {
  }
}
</script>