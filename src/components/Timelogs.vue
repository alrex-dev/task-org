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
                <div class="col col-6 p-0 d-flex align-items-center"><h2>Time Logs</h2><div class="filtered-label d-inline-block ms-2" v-if="isFiltered()">Filtered</div></div>
                <div class="col col-6 p-0 d-flex align-items-center justify-content-end">
                    <input type="date" class="search-date" name="search-date-from" id="search-date-from" v-model="filterDateFrom" @blur.prevent="searchTimelogs" />&nbsp;
                    <input type="date" class="search-date" name="search-date-to" id="search-date-to" v-model="filterDateTo" @blur.prevent="searchTimelogs" />
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
                                
                                <div v-if="!projectSelected"><div class="px-3 py-3">No Project selected!</div></div>
                                <div v-if="projectSelected && !hasLogs"><div class="px-3 py-3">No logs yet</div></div>

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
    let self = this
    let enter = false
    
    window.addEventListener('mousemove', function(e) {
      if ( self.isTimelogComponentScope(e.target) && !enter ) {
        enter = true
        
        if (self.$refs.scroller) {
          self.$refs.scroller.addEventListener('scroll', self.locateActions)
        }
      } else if ( !self.isTimelogComponentScope(e.target) && enter) {
        enter = false
        
        if (self.$refs.scroller) {
          self.$refs.scroller.removeEventListener('scroll', self.locateActions)
        }
      }
    })
  },
  expose: ['checkExistingSession', 'disableBox', 'enableBox', 'locateTimelogs', 'scrollBottom'],
  emits: ['locateActions'],
  props: {
  },
  data() {
    return {
      disabled: false,
      throttleTO: null,
      filterDateFrom: '',
      filterDateTo: ''
    }
  },
  methods: {
    isFiltered: function() {
      return (this.filterDateFrom.trim() != '' || this.filterDateTo.trim() != '') ? true : false;
    },
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
    },
    locateActions: function() {
      clearTimeout(this.throttleTO)
      
      let self = this
      this.throttleTO = setTimeout(function() {
        const timelogs = document.querySelectorAll('#timelogs .time-items .time-item')
        let date_id = ''
        let offsetTop = 0
        
        for(let x=0; x<timelogs.length; x++) {
            offsetTop = timelogs[x].offsetTop - self.$refs.scrollerInner.offsetTop - 15
            
            if (offsetTop >= self.$refs.scroller.scrollTop) {
                date_id = timelogs[x].id
                break
            }
            
           //console.log(timelogs[x].id, offsetTop, self.$refs.scroller.scrollTop)
        }
      
        self.$emit('locateActions', date_id)
      }, 10)
    },
    locateTimelogs: function(dateID) {
      const timelogs = document.querySelectorAll('#timelogs .time-items .time-item')
      let date_id = ''
      let offsetTop = 0
        
      for(let x=0; x<timelogs.length; x++) {
        if (timelogs[x].id == dateID) {
          offsetTop = timelogs[x].offsetTop - this.$refs.scrollerInner.offsetTop - 15
          
          this.$refs.scroller.scrollTop = offsetTop
          break;
        }
      }
    },
    isTimelogComponentScope: function(obj) {
      if (obj.id == 'timelogs') {
        return true;
      } else {
        if (obj.nodeName != 'BODY') {
          return this.isTimelogComponentScope(obj.parentElement)
        } else {
          return false
        }
      }
    },
    searchTimelogs: function() {
      if (typeof this.timelogs.projectID == 'undefined' || this.timelogs.projectID == '') {
        this.filterDateFrom = ''
        this.filterDateTo = ''
        alert('No Project selected!')
        return
      }

      //console.log(dateF.isValid())

      if (this.filterDateFrom == '' && this.filterDateTo == '') {
        this.timelogs.refresh()
        //return
      } else {
        this.timelogs.search(this.filterDateFrom, this.filterDateTo)
      }
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