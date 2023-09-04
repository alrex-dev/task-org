<script setup>
import { useCredentialStore } from '@/stores/credential'
import CredentialGroup from '@/components/CredentialGroup.vue'
import { Modal } from 'bootstrap'
</script>

<template>
<div class="boxed-content" :class="[isDisabled, isExpanded]" id="credentials">
    <div class="boxed-content-inner">
        <div class="box-title container-fluid p-0">
            <div class="row m-0 p-0">
                <div class="col col-7 p-0 d-flex align-items-center"><h2>Access Notes</h2><div class="filtered-label d-inline-block ms-2" v-if="isFiltered()">Filtered</div></div>
                <div class="col col-5 p-0 d-flex align-items-center justify-content-end">
                  <a href="#" class="button add me-3" @click.prevent="addAccessNote"><span class="icon"></span><span class="label">Add</span></a>
                  <input type="text" class="search-text me-3" name="search-notes" id="search-notes" placeholder="Search" v-model="kw" @keyup.prevent="searchCredential" />
                  <a href="#" class="button expand" :class="expandButtonIcon" @click.prevent="toggleExpand"><span class="icon"></span><span class="label">{{expandButtonText}}</span></a>
                </div>
            </div>
        </div>
        <div class="box-main">
            <div class="box-main-wrapper" ref="scroller">
                <div class="box-main-wrapper-inner" ref="scrollerInner">
                    
                    <div class="item-group" v-for="g in getGroups" :key="g.c_group_id">
                        <CredentialGroup :group="g" @disable-box="disableBox" @enable-box="enableBox" />
                    </div>
                    
                    <div v-if="!projectSelected">No Project selected!</div>
                    <div v-if="projectSelected && !hasGroups">Add Access Notes</div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="addCredentialPopup" tabindex="-1" v-on='{"shown.bs.modal": modalShown}'>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">New Access Note</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3"><input type="text" class="w-100" name="group-name" v-model="groupName" placeholder="Group Name" ref="groupNameInput" /></div>
                <div class="mb-1"><input type="text" class="w-100" name="cred-label" v-model="credLabel" placeholder="Label" /></div>
                <div><input type="text" class="w-100" name="cred-value" v-model="credValue" placeholder="Value" /></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="saveGroup">Save</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>
</div>

</template>

<script>
export default {
  created() {
    this.cred = useCredentialStore()
    
    //setting initial dataset
    //this.cred.refresh()

    console.log('Created: Credentials Component')
  },
  mounted() {
    this.popup = new Modal('#addCredentialPopup', {keyboard: false})
  },
  expose: ['disableBox', 'enableBox'],
  data() {
    return {
      groupName: '',
      credLabel: '',
      credValue: '',
      disabled: false,
      expanded: false,
      expandButtonText: 'Max',
      expandButtonIcon: 'max',
      kw: ''
    }
  },
  methods: {
    isFiltered: function() {
      return (this.kw.trim() != '') ? true : false;
    },
    addAccessNote: function() {
      if (typeof this.cred.projectID == 'undefined' || this.cred.projectID == '') {
        alert('No Project selected!')
        return
      }
      
      this.popup.show()
    },
    saveGroup: function() {
      if (this.groupName === '' || this.credLabel === '' || this.credValue === '') {
        alert('All fields are required!');
        return;
      }
      
      this.disableBox()

      let self = this

      this.cred.saveGroup(this.groupName, this.credLabel, this.credValue, this.enableBox)
      
      this.popup.hide()
      
      this.groupName = ''
      this.credLabel = ''
      this.credValue = ''
      
      setTimeout(function() {
        self.$refs.scroller.scrollTop = self.$refs.scrollerInner.offsetHeight - self.$refs.scroller.offsetHeight
      }, 500)
      //console.log(this.$refs.scrollerInner.offsetHeight, this.$refs.scroller.offsetHeight);
    },
    modalShown: function() {
      this.$refs.groupNameInput.focus()
    },
    disableBox: function() {
      this.disabled = true
    },
    enableBox: function() {
      this.disabled = false
    },
    toggleExpand: function() {
      this.expanded = this.expanded ? false : true
      this.expandButtonText = this.expanded ? 'Min' : 'Max'
      this.expandButtonIcon = this.expanded ? 'min' : 'max'
    },
    searchCredential: function() {
      if (typeof this.cred.projectID == 'undefined' || this.cred.projectID == '') {
        this.kw = ''
        alert('No Project selected!')
        return
      }

      if (this.kw == '') {
        this.cred.refresh()
        //return
      } else {
        this.cred.search(this.kw)
      }

      //console.log(this.kw)
    }
  },
  computed: {
    getGroups() {
      //const cred = useCredentialStore()
      
      //console.log(cred.data)
      //this.groups = this.cred.data
      
      return this.cred.data
    },
    hasGroups() {
      return this.cred.data.length ? true : false
    },
    projectSelected() {
      return (typeof this.cred.projectID != 'undefined' && this.cred.projectID != '') ? true : false
    },
    isDisabled() {
      return (this.disabled) ? 'disabled' : ''
    },
    isExpanded() {
      return (this.expanded) ? 'fullscreen' : ''
    }
  }
}
</script>
