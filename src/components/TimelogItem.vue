<script setup>
import { useTimelogStore } from '@/stores/timelog'
import Moment from 'moment'
</script>

<template>
<div class="controls">
    <a href="#" class="button edit-2 me-3" @click.prevent="editTimelog" v-if="!isEdit"><span class="icon"></span><span class="label">Edit</span></a>
    <a href="#" class="button delete-2" @click.prevent="deleteTimelog" v-if="!isEdit"><span class="icon"></span><span class="label">Delete</span></a>
    
    <a href="#" class="button save-2 me-3" @click.prevent="saveTimelog" v-if="isEdit"><span class="icon"></span><span class="label">Save</span></a>
    <a href="#" class="button cancel-2" @click.prevent="cancelEdit" v-if="isEdit"><span class="icon"></span><span class="label">Cancel</span></a>
</div>
<div v-if="isEdit">
    <input type="time" name="tlog-from" v-model="tlogFrom" /> - <input type="time" name="tlog-to" v-model="tlogTo" />
</div>
<div @dblclick.prevent="editTimelog" v-if="!isEdit">
    {{formatTime(log.log_from)}} - {{formatTime(log.log_to)}} <span class="hrs">[{{log.log_hrs}} {{getUnit(log.log_hrs)}}]</span>
</div>
</template>

<script>
export default {
  created() {
    this.timelogs = useTimelogStore()
    
    this.tlogID = this.log.log_id
    this.tlogRefID = this.log.log_ref_id
    this.tlogFrom = this.log.log_from
    this.tlogTo = this.log.log_to
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    log: {
      type: Object
    }
  },
  data() {
    return {
      tlogID: 0,
      tlogRefID: '',
      tlogFrom: '',
      tlogTo: '',
      isEdit: false
    }
  },
  methods: {
    formatTime: function(t) {
      return Moment(t, 'HH:mm').format('hh:mm a')
    },
    getUnit: function(h) {
      return (h > 1) ? 'hrs' : 'hr'
    },
    editTimelog: function() {
      this.tlogFrom = this.log.log_from
      this.tlogTo = this.log.log_to
      
      this.isEdit = true
    },
    cancelEdit: function() {
      this.isEdit = false
    },
    saveTimelog: function() {
      let from = Moment(this.tlogFrom, 'HH:mm')
      let to = Moment(this.tlogTo, 'HH:mm')
      let mn = Moment('00:00', 'HH:mm')
      
      if (to.format('HH:mm') === mn.format('HH:mm')) {
        to.add(1, 'day')
      }
      
      if (from > to) {
        alert('Invalid values!')
        return
      }

      this.disableBox()
      
      this.timelogs.updateTimelog(this.tlogID, this.tlogFrom, this.tlogTo, this.enableBox)
      
      this.isEdit = false
    },
    deleteTimelog() {
      if (confirm('Delete this timelog?')) {
        this.disableBox()

        this.timelogs.deleteTimelog(this.tlogID, this.enableBox)
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
  }
}
</script>