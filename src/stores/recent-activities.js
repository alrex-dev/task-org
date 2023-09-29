import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
//import Moment from 'moment'
import Axios from 'axios'

import { useGlobalsStore } from '@/stores/globals'

export const useRecentActivitiesStore = defineStore('recent_activities', () => {
  const globals = useGlobalsStore()
  
  const data = ref([])
  const hasMore = ref(false)
  const loading = ref(false)
  const lastDate = ref('')
  const apiURL = globals.apiURLRoot + '/?entity=recent-activities'
  
  function init() {
    //check for active session
  }

  function loadMoreData() {
    let self = this

    this.hasMore = false
    this.loading = true

    Axios.get(apiURL, {params: {startDate: this.lastDate}}).then(function(response) {
      self.hasMore = (response.data.remaining > 0) ? true : false
      self.lastDate = response.data.last_date

      self.loading = false

      for(let x=0; x<response.data.data.length; x++) {
        self.data.push(response.data.data[x]);
      }
    })
  }

  function resetHasMore() {
    this.hasMore = false
  }

  function refresh() {
    let self = this

    this.loading = true

    Axios.get(apiURL, {}).then(function(response) {
      self.data = response.data.data
      self.hasMore = (response.data.remaining > 0) ? true : false
      self.lastDate = response.data.last_date

      self.loading = false;
    })
  }

  return { data, hasMore, loading, refresh, loadMoreData, resetHasMore }
});