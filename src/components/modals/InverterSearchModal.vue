<script>
export default {
  props: {
    show: Boolean,
  },

  emits: ['close'],
}
</script>

<template>
  <!-- BACKDROP -->
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <!-- MODAL -->
    <div class="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
      <!-- HEADER -->
      <div class="flex items-center justify-between border-b px-6 py-4">
        <h2 class="text-xl font-bold text-gray-800">Search Inverters</h2>

        <!-- CLOSE BUTTON -->
        <button @click="$emit('close')" class="text-gray-500 hover:text-black text-2xl">×</button>
      </div>

      <!-- BODY -->
      <div class="p-6">
        <!-- SEARCH INPUT -->
        <input
          type="text"
          placeholder="Search solar panels..."
          class="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
        />

        <!-- RESULTS -->
        <div class="mt-4 space-y-2 max-h-96 overflow-y-auto">
          <!-- SAMPLE CARD -->
          <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">Jinko Tiger Neo 550W</h3>

                <p class="text-sm text-gray-500">21.3% Efficiency</p>
              </div>

              <div class="text-purple-600 font-bold">550W</div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="border-t px-6 py-4 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
