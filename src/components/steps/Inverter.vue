<script>
import { inverters } from '../../data/inverters.js';

export default {
  props: ['adjustedPower'], // from PanelSizing

  data() {
    return {
      inverterType: 'hybrid',
      useCustom: false,
      selectedInverter: null,
      inverterList: inverters,
      searchQuery: '',
      showDropdown: false
    };
  },

  computed: {
    filteredInverters() {
      return this.inverterList.filter(inv => {
        return (
          inv.type === 'hybrid' &&
          (inv.brand + ' ' + inv.model)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );
      });
    },

    requiredInverterPower() {
      return (Number(this.adjustedPower) || 0) * 1.2;
    },

    recommendedInverter() {
      return this.filteredInverters.find(
        inv => inv.power >= this.requiredInverterPower
      );
    },

    activeInverter() {
  if (this.useCustom && this.selectedInverter) {
    return this.selectedInverter;
  }
  return this.recommendedInverter;
}
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside);

    const saved = JSON.parse(localStorage.getItem('inverterData'));

    if (saved) {
      this.selectedInverter = saved.selectedInverter || null;
      this.searchQuery = saved.searchQuery || '';
      this.useCustom = saved.useCustom || false;
    }
  },
  
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },


  methods: {
    selectInverter(inv) {
      this.selectedInverter = inv;

      if (!this.useCustom) {
        this.useCustom = true;
      }
      
      this.searchQuery = `${inv.brand} ${inv.model}`;

      this.showDropdown = false;
    },

    onSearch() {
      this.showDropdown = true;

      const match = this.filteredInverters.find(inv =>
        `${inv.brand} ${inv.model}`.toLowerCase() === this.searchQuery.toLowerCase()
      );

      if (!match) {
        this.selectedInverter = null;
      }
    },

    handleClickOutside(event) {
      const dropdown = this.$refs.dropdownRef

      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    }
  },

  watch: {
    selectedInverter: {
      deep: true,
      handler(val) {
        localStorage.setItem('inverterData', JSON.stringify({
          selectedInverter: val,
          searchQuery: this.searchQuery,
          useCustom: this.useCustom
        }));
      }
    },

    searchQuery(val) {
      const saved = JSON.parse(localStorage.getItem('inverterData')) || {};
      saved.searchQuery = val;
      localStorage.setItem('inverterData', JSON.stringify(saved))
    },

    useCustom(val) {
      const saved = JSON.parse(localStorage.getItem('inverterData')) || {};
      saved.useCustom = val;
      localStorage.setItem('inverterData', JSON.stringify(saved))
    }
  },
  
};
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow">

    <!-- TITLE -->
    <h2 class="text-xl font-semibold mb-4">⚡ Step 3: Inverter Sizing</h2>

    <!-- TYPE BUTTONS -->
    <div class="flex gap-2 mb-6">

      <button
        @click="inverterType = 'hybrid'"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded"
        :class="inverterType === 'hybrid'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200'"
      >
        🔋 HYBRID
      </button>

      <button
        class="flex-1 px-4 py-2 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        ⚡ ON-GRID (soon)
      </button>

      <button
        class="flex-1 px-4 py-2 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        🔌 OFF-GRID (soon)
      </button>

    </div>

    <!-- RECOMMENDATION -->
    <div v-if="recommendedInverter"
        class="bg-green-100 text-green-700 p-3 rounded mb-4">

      ✔ Recommended:
      <strong>
        {{ recommendedInverter.brand }} {{ recommendedInverter.model }}
      </strong>
      ({{ recommendedInverter.power }}W)

      — based on {{ requiredInverterPower.toFixed(0) }}W requirement
    </div>

    <!-- CUSTOM TOGGLE -->
    <label class="flex items-center gap-3 mb-4 cursor-pointer">
      <input type="checkbox" v-model="useCustom" />
      <span class="text-sm text-gray-700">Use Custom Inverter</span>
    </label>

    <!-- SEARCH COMBO -->
<div ref="dropdownRef" class="relative mb-4">

  <!-- INPUT -->
  <input
    v-model="searchQuery"
    @focus="showDropdown = true"
    @input="onSearch"
    type="text"
    placeholder="Search inverter (e.g. Growatt 5k)"
    class="w-full border rounded px-3 py-2"
  />

  <!-- DROPDOWN -->
  <div
    v-if="showDropdown && filteredInverters.length"
    class="absolute w-full bg-white border rounded mt-1 max-h-48 overflow-y-auto shadow z-10"
  >

    <div
      v-for="inv in filteredInverters"
      :key="inv.model"
      @click="selectInverter(inv)"
      class="px-3 py-2 cursor-pointer"
      :class="selectedInverter?.model === inv.model
        ? 'bg-blue-200'
        : 'hover:bg-blue-100'"
    >
      {{ inv.brand }} {{ inv.model }} ({{ inv.power }}W)
    </div>

  </div>

</div>

    <!-- SPECIFICATIONS -->
    <div v-if="activeInverter"
      class="mt-4 border rounded-lg p-4 bg-gray-50">

      <h3 class="font-semibold mb-3">⚡ Inverter Specifications</h3>

      <div class="grid grid-cols-2 gap-y-2 text-sm">
      
        <span>Rated Power</span>
        <span class="text-right">{{ activeInverter.power }} W</span>
      
        <span>Max PV Input</span>
        <span class="text-right">{{ activeInverter.maxPvInput }}</span>
      
        <span>System Voltage</span>
        <span class="text-right">{{ activeInverter.voltage }}</span>
      
        <span>Battery Voltage Range</span>
        <span class="text-right">{{ activeInverter.batteryRange }}</span>
      
        <span>MPPT Count</span>
        <span class="text-right">{{ activeInverter.mpptCount }}</span>
      
        <span>Max V per MPPT</span>
        <span class="text-right">{{ activeInverter.maxVoltagePerMppt }}</span>
      
        <span>Max I per MPPT</span>
        <span class="text-right">{{ activeInverter.maxCurrentPerMppt }}</span>
      
        <span>Phase</span>
        <span class="text-right">{{ activeInverter.phase }}</span>
      
      </div>
    
    </div>

    <!-- CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

      <div class="bg-gray-100 p-4 rounded text-center">
        <p class="text-sm text-gray-500">Total PV Power</p>
        <p class="text-xl font-bold">
          {{ Number(adjustedPower).toFixed(0) }} W
        </p>
      </div>

      <div class="bg-orange-100 p-4 rounded text-center">
        <p class="text-sm text-gray-500">Peak Load</p>
        <p class="text-xl font-bold text-orange-600">
          {{ Number(adjustedPower).toFixed(0) }} W
        </p>
      </div>

      <div class="bg-blue-100 p-4 rounded text-center">
        <p class="text-sm text-gray-500">With 20% Margin</p>
        <p class="text-xl font-bold text-blue-600">
          {{ requiredInverterPower.toFixed(0) }} W
        </p>
      </div>

    </div>

  </div>
</template>