import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Moment from 'moment'
import Axios from 'axios'

import { useGlobalsStore } from '@/stores/globals'
import { useProjectStore } from '@/stores/project'

export const useTimelogStore = defineStore('timelogs', () => {
  const globals = useGlobalsStore()
  
  const data = ref([])
  const sessionStarted = ref(false)
  const sessionData = ref(null)
  const projectID = ref('')
  const apiURL = globals.apiURLRoot + '/?entity=timelog'
  const apiURL2 = globals.apiURLRoot + '/?entity=session'
  
  function init() {
    //check for active session
  }
  
  function startSession(datetime) {
    sessionStarted.value = true
    
    this.addSession(datetime)
  }
  
  function stopSession(datetime, callback) {
    sessionStarted.value = false
    
    sessionData.value.endDate = datetime.format('YYYY-MM-DD')
    sessionData.value.endTime = datetime.format('HH:mm')
    
    this.saveTimelog(callback)

    //Remove session from database
    //No spinner, just run in the background
    Axios.delete(apiURL2, {params: {sessID: sessionData.value.id}}).then(function(response) {})

    sessionData.value = null
  }
  
  function addSession(datetime) {
    const project = useProjectStore()
    let sessID = Moment().format('YYYYMMDDHHmmss') + Math.ceil((Math.random() * 100))

    sessionData.value = {
      id: sessID,
      startDate: datetime.format('YYYY-MM-DD'),
      startTime: datetime.format('HH:mm'),
      endDate: null,
      endTime: null
    }

    //Store session to database
    //No spinner, just run in the background
    Axios.post(apiURL2, {
      sessID: sessionData.value.id,
      sessDate: sessionData.value.startDate,
      sessTime: sessionData.value.startTime,
      projID: project.projID
    }).then(function(response) {})
  }
  
  function saveTimelog(callback) {
    const project = useProjectStore()

    let sessData = this.sessionData

    //The original ID needs to be intact as this is used to delete the session
    let sessID = sessData.id

    if (sessData.endDate > sessData.startDate && sessData.endTime != '00:00') {
      //TO DO: Compute hour difference then check if less than 8
      //    If less than 8 then it's graveyard shift
      //        Create two logs for this
      //    If more than 8
      //        Create two logs where the End Time should be the end time for the max hours (8)

      //let startDateTime = Moment((sessData.startDate + ' ' + sessData.startTime), 'YYYY-MM-DD HH:mm')
      //let endDateTime = Moment((sessData.endDate + ' ' + sessData.endTime), 'YYYY-MM-DD HH:mm')

      //let diff = endDateTime.diff(startDateTime, 'minutes')
      //let hrDiff = diff / 60

      //console.log(diff)

      const sessData2 = {
        id: sessData.id,
        startDate: sessData.startDate,
        startTime: sessData.startTime,
        endDate: sessData.startDate,
        endTime: '00:00'
      }

      //Save the first log
      Axios.post(apiURL, {
        logRefID: sessData2.id,
        logDate: sessData2.startDate,
        timeFrom: sessData2.startTime,
        timeTo: '00:00',
        projID: project.projID
      }).then(function(response) {
        let found = false
        let log = {log_id: response.data.id, log_ref_id: sessData2.id, log_from: sessData2.startTime, log_to: sessData2.endTime, log_hrs: 0}
        
        for(let x=0; x<data.value.length; x++) {
          if (data.value[x].log_date == sessData2.startDate) {
            found = true
            data.value[x].tlogs.push(log)
          }
        }
        
        if (!found) {
          data.value.push({log_date_id: sessData2.startDate.replace(/-/g, ''), log_date: sessData2.startDate, log_date_hrs: 0, tlogs: [log]})
        }
      })

      //set ID for the second log
      sessID = Moment().format('YYYYMMDDHHmmss') + Math.ceil((Math.random() * 100))
      sessData.startDate = sessData.endDate
      sessData.startTime = '00:00';
        
      //sessData.endTime = '00:00';
    }

    Axios.post(apiURL, {
      logRefID: sessID,
      logDate: sessData.startDate,
      timeFrom: sessData.startTime,
      timeTo: sessData.endTime,
      projID: project.projID
    }).then(function(response) {
      
      let found = false
      let log = {log_id: response.data.id, log_ref_id: sessData.id, log_from: sessData.startTime, log_to: sessData.endTime, log_hrs: 0}
      
      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].log_date == sessData.startDate) {
          found = true
          data.value[x].tlogs.push(log)
        }
      }
      
      if (!found) {
        data.value.push({log_date_id: sessData.startDate.replace(/-/g, ''), log_date: sessData.startDate, log_date_hrs: 0, tlogs: [log]})
      }

      callback()

    })
  }
  
  function updateTimelog(id, t_from, t_to, callback) {
    Axios.put(apiURL, {
      itemID: id,
      timeFrom: t_from,
      timeTo: t_to
    }).then(function(response) {

      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].tlogs.length; y++) {
          if (data.value[x].tlogs[y].log_id == id) {
            data.value[x].tlogs[y].log_from = t_from
            data.value[x].tlogs[y].log_to = t_to
          }
        }
      }

      callback()

    })
  }
  
  function deleteTimelog(id, callback) {
    Axios.delete(apiURL, {params: {itemID: id}}).then(function(response) {

      let s_arr = []
      let e_arr = []
      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].tlogs.length; y++) {
          if (data.value[x].tlogs[y].log_id == id) {
            if (y > 0) {
              s_arr = data.value[x].tlogs.slice(0, y)
            }
            
            e_arr = data.value[x].tlogs.slice(y+1)
            
            data.value[x].tlogs = s_arr.concat(e_arr)
          }
        }
      }

      callback()

    })
  }

  function search(dateFrom, dateTo) {
    const project = useProjectStore()
    const projID = project.projID

    if (typeof projID != 'undefined' && projID != '') {
      let self = this

      Axios.get(apiURL, {params: {projID: projID, dateFrom: dateFrom, dateTo: dateTo}}).then(function(response) {
        self.data = response.data
      })
    } else {
      data.value = []
    }
  }
  
  function refresh() {
    const project = useProjectStore()
    const projID = project.projID
    const projData = project.data

    projectID.value = projID

    //console.log(projID)

    if (typeof projID != 'undefined' && projID != '') {
      let self = this

      Axios.get(apiURL, {params: {projID: projID}}).then(function(response) {
        self.data = response.data
      })
    } else {
      data.value = []
    }
  }

  function checkForExistingSession(callback) {
    const project = useProjectStore()

    //Check if there is a saved session
    Axios.get(apiURL2, {params: {projID: project.projID}}).then(function(response) {
      if (typeof response.data.sessID != 'undefined' && response.data.sessID != '') {
        sessionData.value = {
          id: response.data.sessID,
          startDate: response.data.sessDate,
          startTime: response.data.sessTime,
          endDate: null,
          endTime: null
        }

        sessionStarted.value = true

        callback()
      }
    })
  }
  
  function computeHrDiffs() {
    //let logs = data.value
    
    let dhrs = 0
    let tlog_frm = 0
    let tlog_to = 0
    let tdiff = 0
    let mn = Moment('00:00', 'HH:mm') //midnight
    
    for(let x=0; x<data.value.length; x++) {
      
      dhrs = 0
      
      for(let y=0; y<data.value[x].tlogs.length; y++) {
        tlog_frm = Moment(data.value[x].log_date + ' ' + data.value[x].tlogs[y].log_from, 'YYYY-MM-DD HH:mm')
        tlog_to = Moment(data.value[x].log_date + ' ' + data.value[x].tlogs[y].log_to, 'YYYY-MM-DD HH:mm')
          
        if (tlog_to.format('HH:mm') === mn.format('HH:mm')) {
          tlog_to.add(1, 'day')
        }
        
        
        tdiff = tlog_to.diff(tlog_frm, 'seconds')
        tdiff = (tdiff/60)/60
        
        //console.log(tdiff)
        
        data.value[x].tlogs[y].log_hrs = parseFloat(tdiff.toFixed(2))
        dhrs += data.value[x].tlogs[y].log_hrs
      }
      
      data.value[x].log_date_hrs = parseFloat(dhrs.toFixed(2))
    }
    
    //data.value = logs
  }
  
  //this.init()

  return { data, projectID, sessionStarted, sessionData, startSession, stopSession, addSession, saveTimelog, updateTimelog, deleteTimelog, search, refresh, computeHrDiffs, checkForExistingSession }
})
