<script setup>
import { useCredentialStore } from '@/stores/credential'
import { Tooltip } from 'bootstrap'
import Popper from 'popper.js'
</script>

<template>
<div class="controls">
    <a href="#" class="button edit-2 me-3" @click.prevent="editItem" v-if="!isEdit"><span class="icon"></span><span class="label">Edit</span></a>
    <a href="#" class="button delete-2" @click.prevent="deleteItem" v-if="!isEdit"><span class="icon"></span><span class="label">Delete</span></a>
    <a href="#" class="button save-2 me-3" @click.prevent="saveItem" v-if="isEdit"><span class="icon"></span><span class="label">Save</span></a>
    <a href="#" class="button cancel-2" @click.prevent="cancelEdit" v-if="isEdit"><span class="icon"></span><span class="label">Cancel</span></a>
</div>

<div class="label" @dblclick.prevent="editItem" v-if="!isEdit">{{itemData.c_item_label}}:</div>
<div style="white-space: pre-wrap" class="value" @dblclick.prevent="editItem" v-if="!isEdit">
    <a :href="itemData.c_item_value" target="_blank" v-if="isLink(itemData.c_item_value)">{{itemData.c_item_value}}</a>
    <span v-if="!isLink(itemData.c_item_value)">{{itemData.c_item_value}}</span>
    <img :id="clipboardID" src="@/assets/icons/clipboard.png" class="copy-to-clipboard" @click="copyToClipboard" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copy to clipboard">
</div>

<div v-if="isEdit">
    <div class="mb-1"><input type="text" class="w-100" name="item-label" v-model="itemLabel" placeholder="Label" @keyup.enter="saveItem" @keyup.esc="cancelEdit" ref="editLabelInput" /></div>
    <div class="mb-3"><input type="text" class="w-100" name="item-value" v-model="itemValue" placeholder="Value" @keyup.enter="saveItem" @keyup.esc="cancelEdit" /></div>
</div>
</template>

<script>
export default {
  created() {
    this.cred = useCredentialStore()
    
    this.itemID = this.itemData.c_item_id
    this.itemLabel = this.itemData.c_item_label
    this.itemValue = this.itemData.c_item_value
    
    this.clipboardID = 'copy-to-clipboard-' + this.itemID
  },
  mounted() {
    this.attachTooltip()
  },
  emits: ['disableBox', 'enableBox'],
  props: {
    itemData: {
      type: Object
    }
  },
  data() {
    return {
      itemID: 0,
      itemLabel: '',
      itemValue: '',
      isEdit: false,
      //publicPath: process.env.BASE_URL
      clipboardID: ''
    }
  },
  methods: {
    isLink: function(value) {
      return (value.indexOf('http') != -1) ? true : false
    },
    editItem: function() {
      this.itemLabel = this.itemData.c_item_label
      this.itemValue = this.itemData.c_item_value
      this.isEdit = true

      this.$nextTick(
        function () {
          this.$refs.editLabelInput.focus()
          this.$refs.editLabelInput.select()
        }.bind(this)
      )
    },
    saveItem: function() {
      if (this.itemLabel === '' || this.itemValue === '') {
        alert('All fields are required!');
        return;
      }

      this.disableBox()
      
      this.cred.updateItem(this.itemID, this.itemLabel, this.itemValue, this.enableBox)
      
      this.isEdit = false
      
      this.$nextTick(
        function () {
          this.attachTooltip()
        }.bind(this)
      )
    },
    cancelEdit: function() {
      this.isEdit = false
      
      this.$nextTick(
        function () {
          this.attachTooltip()
        }.bind(this)
      )
    },
    deleteItem: function() {
      if (confirm('Delete this item?')) {
        this.disableBox()

        this.cred.deleteItem(this.itemID, this.enableBox)
      }
    },
    disableBox: function() {
      this.$emit('disableBox')
    },
    enableBox: function() {
      this.$emit('enableBox')
    },
    copyToClipboard: function() {
      navigator.clipboard.writeText(this.itemValue);
    },
    attachTooltip: function() {
      const tooltip = new Tooltip(('#' + this.clipboardID), {
      title: 'Copy',
      placement: 'top'
    })
    }
  },
  computed: {
  }
}
</script>
