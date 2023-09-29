<script setup>
import RecentActivities from '@/components/RecentActivities.vue'
</script>

<template>
  <div class="main-content-wrapper">
    <RecentActivities />
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('Recent Activities loaded');
  },
  data: function () {
    return {
    }
  },
  methods: {
  }
}
</script>