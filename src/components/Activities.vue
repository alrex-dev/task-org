<script setup>
import { useActivityStore } from '@/stores/activity'
import ActivityGroup from '@/components/ActivityGroup.vue'
import { Modal } from 'bootstrap'
import moment from 'moment'
</script>

<template>
<div class="boxed-content" :class="[isDisabled, isExpanded]" id="activities">
    <div class="boxed-content-inner">
        <div class="box-title container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-4 p-0 d-flex align-items-center"><h2>Actions</h2><div class="filtered-label d-inline-block ms-2" v-if="isFiltered()">Filtered</div></div>
                <div class="col col-8 p-0 d-flex align-items-center justify-content-end">
                  <a href="#" class="button add me-3" @click.prevent="addActivity"><span class="icon"></span><span class="label">Add</span></a>
                  <input type="text" class="search-text w-25 me-3" name="search-activity" id="search-activity" placeholder="Search" v-model="kw" @keyup.prevent="searchActivity" />
                  <input type="date" class="search-date" name="search-date-from" id="search-date-from" v-model="filterDateFrom" @blur.prevent="searchActivity" />&nbsp;
                  <input type="date" class="search-date me-3" name="search-date-to" id="search-date-to" v-model="filterDateTo" @blur.prevent="searchActivity" />
                  <a href="#" class="button expand" :class="expandButtonIcon" @click.prevent="toggleExpand"><span class="icon"></span><span class="label">{{expandButtonText}}</span></a>
                </div>
            </div>
        </div>
        <div class="box-main">
            <div class="box-main-wrapper" ref="scroller">
                <div class="box-main-wrapper-inner" ref="scrollerInner">

                    <div class="activities" v-if="projectSelected">
                      <div class="activity-item" :id="g.act_date_id" v-for="g in getActivities" :key="g.act_date_id">
                          <ActivityGroup :actgroup="g" @disable-box="disableBox" @enable-box="enableBox" />
                      </div>
                    </div>

                    <div v-if="!projectSelected">No Project selected!</div>
                    <div v-if="projectSelected && !hasActivities">No Actions made yet</div>

                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="addActivityPopup" tabindex="-1" v-on='{"shown.bs.modal": modalShown}'>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">New Action</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div><textarea class="w-100" rows="6" v-model="actionDesc" placeholder="" ref="newActionInput"></textarea></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="saveActivity">Save</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
  created() {
    this.activities = useActivityStore()
    
    //setting initial dataset
    //this.activities.refresh()

    console.log('Created: Activities Component')
  },
  mounted() {
    let self = this
    let enter = false
    
    window.addEventListener('mousemove', function(e) {
      if ( self.isActivityComponentScope(e.target) && !enter ) {
        enter = true
        
        if (self.$refs.scroller) {
          self.$refs.scroller.addEventListener('scroll', self.locateTimelogs)
        }
      } else if ( !self.isActivityComponentScope(e.target) && enter) {
        enter = false
        
        if (self.$refs.scroller) {
          self.$refs.scroller.removeEventListener('scroll', self.locateTimelogs)
        }
      }
    })
    
    this.popup = new Modal('#addActivityPopup', {keyboard: false})
  },
  expose: ['disableBox', 'enableBox', 'locateActions', 'scrollBottom'],
  emits: ['locateTimelogs'],
  data() {
    return {
      actionDesc: '',
      disabled: false,
      throttleTO: null,
      expanded: false,
      expandButtonText: 'Max',
      expandButtonIcon: 'max',
      kw: '',
      filterDateFrom: '',
      filterDateTo: ''
    }
  },
  methods: {
    isFiltered: function() {
      return (this.kw.trim() != '' || this.filterDateFrom.trim() != '' || this.filterDateTo.trim() != '') ? true : false;
    },
    scrollBottom: function() {
      let self = this
      
      setTimeout(function() {
        self.$refs.scroller.scrollTop = self.$refs.scrollerInner.offsetHeight - self.$refs.scroller.offsetHeight
      }, 500)
    },
    addActivity: function() {
      if (typeof this.activities.projectID == 'undefined' || this.activities.projectID == '') {
        alert('No Project selected!')
        return
      }

      this.popup.show()
    },
    saveActivity: function() {
      if (this.actionDesc === '') {
        alert('A value is required!');

        this.$refs.newActionInput.focus()

        return;
      }

      this.disableBox()
      
      this.activities.saveActivity(this.actionDesc, this.enableBox)
      
      this.popup.hide()
      
      this.actionDesc = ''
      
      this.scrollBottom()
      
      //console.log(this.$refs.scrollerInner.offsetHeight, this.$refs.scroller.offsetHeight);
    },
    modalShown: function() {
      this.$refs.newActionInput.focus()
    },
    disableBox: function() {
      this.disabled = true
    },
    enableBox: function() {
      this.disabled = false
    },
    locateActions: function(dateID) {
      const activities = document.querySelectorAll('#activities .activities .activity-item')
      let date_id = ''
      let offsetTop = 0
        
      for(let x=0; x<activities.length; x++) {
        if (activities[x].id == dateID) {
          offsetTop = activities[x].offsetTop - this.$refs.scrollerInner.offsetTop - 15
          
          this.$refs.scroller.scrollTop = offsetTop
          break;
        }
      }
    },
    locateTimelogs: function() {
      clearTimeout(this.throttleTO)
      
      let self = this
      this.throttleTO = setTimeout(function() {
        const activities = document.querySelectorAll('#activities .activities .activity-item')
        let date_id = ''
        let offsetTop = 0
        
        for(let x=0; x<activities.length; x++) {
            offsetTop = activities[x].offsetTop - self.$refs.scrollerInner.offsetTop
            
            if (offsetTop >= self.$refs.scroller.scrollTop) {
                date_id = activities[x].id
                break
            }
            
           //console.log(activities[x].id, offsetTop, self.$refs.scroller.scrollTop)
        }
      
        self.$emit('locateTimelogs', date_id)
      }, 10)
    },
    isActivityComponentScope: function(obj) {
      if (obj.id == 'activities') {
        return true
      } else {
        if (obj.nodeName != 'BODY') {
          return this.isActivityComponentScope(obj.parentElement)
        } else {
          return false
        }
      }
    },
    toggleExpand: function() {
      this.expanded = this.expanded ? false : true
      this.expandButtonText = this.expanded ? 'Min' : 'Max'
      this.expandButtonIcon = this.expanded ? 'min' : 'max'
    },
    searchActivity: function() {
      if (typeof this.activities.projectID == 'undefined' || this.activities.projectID == '') {
        this.kw = ''
        this.filterDateFrom = ''
        this.filterDateTo = ''
        alert('No Project selected!')
        return
      }

      //let dateF = moment(this.filterDateFrom)
      //let dateT = moment(this.filterDateTo)

      //console.log(dateF.isValid())

      if (this.kw == '' && this.filterDateFrom == '' && this.filterDateTo == '') {
        this.activities.refresh()
        //return
      } else {
        this.activities.search(this.kw, this.filterDateFrom, this.filterDateTo)
      }
    }
  },
  computed: {
    getActivities() {
      this.activities.updateActivityTime()
      
      return this.activities.data
    },
    hasActivities() {
      return this.activities.data.length ? true : false
    },
    projectSelected() {
      return (typeof this.activities.projectID != 'undefined' && this.activities.projectID != '') ? true : false
    },
    isDisabled() {
      return (this.disabled) ? 'disabled' : ''
    },
    isExpanded() {
      return (this.expanded) ? 'fullscreen' : ''
    }
  }
}
</script>
