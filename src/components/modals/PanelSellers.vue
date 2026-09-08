<script>
import { findPanelSellers } from '../../services/panelSellers.js'
export default {
  props: { panel: { type: Object, required: true } },
  data() { return { opened: false, loading: false, error: '', results: [], failedImages: {} } },
  methods: {
    async find() {
      if (this.loading) return
      this.opened = true; this.loading = true; this.error = ''
      try { this.results = await findPanelSellers(this.panel) }
      catch { this.error = 'Seller search is unavailable or timed out. The provider may be busy or out of quota. Please try again later.' }
      finally { this.loading = false }
    },
  },
}
</script>
<template>
  <div class="mt-4">
    <button type="button" @click="find" :disabled="loading" class="border border-purple-600 text-purple-700 px-4 py-2 rounded-lg disabled:opacity-50">FIND SELLERS</button>
    <section v-if="opened" class="mt-4 border-t pt-4" aria-label="Seller results">
      <div class="flex justify-between"><h3 class="font-semibold">Seller Results</h3><button type="button" @click="opened = false" class="text-gray-500">Hide</button></div>
      <p class="text-xs text-gray-500">Shopping information only. Confirm the exact model with the seller.</p>
      <p v-if="loading" role="status">Finding sellers…</p>
      <p v-else-if="error" role="alert" class="text-red-700">{{ error }}</p>
      <p v-else-if="!results.length" role="status">No seller results found for this model.</p>
      <div v-else class="space-y-3 mt-3 max-h-96 overflow-y-auto">
        <article v-for="(result, index) in results" :key="index" class="border rounded-lg p-3 bg-white">
          <img v-if="result.image && !failedImages[result.image]" :src="result.image" @error="failedImages[result.image] = true" alt="" loading="lazy" class="w-20 h-20 object-contain float-left mr-3" />
          <p class="font-medium break-words">{{ result.title }}</p>
          <p>{{ result.priceText }} · {{ result.seller }}</p>
          <p class="text-sm text-purple-700">{{ result.exact ? 'Exact model identifier in title' : 'Possible match' }}</p>
          <p v-if="result.rating !== null" class="text-sm">Rating: {{ result.rating }}</p>
          <p v-if="result.reviewCount !== null" class="text-sm">{{ result.reviewCount }} reviews</p>
          <a v-if="result.productUrl" :href="result.productUrl" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 text-purple-700 underline">VIEW PRODUCT</a>
          <p v-else class="text-sm text-gray-500">Product link unavailable</p>
        </article>
      </div>
    </section>
  </div>
</template>
