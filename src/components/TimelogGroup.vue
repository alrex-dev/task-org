<script setup>
import { useTimelogStore } from '@/stores/timelog'
import TimelogItem from '@/components/TimelogItem.vue'
import Moment from 'moment'
</script>

<template>
<div class="date">{{formatLogDate()}} <span class="hrs">[{{tgroup.log_date_hrs}} {{getUnit(tgroup.log_date_hrs)}}]</span></div>
<div class="time" v-for="t in tgroup.tlogs" :key="t.log_id">
    <TimelogItem :log="t"  @disable-box="disableBox" @enable-box="enableBox" />
</div>
</template>

<script>
export default {
  created() {
    this.timelogs = useTimelogStore()
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    tgroup: {
      type: Object
    }
  },
  data() {
    return {
    }
  },
  methods: {
    formatLogDate: function() {
        return Moment(this.tgroup.log_date, 'YYYY-MM-DD').format('MMMM DD, YYYY')
    },
    getUnit: function(h) {
        return (h > 1) ? 'hrs' : 'hr'
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
