<script setup>
import { useTimelogStore } from '@/stores/timelog'
import { useActivityStore } from '@/stores/activity'
import Moment from 'moment'
</script>

<template>
<div class="button-cont mt-3 mb-4">
    <button class="btn btn-primary" :class="{'session-started': isStarted}" @click="toggleSession">{{getButtonText}} Session</button>
</div>
<div class="time-info"><span class="label">Today:</span> <span class="value">{{getTodayDate}}</span></div>
<div class="time-info mb-2"><span class="label">Running:</span> <span class="value">{{hr}}:{{min}} {{compHrs}}</span></div>
<div class="time-info-big" v-if="isStarted">{{getStartTime}} <span class="separator">-</span> ...</div>
</template>

<script>
export default {
  created() {
    this.activities = useActivityStore()
    this.timelogs = useTimelogStore()
    this.nowDate = Moment()
    
    this.setTodayIntervalID = setInterval(this.setToday, 1000)

    //console.log(this.timelogs.sessionData)

    console.log('Created: Session Control Component')
  },
  expose: ['checkExistingSession'],
  emits: ['stopSession', 'disableBox', 'enableBox'],
  props: {
  },
  data() {
    return {
      nowDate: '',
      startDateTime: null,
      //endTime: null,
      hr: '00',
      min: '00',
      compHrs: '',
      //sec: '00',
      isStarted: false,
      tickTockIntervalID: null,
      setTodayIntervalID: null
    }
  },
  methods: {
    toggleSession: function() {
      if (typeof this.timelogs.projectID == 'undefined' || this.timelogs.projectID == '') {
        alert('No Project selected!')
        return
      }

      let self = this

      if (!this.isStarted) {
        this.isStarted = true
        this.startDateTime = Moment()
        
        this.timelogs.startSession(this.startDateTime)
          
        //this.tickTock()
        this.tickTockIntervalID = setInterval(this.tickTock, 1000)
      } else {
        this.isStarted = false
        this.startDateTime = null
        
        let endDateTime = Moment()
        
        this.disableBox()

        this.timelogs.stopSession(endDateTime, function() {
          self.activities.updateActivityTime()
          self.enableBox()
        })
        
        this.hr = '00'
        this.min = '00'
        this.compHrs = ''
        //this.sec = '00'
        
        clearInterval(this.tickTockIntervalID)
        
        //Calling a callback function from the parent component
        this.$emit('stopSession')
      }
    },
    tickTock: function() {
      let nowTime = Moment().format('HH:mm')
      let startTime = this.startDateTime.format('HH:mm')
      let diff = Moment(nowTime, 'HH:mm').diff(Moment(startTime, 'HH:mm'), 'minutes')

      let nowDay = Moment().format('YYYY-MM-DD')
      let startDay = this.startDateTime.format('YYYY-MM-DD')

      if ( nowDay > startDay ) {
        let diff2 = Moment(nowDay, 'YYYY-MM-DD').diff( Moment(startDay, 'YYYY-MM-DD'), 'minutes' )
        
        diff += diff2
      }
      
      //console.log( diff2 )
      
      let startSec = this.startDateTime.format('ss')
      let startMin = startSec / 60

      diff += parseFloat(startMin.toFixed(2))
      
      let hr = Math.floor(diff / 60)
      let min = Math.floor(diff - (hr * 60))
      //let sec = diff - (((hr * 60) * 60) + (min * 60))
      
      //console.log(startTime, nowTime)
      //console.log(hr, min, sec)
      
      this.hr = (hr.toString().length < 2) ? '0' + hr.toString() : hr.toString();
      this.min = (min.toString().length < 2) ? '0' + min.toString() : min.toString();
      //this.sec = (sec.toString().length < 2) ? '0' + sec.toString() : sec.toString();
      
      let computedHrs = Math.floor(diff) / 60
      
      this.compHrs = '[' + computedHrs.toFixed(2) + ' ' + ((computedHrs > 1) ? 'hrs' : 'hr') + ']'
    },

    /*
    tickTock: function() {
      let nowTime = Moment().format('HH:mm:ss')
      let startTime = this.startDateTime.format('HH:mm:ss')
      let diff = Moment(nowTime, 'HH:mm:ss').diff(Moment(startTime, 'HH:mm:ss'), 'seconds')
      
      let hr = Math.floor((diff / 60) / 60)
      let min = Math.floor((diff - ((hr * 60) * 60)) / 60)
      //let sec = diff - (((hr * 60) * 60) + (min * 60))
      
      //console.log(startTime, nowTime)
      //console.log(hr, min, sec)
      
      this.hr = (hr.toString().length < 2) ? '0' + hr.toString() : hr.toString();
      this.min = (min.toString().length < 2) ? '0' + min.toString() : min.toString();
      //this.sec = (sec.toString().length < 2) ? '0' + sec.toString() : sec.toString();
    },
    */

    setToday: function() {
      this.nowDate = Moment()
      
      //Force stop session and start another session
      //if (this.isStarted && (this.nowDate.format('HH:mm:ss') == '10:30:00')) {
      //if (this.isStarted && (this.nowDate.format('YYYY-MM-DD') > this.startDateTime.format('YYYY-MM-DD')) && (this.nowDate.format('HH:mm') >= '00:00')) {
      
      /*
      //NOTE: Move this to algorithm to the Button event.
      if (this.isStarted && (this.nowDate.format('YYYY-MM-DD') > this.startDateTime.format('YYYY-MM-DD'))) {
        let endDateTime = Moment()
        
        this.timelogs.stopSession(endDateTime)
        //clearTimeout(this.tickTockTO)
        clearInterval(this.tickTockIntervalID)
        
        this.startDateTime = endDateTime
        this.timelogs.startSession(endDateTime)
        //this.tickTock()
        this.tickTockIntervalID = setInterval(this.tickTock, 1000)
      }
      */
      
      //let self = this
      
      //this.getTodayTO = setTimeout(this.getToday, 1000)
    },
    checkExistingSession: function() {
      if (this.timelogs.sessionStarted && !this.isStarted) {
        //TO DO:
        //Need to check if existing session is very old (more than a day) already

        this.isStarted = true
        this.startDateTime = Moment(this.timelogs.sessionData.startDate + ' ' + this.timelogs.sessionData.startTime, 'YYYY-MM-DD HH:mm')

        //this.tickTock()
        this.tickTockIntervalID = setInterval(this.tickTock, 1000)
      }

      console.log('From Session 2')
    },
    disableBox: function() {
      this.$emit('disableBox')
    },
    enableBox: function() {
      this.$emit('enableBox')
    }
  },
  computed: {
    getButtonText: function() {
      return this.isStarted ? 'Stop' : 'Start'
    },
    getStartTime: function() {
      return this.startDateTime ? this.startDateTime.format('hh:mm a') : ''
    },
    getTodayDate: function() {
      return this.nowDate.format('MMM DD, YYYY hh:mm a')
    }
  }
}
</script>