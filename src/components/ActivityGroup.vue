<script setup>
import { useActivityStore } from '@/stores/activity'
import ActivityItem from '@/components/ActivityItem.vue'
import Moment from 'moment'
</script>

<template>
<div class="date">{{formatActDate()}}</div>

<div class="action" v-for="a in actgroup.actions" :key="a.action_id">
    <ActivityItem :act="a" @disable-box="disableBox" @enable-box="enableBox" />
</div>

<div class="add-activity-form" v-if="isAdd">
    <div><textarea class="w-100" rows="4" name="action-desc" v-model="actionDesc" placeholder="New Activity" @keyup.esc="cancelAdd" ref="addActivityInput"></textarea></div>
    <div>
        <a href="#" class="button save-2 me-3" @click.prevent="saveActivity"><span class="icon"></span><span class="label">Save</span></a>
        <a href="#" class="button cancel-2" @click.prevent="cancelAdd"><span class="icon"></span><span class="label">Cancel</span></a>
    </div>
</div>

<div class="control" v-if="showAddButton">
  <a href="#" class="button add-2" @click.prevent="addActivity" v-if="!isAdd"><span class="icon"></span><span class="label">Add</span></a>
</div>
</template>

<script>
export default {
  created() {
    this.activities = useActivityStore()
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    actgroup: {
      type: Object
    }
  },
  data() {
    return {
      actionDesc: '',
      isAdd: false
    }
  },
  methods: {
    formatActDate: function() {
        return Moment(this.actgroup.act_date, 'YYYY-MM-DD').format('MMMM DD, YYYY')
    },
    addActivity: function() {
      this.isAdd = true

      this.$nextTick(
        function () {
          this.$refs.addActivityInput.focus()
          this.$refs.addActivityInput.select()
        }.bind(this)
      );
    },
    saveActivity: function() {
      this.disableBox()

      this.activities.saveActivity2(this.actgroup.act_date, this.actionDesc, this.enableBox)

      this.actionDesc = ''

      this.isAdd = false
    },
    cancelAdd: function() {
      this.isAdd = false
    },
    disableBox: function() {
      this.$emit('disableBox')
    },
    enableBox: function() {
      this.$emit('enableBox')
    }
  },
  computed: {
    showAddButton: function() {
      return (this.actgroup.act_date == Moment().format('YYYY-MM-DD')) ? false : true
    }
  }
}
</script>