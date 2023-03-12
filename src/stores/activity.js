import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Moment from 'moment'
import Axios from 'axios'

import { useGlobalsStore } from '@/stores/globals'
import { useProjectStore } from '@/stores/project'
import { useTimelogStore } from '@/stores/timelog'

export const useActivityStore = defineStore('activities', () => {
  const globals = useGlobalsStore()
  
  const data = ref([])
  const projectID = ref('')
  const apiURL = globals.apiURLRoot + '/task-org-api/?entity=activity'
  
  function init() {
    //check for active session
  }
  
  function saveActivity(desc, callback) {
    const timelogs = useTimelogStore()
    const project = useProjectStore()

    //console.log((timelogs.sessionData ? timelogs.sessionData.id : 'no session'))
    const timelogID = timelogs.sessionData ? timelogs.sessionData.id : ''
    const timeFrom = timelogs.sessionData ? timelogs.sessionData.startTime : ''
    const nowDateID = timelogs.sessionData ? Moment(timelogs.sessionData.startDate, 'YYYY-MM-DD').format('YYYYMMDD') : Moment().format('YYYYMMDD')
    const nowDate = timelogs.sessionData ? timelogs.sessionData.startDate : Moment().format('YYYY-MM-DD')

    Axios.post(apiURL, {
      actDate: nowDate,
      timeRefID: timelogID,
      actDesc: desc,
      projID: project.projID
    }).then(function(response) {

      const action = {action_id: response.data.id, action_desc: desc, timelog_id: timelogID, log_from: timeFrom, log_to: ''}
      
      let found = false
      
      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].act_date == nowDate) {
          found = true
          data.value[x].actions.push(action)
        }
      }
      
      if (!found) {
        data.value.push({act_date_id: nowDateID, act_date: nowDate, actions: [action]})
      }

      callback()

    })
  }

  function saveActivity2(date, desc, callback) {
    const project = useProjectStore()

    Axios.post(apiURL, {
      actDate: date,
      timeRefID: '',
      actDesc: desc,
      projID: project.projID
    }).then(function(response) {

      let action = {action_id: response.data.id, action_desc: desc, timelog_id: '', log_from: '', log_to: ''}

      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].act_date == date) {
          data.value[x].actions.push(action)
        }
      }

      callback()

    })
  }
  
  function updateActivity(id, desc, callback) {
    Axios.put(apiURL, {
      itemID: id,
      actDesc: desc,
    }).then(function(response) {

      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].actions.length; y++) {
          if (data.value[x].actions[y].action_id == id) {
            data.value[x].actions[y].action_desc = desc
          }
        }
      }

      callback()

    })
  }
  
  function deleteActivity(id, callback) {
    Axios.delete(apiURL, {params: {itemID: id}}).then(function(response) {

      let s_arr = []
      let e_arr = []
      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].actions.length; y++) {
          if (data.value[x].actions[y].action_id == id) {
            if (y > 0) {
              s_arr = data.value[x].actions.slice(0, y)
            }
            
            e_arr = data.value[x].actions.slice(y+1)
            
            data.value[x].actions = s_arr.concat(e_arr)
          }
        }
      }

      callback()

    })
  }
  
  function refresh() {
    const project = useProjectStore()
    const projID = project.projID
    const projData = project.data

    projectID.value = projID

    if (typeof projID != 'undefined' && projID != '') {
      let self = this

      Axios.get(apiURL, {params: {projID: projID}}).then(function(response) {
        self.data = response.data
      })
    } else {
      data.value = []
    }
  }

  function updateActivityTime() {
    const timelogs = useTimelogStore()

    for(let x=0; x<data.value.length; x++) {
      for(let y=0; y<data.value[x].actions.length; y++) {
        if (data.value[x].actions[y].timelog_id) {
          for(let a=0; a<timelogs.data.length; a++) {
            for(let b=0; b<timelogs.data[a].tlogs.length; b++) {
              if (data.value[x].actions[y].timelog_id == timelogs.data[a].tlogs[b].log_ref_id) {
                data.value[x].actions[y].log_from = timelogs.data[a].tlogs[b].log_from
                data.value[x].actions[y].log_to = timelogs.data[a].tlogs[b].log_to
              }
            }
          }
        }
      }
    }
  }
  
  //this.init()

  return { data, projectID, saveActivity, saveActivity2, updateActivity, deleteActivity, refresh, updateActivityTime }
})
