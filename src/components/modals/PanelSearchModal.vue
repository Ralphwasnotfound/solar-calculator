<script>
import TechnicalPanelSearch from './TechnicalPanelSearch.vue'

export default {
  components: { TechnicalPanelSearch },
  props: {
    show: Boolean,
  },
  emits: ['close', 'select'],
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="panel-search-title" class="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden">
      <div class="flex items-center justify-between border-b px-6 py-4 shrink-0">
        <h2 id="panel-search-title" class="text-xl font-bold text-gray-800">Search Solar Panels</h2>
        <button @click="$emit('close')" aria-label="Close solar panel search" class="text-gray-500 hover:text-black text-2xl">×</button>
      </div>
      <div class="p-6 overflow-y-auto min-h-0">
        <TechnicalPanelSearch @select="$emit('select', $event)" />
      </div>
      <div class="border-t px-6 py-4 flex justify-end shrink-0">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Close</button>
      </div>
    </div>
  </div>
</template>
