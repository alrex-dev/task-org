<script setup>
import SearchResultItem from '@/components/SearchResultItem.vue'
import { useProjectStore } from '@/stores/project'
import { useCredentialStore } from '@/stores/credential'
import { useTimelogStore } from '@/stores/timelog'
import { useActivityStore } from '@/stores/activity'
import { Modal, Popover, Tooltip } from 'bootstrap'
</script>

<template>
<div class="boxed-content" :class="isDisabled" id="project-info">
    <div class="boxed-content-inner">
        <div class="box-title container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-7 p-0 d-flex align-items-center"><h2>Project Info</h2></div>
                <div class="col col-5 p-0 d-flex align-items-center justify-content-end">
                    <div class="search-with-dropdown-cont me-3">
                        <input type="text" class="search-text" name="search-project" ref="search_input" id="search-project" placeholder="Select a Project" v-model="kw" @keyup.prevent="searchProject" />
                        <div class="search-results" :class="showResults">
                            <div class="search-results-inner">
                                <div class="search-result-item" v-for="s in searchResults" :key="s.id">
                                    <SearchResultItem :itemData="s" @set-proj-details="setProjDetails" @check-existing-session="checkForExistingSession" @reset-search="resetSearch" @disable-all-boxes="disableAllBoxes" @enable-all-boxes="enableAllBoxes" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="#" class="button add" @click.prevent="addProject"><span class="icon"></span><span class="label">Add</span></a>
                </div>
            </div>
        </div>
        <div class="box-main">
            <div class="box-main-wrapper">
                <div class="box-main-wrapper-inner">
                
                    <div class="proj-details" v-if="projectSelected">
                        <div class="controls">
                            <a href="#" class="button edit-2 me-3" v-if="!isEdit" @click.prevent="editProject"><span class="icon"></span><span class="label">Edit</span></a>
                            <a href="#" class="button delete-2" v-if="!isEdit" @click.prevent="deleteProject"><span class="icon"></span><span class="label">Delete</span></a>
                            <a href="#" class="button save-2 me-3" v-if="isEdit" @click.prevent="updateProject"><span class="icon"></span><span class="label">Save</span></a>
                            <a href="#" class="button cancel-2" v-if="isEdit" @click.prevent="cancelEdit"><span class="icon"></span><span class="label">Cancel</span></a>
                        </div>
                        <div class="project-name">
                            <div v-if="!isEdit">{{getProjName}}</div>
                            <div v-if="isEdit"><input type="text" class="w-100" name="proj-name" v-model="projName" ref="projNameInput" /></div>
                        </div>
                        <div class="project-desc">
                            <div style="white-space: pre" v-if="!isEdit">{{getProjDesc}}</div>
                            <div v-if="isEdit"><textarea class="w-100" name="proj-desc" rows="6" placeholder="" v-model="projDesc" ref="newActionInput"></textarea></div>
                        </div>
                        <div class="storage-link"><a href="#" @click.prevent="openDir">Click here to open Storage</a></div>
                    </div>

                    <div v-if="!projectSelected">Select a Project!</div>
                    
                    <!--<div class="mt-3" v-if="!projectSelected"><button class="btn btn-primary" @click.prevent="setProject">Set Sample Project</button></div>-->
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="addProjectPopup" tabindex="-1" v-on='{"shown.bs.modal": modalShown}'>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">New Project</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div><input type="text" class="w-100 mb-2" name="new-proj-name" placeholder="Project Name" v-model="newProjName" ref="newProjNameInput" /></div>
                <div><textarea class="w-100" name="new-proj-desc" placeholder="Project Description" rows="6" v-model="newProjDesc"></textarea></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="saveProject">Save</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
  created() {
    this.project = useProjectStore()
    this.cred = useCredentialStore()
    this.timelogs = useTimelogStore()
    this.activities = useActivityStore()

    //setting initial dataset
    //this.project.refresh()
    //this.setProjDetails()

    console.log('Created: Project Component')
  },
  mounted() {
    this.popup = new Modal('#addProjectPopup', {keyboard: false})

    if (this.project.showTooltip) {
      this.popover = new Popover(this.$refs.search_input, {title: 'PROJECT', content: 'Select a Project here!', placement: 'left'})
      this.$refs.search_input.focus()
      this.$refs.search_input.click()

      let self = this

      document.addEventListener('mousedown', function(e) {
        const target = e.target;

        if (self.popover && self.popover.tip) {
          if (target.id != 'search-project') {
            self.$refs.search_input.click()
            self.popover = new Popover(self.$refs.search_input, {disabled: true})
          } else {
            let self_ = self

            setTimeout(function() {
              self_.popover = new Popover(self_.$refs.search_input, {disabled: true})
              //let tooltip = new Tooltip(self_.popover.tip, {disabled: true})

              //console.log(tooltip)
            }, 500)
          }
        }
      })

      this.project.showTooltip = false
    }
  },
  emits: ['disableAllBoxes', 'enableAllBoxes', 'setProjectCallback', 'checkExistingSession'],
  expose: ['setProjDetails', 'disableBox', 'enableBox'],
  data() {
    return {
      id: 0,
      projID: '',
      projName: '',
      projDesc: '',
      projStorage: '',
      newProjName: '',
      newProjDesc: '',
      kw: '',
      searchResults: [],
      isEdit: false,
      disabled: true,
      popover: null
    }
  },
  methods: {
    addProject: function() {
      if (this.timelogs.sessionStarted) {
        alert('Cannot create new project while session is currently running!')

        return
      }

      this.popup.show()
    },
    modalShown: function() {
      this.$refs.newProjNameInput.focus()
    },
    editProject: function() {
      this.projName = this.project.data.name
      this.projDesc = this.project.data.desc
      this.isEdit = true

      this.$nextTick(
        function () {
          this.$refs.projNameInput.focus()
          this.$refs.projNameInput.select()
        }.bind(this)
      );
      
    },
    cancelEdit: function() {
      this.isEdit = false
    },
    updateProject: function() {
      if (this.projName === '') {
        alert('Value is required!');
        return;
      }

      this.disableBox()

      this.project.updateProject(this.projName, this.projDesc, this.enableBox)

      this.isEdit = false
    },
    saveProject: function() {
      if (this.newProjName === '') {
          alert('Value is required!');
          return;
      }

      let self = this

      this.disableBox()

      //Save new project and set it as current project
      this.project.saveProject(this.newProjName, this.newProjDesc, function() {
        self.cred.refresh()
        self.timelogs.refresh()
        self.activities.refresh()

        self.setProjDetails()

        self.enableBox()
      })

      this.newProjName = ''
      this.newProjDesc = ''

      this.popup.hide()
    },
    deleteProject: function() {
      let self = this

      if (confirm('Are you sure you wanna delete the Project and its data?')) {
        if (confirm('Are you really sure you wanna do this?')) {
          this.disableBox()

          this.project.deleteProject(function() {
            self.cred.refresh()
            self.timelogs.refresh()
            self.activities.refresh()

            self.enableBox()
          })
        }
      }
    },
    setProjDetails: function() {
      this.id = this.project.data.id
      this.projID = this.project.data.pid
      this.projName = this.project.data.name
      this.projDesc = this.project.data.desc
      this.projStorage = this.project.data.storage
      
      this.$emit('setProjectCallback')
    },
    searchProject: function() {
      let self = this

      if (this.kw == '') {
        self.searchResults = []
        return
      }

      this.project.searchProjects(this.kw, function() {
        self.searchResults = self.project.searchResults
      })
    },
    checkForExistingSession: function() {
      this.$emit('checkExistingSession')
    },
    resetSearch: function() {
      this.kw = ''
      this.searchResults = []
    },
    disableBox: function() {
      this.disabled = true
    },
    enableBox: function() {
      this.disabled = false
    },
    disableAllBoxes: function() {
      this.$emit('disableAllBoxes')
    },
    enableAllBoxes: function() {
      this.$emit('enableAllBoxes')
    },
    openDir: function() {
      //const cp = new child_process()
      //exec('start "" "c:\\Vue"')
      this.project.openProjectDir(this.projStorage)
    },
    hidePopover: function() {
      if (this.popover.tip) {
        let self = this

        setTimeout(function() {
          self.popover = new Popover(self.$refs.search_input, {disabled: true});
        }, 500)
        //let tooltip = new Tooltip(this.popover.tip)

        //console.log(this.popover)
        //console.log(tooltip)
        //tooltip.disable()
        //this.popover._element.removeAttribute('data-bs-toggle')
        //this.popover._element.removeAttribute('data-bs-placement')
        //this.popover._element.removeAttribute('data-bs-title')
        //this.popover._element.removeAttribute('data-bs-content')
        //console.log(document.querySelector('#' + popoverID))
        //let popover = document.querySelector('#' + popoverID)
        //popover.parentNode.removeChild(popover)
        //popover.style.display = 'none';
      }
    }
  },
  computed: {
    getProjName: function() {
      return this.project.data.name
    },
    getProjDesc: function() {
      return this.project.data.desc
    },
    projectSelected() {
      return (typeof this.project.projID != 'undefined' && this.project.projID != '') ? true : false
    },
    showResults: function() {
      return (this.searchResults.length) ? 'show' : ''
    },
    isDisabled() {
      return (this.disabled) ? 'disabled' : ''
    }
  }
}
</script>
