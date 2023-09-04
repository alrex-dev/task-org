<script setup>
import { useProjectStore } from '@/stores/project'
import { useCredentialStore } from '@/stores/credential'
import { useTimelogStore } from '@/stores/timelog'
import { useActivityStore } from '@/stores/activity'
</script>

<template>
<a href="#" class="search-result-item-link" @click.prevent="setProject">{{itemData.proj_name}}</a>
</template>

<script>
export default {
  created() {
    this.project = useProjectStore()
    this.cred = useCredentialStore()
    this.timelogs = useTimelogStore()
    this.activities = useActivityStore()

    this.projID = this.itemData.proj_id
    this.projName = this.itemData.proj_name
  },
  emits: ['setProjDetails', 'checkExistingSession', 'resetSearch', 'disableAllBoxes', 'enableAllBoxes'],
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {
      projID: 0,
      projName: '',
    }
  },
  methods: {
    setProject: function() {
      let self = this

      if (this.timelogs.sessionStarted) {
        alert('Cannot change Project while session is currently running!')

        return
      }

      this.disableAllBoxes()

      this.project.setProject(this.itemData.proj_id, function() {
        self.cred.refresh()
        self.timelogs.refresh()
        self.activities.refresh()

        self.$emit('setProjDetails')
        self.$emit('checkExistingSession')
        self.$emit('resetSearch')

        self.enableAllBoxes()
      });
    },
    disableAllBoxes: function() {
      this.$emit('disableAllBoxes')
    },
    enableAllBoxes: function() {
      this.$emit('enableAllBoxes')
    }
  },
  computed: {
  }
}
</script>
