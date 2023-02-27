<script setup>
import { useTimelogStore } from '@/stores/timelog'
import TimelogGroup from '@/components/TimelogGroup.vue'
import SessionControl from '@/components/SessionControl.vue'
</script>

<template>
<div class="boxed-content" :class="isDisabled" id="timelogs">
    <div class="boxed-content-inner">
        <div class="box-title container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-6 p-0 d-flex align-items-center"><h2>Time Logs</h2></div>
                <div class="col col-6 p-0 d-flex align-items-center justify-content-end">
                    <input type="date" class="search-date" name="search-date-from" id="search-date-from" v-on:change="filterLogs"/>&nbsp;
                    <input type="date" class="search-date" name="search-date-to" id="search-date-to" />
                    <!-- <a href="#" class="button add"><span class="icon"></span><span class="label">Add</span></a> -->
                </div>
            </div>
        </div>
        
        <div class="box-cont container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-8 p-0">
                    <div class="box-main">
                        <div class="box-main-wrapper" ref="scroller">
                            <div class="box-main-wrapper-inner" ref="scrollerInner">
                            
                                <div class="time-items" v-if="projectSelected && hasLogs">
                                    <div class="time-item" :id="g.log_date_id" v-for="g in getTimelogs" :key="g.log_date_id">
                                        <TimelogGroup :tgroup="g" @disable-box="disableBox" @enable-box="enableBox" />
                                    </div>
                                </div>
                                
                                <div v-if="!projectSelected">No Project selected!</div>
                                <div v-if="projectSelected && !hasLogs">No logs yet</div>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="col col-4 p-0">
                    <SessionControl @stop-session="scrollBottom" @disable-box="disableBox" @enable-box="enableBox" ref="sessionControlComponent" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
  created() {
    this.timelogs = useTimelogStore()
    
    let self = this

    //this.timelogs.refresh()

    console.log('Created: Timelogs Component')
  },
  mounted() {
    this.scrollBottom()
  },
  expose: ['checkExistingSession', 'disableBox', 'enableBox'],
  props: {
  },
  data() {
    return {
      disabled: false
    }
  },
  methods: {
    scrollBottom: function() {
      let self = this
      
      setTimeout(function() {
        self.$refs.scroller.scrollTop = self.$refs.scrollerInner.offsetHeight - self.$refs.scroller.offsetHeight
      }, 500)
    },
    filterLogs: function(e) {
      console.log(e.target.value)
    },
    checkExistingSession: function() {
      this.$refs.sessionControlComponent.checkExistingSession()
    },
    disableBox: function() {
      this.disabled = true
    },
    enableBox: function() {
      this.disabled = false
    }
  },
  computed: {
    getTimelogs() {
      this.timelogs.computeHrDiffs()
      
      return this.timelogs.data
    },
    hasLogs() {
      return this.timelogs.data.length ? true : false
    },
    projectSelected() {
      return (typeof this.timelogs.projectID != 'undefined' && this.timelogs.projectID != '') ? true : false
    },
    isDisabled() {
      return (this.disabled) ? 'disabled' : ''
    }
  }
}
</script>