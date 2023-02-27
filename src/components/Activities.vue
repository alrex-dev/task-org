<script setup>
import { useActivityStore } from '@/stores/activity'
import ActivityGroup from '@/components/ActivityGroup.vue'
import { Modal } from 'bootstrap'
</script>

<template>
<div class="boxed-content" :class="isDisabled" id="activities">
    <div class="boxed-content-inner">
        <div class="box-title container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-4 p-0 d-flex align-items-center"><h2>Actions</h2></div>
                <div class="col col-8 p-0 d-flex align-items-center justify-content-end">
                    <input type="text" class="search-text w-25 me-3" name="search-activity" id="search-activity" value="" placeholder="Search" />
                    <input type="date" class="search-date" name="search-date-from" id="search-date-from" value="" />&nbsp;
                    <input type="date" class="search-date me-3" name="search-date-to" id="search-date-to" value="" />
                    <a href="#" class="button add" @click.prevent="addActivity"><span class="icon"></span><span class="label">Add</span></a>
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
    this.popup = new Modal('#addActivityPopup', {keyboard: false})
  },
  expose: ['disableBox', 'enableBox'],
  data() {
    return {
      actionDesc: '',
      disabled: false
    }
  },
  methods: {
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
      
      let self = this
      
      setTimeout(function() {
        self.$refs.scroller.scrollTop = self.$refs.scrollerInner.offsetHeight - self.$refs.scroller.offsetHeight
      }, 500)
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
    }
  }
}
</script>
