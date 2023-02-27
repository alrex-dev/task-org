<script setup>
import { useActivityStore } from '@/stores/activity'
import { useTimelogStore } from '@/stores/timelog'
import Moment from 'moment'
</script>

<template>
<div class="controls">
    <a href="#" class="button edit-2 me-3" @click.prevent="editActivity" v-if="!isEdit"><span class="icon"></span><span class="label">Edit</span></a>
    <a href="#" class="button delete-2" @click.prevent="deleteActivity" v-if="!isEdit"><span class="icon"></span><span class="label">Delete</span></a>
    <a href="#" class="button save-2 me-3" @click.prevent="saveActivity" v-if="isEdit"><span class="icon"></span><span class="label">Save</span></a>
    <a href="#" class="button cancel-2" @click.prevent="cancelEdit" v-if="isEdit"><span class="icon"></span><span class="label">Cancel</span></a>
</div>
<div v-if="isEdit"><textarea class="w-100" rows="4" v-model="actionDesc" placeholder="" ref="editActionInput" @keyup.esc="cancelEdit"></textarea></div>
<div style="white-space: pre" @dblclick.prevent="editActivity" v-if="!isEdit">{{act.action_desc}}</div>
<div class="time">{{getTimeInfo}}</div>
</template>

<script>
export default {
  created() {
    this.activities = useActivityStore()
    
    this.actionID = this.act.action_id
    this.actionDesc = this.act.action_desc

    //console.log(timelogs.sessionData)
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    act: {
      type: Object
    }
  },
  data() {
    return {
      actionID: 0,
      actionDesc: '',
      isEdit: false
    }
  },
  methods: {
    editActivity: function() {
      this.actionDesc = this.act.action_desc
      
      this.isEdit = true

      this.$nextTick(
        function () {
          this.$refs.editActionInput.focus()
          this.$refs.editActionInput.select()
        }.bind(this)
      )
      
    },
    saveActivity: function() {
      if (this.actionDesc === '') {
        alert('Value is required!')
        return
      }

      this.disableBox()
      
      this.activities.updateActivity(this.actionID, this.actionDesc, this.enableBox)
      
      this.isEdit = false
    },
    cancelEdit: function() {
      this.isEdit = false
    },
    deleteActivity: function() {
      if (confirm('Delete this item?')) {
        this.disableBox()

        this.activities.deleteActivity(this.actionID, this.enableBox)
      }
    },
    disableBox: function() {
      this.$emit('disableBox')
    },
    enableBox: function() {
      this.$emit('enableBox')
    }
  },
  computed: {
    getTimeInfo: function() {
      const timelogs = useTimelogStore()
      let timeInfo = ''

      if (timelogs.sessionData && this.act.timelog_id == timelogs.sessionData.id) {
        timeInfo = 'Current Running Session'
      } else if (this.act.log_from != '' && this.act.log_to != '') {
        timeInfo = Moment(this.act.log_from, 'HH:mm').format('hh:mm a') + ' - ' + Moment(this.act.log_to, 'HH:mm').format('hh:mm a')
      } else if (this.act.log_from != '' && this.act.log_to == '') {
        timeInfo = 'Current Running Session'
      }

      return timeInfo
    }
  }
}
</script>