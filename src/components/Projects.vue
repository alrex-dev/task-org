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
        
          <Project ref="projectComponent" @disable-all-boxes="disableAllBoxes" @enable-all-boxes="enableAllBoxes" @set-project-callback="setProjectCallback" @check-existing-session="checkForExistingSession" />
            
        </div>
        <div class="col col-12 col-md-6 p-0">
        
          <Credentials ref="credentialComponent" />
            
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col col-12 col-md-6 p-0">
        
          <Timelogs ref="timelogComponent" @locate-actions="locateActions" />
            
        </div>
        <div class="col col-12 col-md-6 p-0">
        
          <Activities ref="activityComponent" @locate-timelogs="locateTimelogs" />
            
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

    /**
     * Multiple session is now enabled
     * Sep 4, 2023
    
    //Check for existing session and if found, set it as current project
    this.project.checkForSession(function() {
      //self.project.refresh()
      self.cred.refresh()
      self.timelogs.refresh()
      self.activities.refresh()

      self.$refs.projectComponent.setProjDetails()
      
      self.setProjectCallback()

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
    */

    self.project.refresh()
    self.cred.refresh()
    self.timelogs.refresh()
    self.activities.refresh()

    self.$refs.projectComponent.setProjDetails()

    self.enableAllBoxes()

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
    },
    locateActions: function(dateID) {
      this.$refs.activityComponent.locateActions(dateID)
    },
    locateTimelogs: function(dateID) {
      this.$refs.timelogComponent.locateTimelogs(dateID)
    },
    setProjectCallback: function() {
      this.$refs.timelogComponent.scrollBottom()
      this.$refs.activityComponent.scrollBottom()
    },
    checkForExistingSession: function() {
      //trigger checkExistingSession function in Session Control component
      //this.$refs.timelogComponent.enableBox()
      //this.$refs.timelogComponent.checkExistingSession()
      let self = this

      this.$refs.timelogComponent.disableBox()
      
      this.timelogs.checkForExistingSession(function() {
        //trigger checkExistingSession function in Session Control component
        self.$refs.timelogComponent.enableBox()

        self.$refs.timelogComponent.checkExistingSession()
      })
    }
  },
  computed: {
  }
}
</script>

<style scoped>
</style>
