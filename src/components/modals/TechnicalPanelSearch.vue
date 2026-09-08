<script>
import { searchTechnicalPanels, toCalculatorPanel } from '../../services/technicalPanels.js'

export default {
  emits: ['select'],
  data() {
    return { query: '', submittedQuery: '', results: [], loading: false, error: '', searched: false, nextOffset: null, total: 0, snapshotId: null, requestId: 0 }
  },
  beforeUnmount() { this.requestId++ },
  methods: {
    selectable: toCalculatorPanel,
    async search(more = false) {
      if (this.loading || (more && this.nextOffset === null)) return
      const q = more ? this.submittedQuery : this.query.trim()
      if (q.length < 2 || q.length > 160) { this.error = 'Enter a manufacturer or exact model (2–160 characters).'; return }
      const requestId = ++this.requestId
      this.error = ''; this.loading = true
      if (!more) { this.results = []; this.nextOffset = null; this.total = 0; this.submittedQuery = q; this.snapshotId = null; this.searched = false }
      try {
        const page = await searchTechnicalPanels({ q, limit: 20, offset: more ? this.nextOffset : 0 })
        if (requestId !== this.requestId) return
        if (more && page.snapshotId !== this.snapshotId) throw new Error('The catalog was updated. Search again to load the current version.')
        this.results = more ? [...this.results, ...page.results.filter(r => !this.results.some(existing => existing.id === r.id))] : page.results
        this.snapshotId = page.snapshotId; this.nextOffset = page.nextOffset; this.total = page.total; this.searched = true
      } catch (error) { if (requestId === this.requestId) this.error = error.message }
      finally { if (requestId === this.requestId) this.loading = false }
    },
    select(record) {
      if (this.loading || !this.results.includes(record)) return
      const panel = toCalculatorPanel(record)
      if (panel) this.$emit('select', panel)
    },
  },
}
</script>

<template>
  <form @submit.prevent="search()" class="flex gap-2">
    <label for="technical-panel-query" class="sr-only">Manufacturer or exact model</label>
    <input id="technical-panel-query" v-model="query" maxlength="160" placeholder="Jinko 550W" class="border rounded-lg px-3 py-2 min-w-0 flex-1" />
    <button :disabled="loading" class="bg-purple-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">Search</button>
  </form>
  <p class="text-sm text-gray-500 mt-2">Example: Jinko 550W or JKM550M-72HL4</p>
  <p v-if="error" role="alert" class="mt-4 text-red-700">{{ error }}</p>
  <p v-if="loading" role="status" class="mt-4 text-gray-600">Searching technical catalog…</p>
  <p v-else-if="!searched && !error" class="mt-4 text-gray-600">Search the CEC / SAM catalog for an exact panel model.</p>
  <p v-else-if="searched && !results.length && !error" role="status" class="mt-4 text-gray-600">No matching solar panels found.</p>
  <p v-if="results.length" class="text-sm text-gray-500 mt-4">Showing {{ results.length }} of {{ total }} results for “{{ submittedQuery }}”</p>
  <div class="space-y-3 mt-3">
    <article v-for="panel in results" :key="panel.id" class="border rounded-xl p-4">
      <p class="text-sm text-gray-500">{{ panel.manufacturer || panel.brand }}</p>
      <h3 class="font-bold text-gray-800 break-words">{{ panel.model }}</h3>
      <p class="font-semibold text-purple-700 mt-1">{{ panel.watt }} W</p>
      <dl class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-3">
        <div><dt class="text-gray-500">Voc</dt><dd>{{ panel.voc }} V</dd></div>
        <div><dt class="text-gray-500">Vmp</dt><dd>{{ panel.vmp }} V</dd></div>
        <div><dt class="text-gray-500">Isc</dt><dd>{{ panel.isc }} A</dd></div>
        <div><dt class="text-gray-500">Imp</dt><dd>{{ panel.imp }} A</dd></div>
        <div><dt class="text-gray-500">Efficiency</dt><dd>{{ panel.efficiency }}%</dd></div>
      </dl>
      <p class="text-xs text-gray-500 mt-3">Technical source: CEC / SAM</p>
      <p v-if="!selectable(panel)" class="text-sm text-red-700 mt-2">Technical record unavailable for selection.</p>
      <button :disabled="loading || !selectable(panel)" @click="select(panel)" class="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">SELECT PANEL</button>
    </article>
  </div>
  <button v-if="nextOffset !== null" :disabled="loading" @click="search(true)" class="mt-4 border border-purple-600 text-purple-700 px-4 py-2 rounded-lg disabled:opacity-50">Load More</button>
</template>
