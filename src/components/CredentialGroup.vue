<script setup>
import { useCredentialStore } from '@/stores/credential'
import CredentialItem from '@/components/CredentialItem.vue'
</script>

<template>
<div class="item-group-title">
    <div class="controls">
        <a href="#" class="button edit-2 d-inline-block ms-3" @click.prevent="editGroup" v-if="!isEditGroup"><span class="icon"></span><span class="label">Edit</span></a>
        <a href="#" class="button edit-2 d-inline-block ms-3" @click.prevent="deleteGroup" v-if="!isEditGroup"><span class="icon"></span><span class="label">Delete</span></a>
        <a href="#" class="button save-2 me-3" @click.prevent="saveGroup" v-if="isEditGroup"><span class="icon"></span><span class="label">Save</span></a>
        <a href="#" class="button cancel-2" @click.prevent="cancelGroup" v-if="isEditGroup"><span class="icon"></span><span class="label">Cancel</span></a>
    </div>

    <div @dblclick.prevent="editGroup" v-if="!isEditGroup"><h3 class="d-inline-block">{{group.c_group_name}}</h3></div>
    
    <div class="edit-groupname-form" v-if="isEditGroup">
        <div class="mb-1"><input type="text" class="w-100" name="group-name" v-model="groupName" placeholder="Group Name" @keyup.enter="saveGroup" @keyup.esc="cancelGroup" ref="editGroupNameInput" /></div>
    </div>
</div>

<div class="item" v-for="i in group.items" :key="i.c_item_id">
    <CredentialItem :itemData="i" @disable-box="disableBox" @enable-box="enableBox" />
</div>

<div class="add-item-form" v-if="isAdd">
    <div class="mb-1"><input type="text" class="w-100" name="item-label" v-model="itemLabel" placeholder="New Label" @keyup.enter="saveItem" @keyup.esc="cancelAdd" ref="addLabelInput" /></div>
    <div class="mb-3"><input type="text" class="w-100" name="item-value" v-model="itemValue" placeholder="New Value" @keyup.enter="saveItem" @keyup.esc="cancelAdd" /></div>
    <div>
        <a href="#" class="button save-2 me-3" @click.prevent="saveItem"><span class="icon"></span><span class="label">Save</span></a>
        <a href="#" class="button cancel-2" @click.prevent="cancelAdd"><span class="icon"></span><span class="label">Cancel</span></a>
    </div>
</div>

<div class="controls">
    <a href="#" class="button add-2" @click.prevent="addItem" v-if="!isAdd"><span class="icon"></span><span class="label">Add</span></a>
</div>
</template>

<script>
export default {
  created() {
    this.cred = useCredentialStore()
    
    this.groupID = this.group.c_group_id
    this.groupName = this.group.c_group_name
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    group: {
      type: Object
    }
  },
  data() {
    return {
      groupID: 0,
      groupName: '',
      itemLabel: '',
      itemValue: '',
      isAdd: false,
      isEditGroup: false
    }
  },
  methods: {
    addItem: function() {
      this.isAdd = true

      this.$nextTick(
        function () {
          this.$refs.addLabelInput.focus()
          this.$refs.addLabelInput.select()
        }.bind(this)
      )
    },
    saveItem: function() {
      if (this.itemLabel === '' || this.itemValue === '') {
        alert('All fields are required!')
        return
      }

      this.disableBox()
      
      this.cred.saveItem(this.groupID, this.itemLabel, this.itemValue, this.enableBox)
      
      this.itemLabel = ''
      this.itemValue = ''
      this.isAdd = false
    },
    cancelAdd: function() {
      this.isAdd = false
    },
    editGroup: function() {
      this.groupName = this.group.c_group_name
      this.isEditGroup = true

      this.$nextTick(
        function () {
          this.$refs.editGroupNameInput.focus()
          this.$refs.editGroupNameInput.select()
        }.bind(this)
      )
    },
    saveGroup: function() {
      if (this.groupName === '') {
        alert('Group Name is required!')
        return
      }
      
      this.disableBox()

      this.cred.updateGroup(this.groupID, this.groupName, this.enableBox)
      
      this.isEditGroup = false
    },
    cancelGroup: function() {
      this.isEditGroup = false
    },
    deleteGroup: function() { 
      if (confirm('Delete this Access Note Group and items under it?')) {
        this.disableBox()

        this.cred.deleteGroup(this.groupID, this.enableBox)
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
