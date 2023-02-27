<script setup>
import Project from '@/components/Project.vue'
import Credentials from '@/components/Credentials.vue'
import Timelogs from '@/components/Timelogs.vue'
import Activities from '@/components/Activities.vue'
import { useProjectStore } from '@/stores/project'
import { useCredentialStore } from '@/stores/credential'
import { useTimelogStore } from '@/stores/timelog'
import { useActivityStore } from '@/stores/activity'
</script>

<template>
  <div class="project">
    <div class="container-fluid">
      <div class="row">
        <div class="col col-12 col-md-6 p-0">
        
          <Project ref="projectComponent" @disable-all-boxes="disableAllBoxes" @enable-all-boxes="enableAllBoxes" />
            
        </div>
        <div class="col col-12 col-md-6 p-0">
        
          <Credentials ref="credentialComponent" />
            
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col col-12 col-md-6 p-0">
        
          <Timelogs ref="timelogComponent" />
            
        </div>
        <div class="col col-12 col-md-6 p-0">
        
          <Activities ref="activityComponent" />
            
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.project = useProjectStore()
    this.cred = useCredentialStore()
    this.timelogs = useTimelogStore()
    this.activities = useActivityStore()
  },
  mounted() {
    let self = this

    this.disableAllBoxes()

    //Check for existing session and if found, set it as current project
    this.project.checkForSession(function() {
      self.project.refresh()
      self.cred.refresh()
      self.timelogs.refresh()
      self.activities.refresh()

      self.$refs.projectComponent.setProjDetails()

      let self2 = self

      self.$refs.timelogComponent.disableBox()

      self.timelogs.checkForExistingSession(function() {
        //trigger checkExistingSession function in Session Control component
        self2.$refs.timelogComponent.enableBox()

        self2.$refs.timelogComponent.checkExistingSession()
      })

      self.enableAllBoxes()

      console.log('From Session')
    }, function() {
      self.project.refresh()
      self.cred.refresh()
      self.timelogs.refresh()
      self.activities.refresh()

      self.$refs.projectComponent.setProjDetails()

      self.enableAllBoxes()
    })
  },
  data: function () {
    return {
    }
  },
  methods: {
    checkExistingSession: function() {
      //this.$refs.timelogComponent.checkExistingSession()
    },
    disableAllBoxes: function() {
      this.$refs.projectComponent.disableBox()
      this.$refs.credentialComponent.disableBox()
      this.$refs.timelogComponent.disableBox()
      this.$refs.activityComponent.disableBox()
    },
    enableAllBoxes: function() {
      this.$refs.projectComponent.enableBox()
      this.$refs.credentialComponent.enableBox()
      this.$refs.timelogComponent.enableBox()
      this.$refs.activityComponent.enableBox()
    }
  },
  computed: {
  }
}
</script>

<style scoped>
</style>
