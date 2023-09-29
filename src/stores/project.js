import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Axios from 'axios'

import { useGlobalsStore } from '@/stores/globals'

//import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
//import { LocalStorage } from 'node-localstorage'
//import store from 'store2'

export const useProjectStore = defineStore('project', () => {
  const globals = useGlobalsStore()
  
  const data = ref([])
  const searchResults = ref([])
  const projID = ref('')
  const apiURL = globals.apiURLRoot + '/task-org-api/?entity=project'
  const apiURL2 = globals.apiURLRoot + '/task-org-api/?entity=session'
  const apiURL3 = globals.apiURLRoot + '/task-org-api/?entity=nodetask'
    
  function init() {
    //check for active session
  }

  function saveProject(name, desc, callback) {
    let self = this

    Axios.post(apiURL, {
      projName: name,
      projDesc: desc
    }).then(function(response) {
      self.setProject(response.data.projID, callback)
      self.createProjectDir(response.data.projStorage)
    })
  }

  function createProjectDir(name) {

    /*
    Filesystem.mkdir({
      directory: Directory.Documents,
      path: 'test', recursive: true,
    }).then(() => {
      console.log(arguments[0])
    })
    */
    //let localStorage = new LocalStorage('./scratch'); 

    //Setting localStorage Item
    //localStorage.setItem('ProjectName', name)
    //localStorage.ProjectName = name
    //store('ProjName2', {job: 'Developer'})
    //store.local({data: 'Crazy Project'});

    Axios.post(apiURL3, {
      task: 'mkdir',
      taskData: 'dirname:' + name,
    }).then(function(response) {
    })
  }

  function openProjectDir(name) {
    Axios.post(apiURL3, {
      task: 'opendir',
      taskData: 'dirname:' + name,
    }).then(function(response) {
    })
  }

  function updateProject(name, desc, callback) {
    Axios.put(apiURL, {
      id: data.value.id,
      projName: name,
      projDesc: desc
    }).then(function(response) {

      data.value.name = name
      data.value.desc = desc

      callback()

    })
  }
    
  function refresh() {
    if (typeof data.value.pid == 'undefined') {
      projID.value = ''

      data.value = {
        id: 0,
        pid: '',
        name: '',
        desc: '',
        storage: ''
      }
    }
  }

  function deleteProject(callback) {
    let self = this

    Axios.delete(apiURL, {params: {id: data.value.id, projID: data.value.pid}}).then(function(response) {
      //Reset to No Project
      self.refresh()

      callback()
    })
  }

  function setProject(projID, callback) {
    let self = this

    Axios.get(apiURL, {params: {projID: projID}}).then(function(response) {
      if (response) {
        self.projID = response.data.projID
        
        self.data = {
            id: response.data.id,
            pid: response.data.projID,
            name: response.data.projName,
            desc: response.data.projDesc,
            storage: response.data.projStorage
        }
      }

      callback()
    })
  }

  function searchProjects(kw, callback) {
    Axios.get(apiURL, {params: {search: true, kw: kw}}).then(function(response) {
      searchResults.value = response.data
      
      callback()
    })
  }

  function checkForSession(callback, nosess_callback) {
    let self = this

    Axios.get(apiURL2, {params: {}}).then(function(response) {
      if (typeof response.data.projID != 'undefined' && response.data.projID != '') {
        self.setProject(response.data.projID, callback)
      } else {
        nosess_callback()
      }
    })
  }
  
  return { projID, data, setProject, saveProject, updateProject, deleteProject, searchProjects, searchResults, refresh, checkForSession, createProjectDir, openProjectDir }
})