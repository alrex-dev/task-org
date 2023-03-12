import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Axios from 'axios'

import { useGlobalsStore } from '@/stores/globals'
import { useProjectStore } from '@/stores/project'

export const useCredentialStore = defineStore('credentials', () => {
  const globals = useGlobalsStore()
  
  const data = ref([])
  const projectID = ref('')
  const apiURL = globals.apiURLRoot + '/task-org-api/?entity=credential'
  const apiURL2 = globals.apiURLRoot + '/task-org-api/?entity=credential-group'
  
  function saveItem(groupid, label, value, callback) {

    Axios.post(apiURL, {
      groupID: groupid,
      noteLabel: label,
      noteValue: value
    }).then(function(response) {

      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].c_group_id == groupid) {
          data.value[x].items.push({c_item_id: response.data.id, c_item_label: label, c_item_value: value})
        }
      }
      
      callback()

    })
  }
  
  function updateItem(id, label, value, callback) {
    Axios.put(apiURL, {
      itemID: id,
      noteLabel: label,
      noteValue: value
    }).then(function(response) {

      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].items.length; y++) {
          if (data.value[x].items[y].c_item_id == id) {
            data.value[x].items[y].c_item_label = label
            data.value[x].items[y].c_item_value = value
          }
        }
      }

      callback()

    })
  }
  
  function deleteItem(id, callback) {
    Axios.delete(apiURL, {params: {itemID: id}}).then(function(response) {

      let s_arr = []
      let e_arr = []
      for(let x=0; x<data.value.length; x++) {
        for(let y=0; y<data.value[x].items.length; y++) {
          if (data.value[x].items[y].c_item_id == id) {
            if (y > 0) {
              s_arr = data.value[x].items.slice(0, y)
            }
            
            e_arr = data.value[x].items.slice(y+1)
            
            data.value[x].items = s_arr.concat(e_arr)
          }
        }
      }

      callback()

    })
  }
  
  function saveGroup(name, label, value, callback) {
    const project = useProjectStore()
    const projID = project.projID

    Axios.post(apiURL2, {
      projID: projID,
      groupName: name,
      noteLabel: label,
      noteValue: value
    }).then(function(response) {

      data.value.push({c_group_id: response.data.gid, c_group_name: name, items: []})
      
      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].c_group_id == response.data.gid) {
          data.value[x].items.push({c_item_id: response.data.id, c_item_label: label, c_item_value: value})
        }
      }

      callback()

    })
  }
  
  function updateGroup(groupid, name, callback) {
    Axios.put(apiURL2, {
      groupID: groupid,
      groupName: name
    }).then(function(response) {

      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].c_group_id == groupid) {
          data.value[x].c_group_name = name
        }
      }

      callback()

    })
  }
  
  function deleteGroup(groupid, callback) {
    Axios.delete(apiURL2, {params: {groupID: groupid}}).then(function(response) {

      let s_arr = []
      let e_arr = []
      
      for(let x=0; x<data.value.length; x++) {
        if (data.value[x].c_group_id == groupid) {
          if (x > 0) {
            s_arr = data.value.slice(0, x)
          }
        
          e_arr = data.value.slice(x+1)
        
          data.value = s_arr.concat(e_arr)
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

  return { data, projectID, saveItem, updateItem, deleteItem, saveGroup, updateGroup, deleteGroup, refresh }
})
