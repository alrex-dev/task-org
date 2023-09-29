<script setup>
import { useRecentActivitiesStore } from '@/stores/recent-activities'
import Moment from 'moment'
import Projects from '@/components/Projects.vue'
</script>

<template>
  <div class="recent-activities">
    <div class="recent-activities-inner">
        <table class="table table-striped">
          <thead>
            <tr>
              <th style="width: 150px;">Activity Date</th>
              <th style="width: 250px;">Project</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in getRecentActivities" :key="a.id">
              <td>{{formatActDate(a.act_date)}}</td>
              <td>{{a.proj_name}}</td>
              <td>{{a.act_desc}}</td>
            </tr>
          </tbody>
        </table>
        <div class="recent-activities-loader" :class="isLoading"></div>
        <div class="text-center" :class="hasMore"><button class="btn btn-primary" @click.prevent="loadMore">Load More</button></div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.recentActivities = useRecentActivitiesStore()

    console.log('Created: Recent Activities Component')
  },
  mounted() {
    this.recentActivities.refresh()
  },
  data: function () {
    return {
    }
  },
  methods: {
    formatActDate: function(date) {
      return Moment(date, 'YYYY-MM-DD').format('MMM DD, YYYY')
    },
    loadMore: function() {
      //this.recentActivities.resetHasMore()
      this.recentActivities.loadMoreData()
    }
  },
  computed: {
    getRecentActivities() {
      //console.log(this.recentActivities.hasMore);
      return this.recentActivities.data
    },
    isLoading() {
      return this.recentActivities.loading ? 'd-block' : 'd-none'
    },
    hasMore() {
      return this.recentActivities.hasMore ? 'd-block' : 'd-none'
    }
  }
}
</script>