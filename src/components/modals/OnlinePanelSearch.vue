<script>
import { searchOnlinePanels, normalizeQuery, validQuery } from '../../services/onlinePanels.js'
import { verifyOnlinePanel } from '../../utils/verifiedOnlinePanel.js'

export default {
  props: {
    panels: { type: Array, default: () => [] },
    panelsLoading: Boolean,
    panelsError: { type: String, default: '' },
  },
  emits: ['select'],
  data() {
    return { query: '', searchedQuery: '', results: [], loading: false, error: '', searched: false }
  },
  computed: {
    verifiedResults() {
      const available = this.panelsLoading || this.panelsError ? [] : this.panels
      return this.results.map((listing) => verifyOnlinePanel(listing, available))
    },
  },
  methods: {
    selectVerified(product) {
      if (this.panelsLoading || this.panelsError) return
      // Recheck the original listing against current records at click time.
      const listing = this.results.find((item) => item === product || item.externalId === product.externalId)
      if (!listing) return
      const verified = verifyOnlinePanel(listing, this.panels)
      if (verified.specificationsVerified) this.$emit('select', verified.matchedPanel)
    },
    async search() {
      if (this.loading) return
      this.error = ''
      this.results = []
      this.searched = false
      const query = normalizeQuery(this.query)
      if (!validQuery(query)) {
        this.error = 'Enter at least 3 letters or numbers (maximum 120 characters).'
        return
      }
      this.loading = true
      this.searchedQuery = this.query.trim()
      try {
        this.results = await searchOnlinePanels(query)
        this.searched = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    safeUrl(value) {
      try {
        const url = new URL(value)
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
      } catch { return null }
    },
  },
}
</script>

<template>
  <section aria-label="Online solar panel discovery">
    <form @submit.prevent="search" class="flex flex-col sm:flex-row gap-2">
      <label class="flex-1 min-w-0 text-sm text-gray-500">
        Search online solar panels
        <input v-model="query" :disabled="loading" maxlength="120" type="search"
          placeholder="Search online solar panels..."
          class="mt-1 w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" />
      </label>
      <button type="submit" :disabled="loading" class="self-end w-full sm:w-auto px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">Search</button>
    </form>
    <p class="text-sm text-gray-500 mt-2">Example: Jinko Tiger Neo 550W. Philippine shopping results; availability and shipping vary.</p>
    <div class="mt-4 space-y-3" :aria-busy="loading">
      <p v-if="loading" role="status" class="text-gray-500">Searching online solar panels...</p>
      <p v-else-if="error" role="alert" class="text-red-600">{{ error }}</p>
      <template v-else-if="searched">
        <p class="text-sm text-gray-500">Results for “{{ searchedQuery }}”</p>
        <p v-if="!results.length" role="status">No matching online solar panels found.</p>
        <p v-if="panelsLoading" class="text-sm text-gray-500">Loading trusted specifications for matching...</p>
        <p v-else-if="panelsError" class="text-sm text-amber-700">Trusted specifications are unavailable. Online products can still be viewed.</p>
        <article v-for="product in verifiedResults" :key="product.externalId" class="border rounded-lg p-4">
          <span class="text-xs font-semibold text-purple-600">ONLINE PRODUCT</span>
          <div class="flex gap-3 mt-2">
            <img v-if="safeUrl(product.image)" :src="safeUrl(product.image)" alt="" loading="lazy" referrerpolicy="no-referrer"
              class="w-20 h-20 object-contain shrink-0" @error="$event.target.style.display = 'none'" />
            <div class="min-w-0">
              <h3 class="font-semibold break-words">{{ product.title }}</h3>
              <p v-if="product.priceText" class="text-purple-600 font-bold">{{ product.priceText }}</p>
              <p v-else-if="product.priceValue !== null">{{ product.priceValue }} {{ product.currency || '(currency not supplied)' }}</p>
              <p v-if="product.seller" class="text-sm text-gray-500">{{ product.seller }}</p>
              <p v-if="product.rating !== null || product.reviews !== null" class="text-sm text-gray-500">
                <span v-if="product.rating !== null">Rating: {{ product.rating }}</span>
                <span v-if="product.reviews !== null"> · {{ product.reviews }} reviews</span>
              </p>
            </div>
          </div>
          <template v-if="product.specificationsVerified">
            <p class="text-sm text-green-700 mt-3">Verified technical specifications</p>
            <p class="text-sm text-gray-500">{{ product.matchedPanel.brand }} {{ product.matchedPanel.model }}</p>
            <dl class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-sm text-gray-600">
              <div><dt>Watt</dt><dd>{{ product.watt }} W</dd></div>
              <div><dt>Voc</dt><dd>{{ product.voc }} V</dd></div>
              <div><dt>Vmp</dt><dd>{{ product.vmp }} V</dd></div>
              <div><dt>Isc</dt><dd>{{ product.isc }} A</dd></div>
              <div><dt>Imp</dt><dd>{{ product.imp }} A</dd></div>
              <div><dt>Efficiency</dt><dd>{{ product.efficiency }} %</dd></div>
            </dl>
            <button @click="selectVerified(product)" class="mt-3 mr-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">SELECT PANEL</button>
          </template>
          <p v-else class="text-sm text-amber-700 mt-3">Specifications incomplete — cannot use in calculator</p>
          <a v-if="safeUrl(product.productUrl)" :href="safeUrl(product.productUrl)" target="_blank" rel="noopener noreferrer"
            class="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">VIEW PRODUCT</a>
        </article>
      </template>
      <p v-else class="text-sm text-gray-500">Enter a solar panel brand or model, then press Search to find online products.</p>
    </div>
  </section>
</template>
