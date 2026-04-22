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

    showSpecs() {
      if (this.useCustom) {
        return !!this.selectedInverter;
      }
    
      return this.searchQuery && this.recommendedInverter;
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
      
      this.searchQuery = `${inv.brand} ${inv.model}`;
      this.showDropdown = false;
    },

    onSearch() {
      this.showDropdown = true;

      if (!this.searchQuery.trim()) {
        this.selectedInverter = null;
        return;
      }

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
    <h2 class="text-2xl flex items-center gap-2 font-bold mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(234,113,46,1)"><path d="M13 18V20H19V22H13C11.8954 22 11 21.1046 11 20V18H8C5.79086 18 4 16.2091 4 14V7C4 6.44772 4.44772 6 5 6H8V2H10V6H14V2H16V6H19C19.5523 6 20 6.44772 20 7V14C20 16.2091 18.2091 18 16 18H13ZM8 16H16C17.1046 16 18 15.1046 18 14V11H6V14C6 15.1046 6.89543 16 8 16ZM18 8H6V9H18V8ZM12 14.5C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5C12.5523 12.5 13 12.9477 13 13.5C13 14.0523 12.5523 14.5 12 14.5Z"></path></svg>
      Inverter Sizing
    </h2>

    <!-- TYPE BUTTONS -->
    <div class="flex gap-2 mb-6">

      <button
        @click="inverterType = 'hybrid'"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold"
        :class="inverterType === 'hybrid'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200'"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 16V12L21 17L16 22V18H4V16H16ZM8 2V5.999L20 6V8H8V12L3 7L8 2Z"></path></svg>  
      HYBRID
      </button>

      <button
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.5 11.0001H13V3.50008L16.0429 6.54297L19.2929 3.29297L20.7071 4.70718L17.4571 7.95718L20.5 11.0001ZM3.50008 13H11.0001V20.5L7.95718 17.4571L4.70718 20.7071L3.29297 19.2929L6.54297 16.0429L3.50008 13Z"></path></svg>
      ON-GRID (soon)
      </button>

      <button
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 3H13.5L16.5429 6.04289L13.2929 9.29289L14.7071 10.7071L17.9571 7.45711L21 10.5V3ZM3 21H10.5L7.45711 17.9571L10.7071 14.7071L9.29289 13.2929L6.04289 16.5429L3 13.5V21Z"></path></svg>
        OFF-GRID (soon)
      </button>

    </div>

    <!-- RECOMMENDATION -->
    <div v-if="recommendedInverter"
        class="bg-green-100 text-green-700 p-1 rounded-lg mb-4 flex items-center gap-2 ">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(11,174,70,1)"><path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM17.4571 9.45711L16.0429 8.04289L11 13.0858L8.20711 10.2929L6.79289 11.7071L11 15.9142L17.4571 9.45711Z"></path></svg>
      Recommended:
      <strong>
        {{ recommendedInverter.brand }} {{ recommendedInverter.model }}
      </strong>
      ({{ recommendedInverter.power }}W)

      — based on {{ requiredInverterPower.toFixed(0) }}W requirement
    </div>

    <!-- CUSTOM TOGGLE -->

    <label class="flex items-center gap-3 mb-2 cursor-pointer mt-4">

            <!-- TOGGLE -->
            <div class="relative">
                <input
                    type="checkbox"
                    v-model="useCustom"
                    class="sr-only peer"
                />  
            
                <!-- Track -->
                <div class="w-11 h-6 bg-gray-300 rounded-full
                            peer-checked:bg-blue-500
                            transition-colors">
                </div>

                <!-- Circle -->
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                            shadow-md
                            transform transition-transform
                            peer-checked:translate-x-5">
                </div>
            </div>
        
            <!-- TEXT (RIGHT SIDE) -->
            <span class="text-sm font-medium text-gray-700">
                Use Custom Inverter
            </span>

        </label>

    <!-- SEARCH COMBO -->
    <div ref="dropdownRef" class="relative mb-4">
    
      <!-- INPUT -->
      <input
        v-model="searchQuery"
        @focus="showDropdown = true"
        @input="onSearch"
        type="text"
        placeholder="Search inverter (e.g. Deye)"
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
    <div v-if="showSpecs"
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

    <!-- EMPTY STATE -->
    <div v-else
        class="mt-4 p-6 border rounded-lg text-center text-gray-400">

      <p class="text-lg mb-2 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(140,145,150,1)"><path d="M13 18V20H19V22H13C11.8954 22 11 21.1046 11 20V18H8C5.79086 18 4 16.2091 4 14V7C4 6.44772 4.44772 6 5 6H8V2H10V6H14V2H16V6H19C19.5523 6 20 6.44772 20 7V14C20 16.2091 18.2091 18 16 18H13ZM8 16H16C17.1046 16 18 15.1046 18 14V11H6V14C6 15.1046 6.89543 16 8 16ZM18 8H6V9H18V8ZM12 14.5C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5C12.5523 12.5 13 12.9477 13 13.5C13 14.0523 12.5523 14.5 12 14.5Z"></path></svg>
        No inverter selected
      </p>
      <p class="text-sm">
        Search and select an inverter to view specifications
      </p>
    
    </div>

    <!-- CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

      <div class="bg-gray-100 p-4 rounded shadow flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm">Total PV Power</p>
            <p class="text-xl font-bold">
                {{ Number(adjustedPower).toFixed(0) }} W
            </p>
        </div>
            
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(102,105,110,1)"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path></svg>
        </div>
      </div>

      <div class="bg-orange-100 p-4 rounded shadow flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm">Peak Load</p>
            <p class="text-xl font-bold">
                {{ Number(adjustedPower).toFixed(0) }} W
            </p>
        </div>
            
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(207,152,25,1)"><path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path></svg>
        </div>
      </div>

      <div class="bg-blue-100 p-4 rounded shadow flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm">With 20% Margin</p>
            <p class="text-xl font-bold">
                {{ requiredInverterPower.toFixed(0) }} W
            </p>
        </div>
            
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M12.3389 2.0088L12 4.00001C8.68631 4.00001 6.00003 6.68633 6 10C6 11.3842 6.46775 12.6914 7.31445 13.7481C7.39984 13.8546 8.12027 14.6007 8.23145 14.7217C9.22754 15.8063 9.84058 16.7984 9.97266 18H14.0273C14.1594 16.7985 14.7721 15.8065 15.7676 14.7227C15.8796 14.6007 16.5977 13.857 16.6836 13.75C17.5313 12.693 18 11.385 18 10L19.9902 9.66017C19.9949 9.77288 20 9.88614 20 10C20 11.8924 19.3426 13.6312 18.2441 15.001C17.6238 15.7744 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C7.99996 17 6.37453 15.7734 5.75391 14.999C4.65647 13.6296 4 11.8915 4 10C4.00003 5.58176 7.58174 2.00001 12 2.00001C12.1135 2.00001 12.2265 2.00411 12.3389 2.0088ZM10 21H14V20H10V21ZM17.5293 0.328369C17.7059 -0.0974062 18.2942 -0.0974181 18.4707 0.328369L18.7236 0.939698C19.1556 1.98249 19.9616 2.81521 20.9746 3.26587L21.6924 3.58521C22.1026 3.76803 22.1026 4.36522 21.6924 4.5481L20.9326 4.88599C19.9449 5.32526 19.1534 6.12849 18.7139 7.13696L18.4668 7.70239C18.2864 8.11652 17.7137 8.11652 17.5332 7.70239L17.2871 7.13696C16.8476 6.12833 16.0552 5.32531 15.0674 4.88599L14.3076 4.5481C13.8975 4.36524 13.8974 3.76801 14.3076 3.58521L15.0254 3.26587C16.0385 2.81521 16.8445 1.9825 17.2764 0.939698L17.5293 0.328369Z"></path></svg>
        </div>
      </div>

    </div>

  </div>
</template>