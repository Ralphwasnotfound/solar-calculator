<script>
import LoadAnalysis from './steps/LoadAnalysis.vue';
import PanelSizing from './steps/PanelSizing.vue'
import Inverter from './steps/Inverter.vue'
import StringConfig from './steps/StringConfig.vue'
import Battery from './steps/Battery.vue'
import WireSizing from './steps/WireSizing.vue'
import Breakers from './steps/Breakers.vue'
import Overview from '../components/Overview.vue'

export default {
  components: {
    LoadAnalysis,
    PanelSizing,
    Inverter,
    StringConfig,
    Battery,
    WireSizing,
    Breakers,
    Overview

  },

  data() {
    return {
      currentStep : "load",
      requiredSolar: 0,
      adjustedPower: 0,
      dailyWh: 0,
      sunHours: 4,
      totalPvPower: 0,
      selectedPanel: null,
      selectedInverter: null,
      totalPanels: 0,
      showBatteryWarning: false,
      batteryWarningMessage: '',
      pendingStep: null,
      seriesPanels: 0,
      parallelStrings: 0,
      showResetConfirmation: false,
      steps: [
        { 
          key: "load", 
          label: "Load Analysis", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path></svg>`
        },
        { 
          key: "panel", 
          label:  "Panel Sizing", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 3C2.44772 3 2 3.44772 2 4V8L7.5 8V3H3ZM9.5 3V8H14.5V3H9.5ZM16.5 3V8H22V4C22 3.44772 21.5523 3 21 3H16.5ZM22 10H16.5V14H22V10ZM22 16H16.5V21H21C21.5523 21 22 20.5523 22 20V16ZM14.5 21V16H9.5V21H14.5ZM7.5 21V16H2V20C2 20.5523 2.44772 21 3 21H7.5ZM2 14H7.5V10L2 10V14ZM9.5 10H14.5V14H9.5V10Z"></path></svg>` 
        },
        { 
          key: "inverter", 
          label: "Inverter", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13 18V20H19V22H13C11.8954 22 11 21.1046 11 20V18H8C5.79086 18 4 16.2091 4 14V7C4 6.44772 4.44772 6 5 6H8V2H10V6H14V2H16V6H19C19.5523 6 20 6.44772 20 7V14C20 16.2091 18.2091 18 16 18H13ZM8 16H16C17.1046 16 18 15.1046 18 14V11H6V14C6 15.1046 6.89543 16 8 16ZM18 8H6V9H18V8ZM12 14.5C11.4477 14.5 11 14.0523 11 13.5C11 12.9477 11.4477 12.5 12 12.5C12.5523 12.5 13 12.9477 13 13.5C13 14.0523 12.5523 14.5 12 14.5Z"></path></svg>`
        },
        { 
          key: "stringConfig", 
          label: "String Config", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.0607 8.11097L14.4749 9.52518C17.2086 12.2589 17.2086 16.691 14.4749 19.4247L14.1214 19.7782C11.3877 22.5119 6.95555 22.5119 4.22188 19.7782C1.48821 17.0446 1.48821 12.6124 4.22188 9.87874L5.6361 11.293C3.68348 13.2456 3.68348 16.4114 5.6361 18.364C7.58872 20.3166 10.7545 20.3166 12.7072 18.364L13.0607 18.0105C15.0133 16.0578 15.0133 12.892 13.0607 10.9394L11.6465 9.52518L13.0607 8.11097ZM19.7782 14.1214L18.364 12.7072C20.3166 10.7545 20.3166 7.58872 18.364 5.6361C16.4114 3.68348 13.2456 3.68348 11.293 5.6361L10.9394 5.98965C8.98678 7.94227 8.98678 11.1081 10.9394 13.0607L12.3536 14.4749L10.9394 15.8891L9.52518 14.4749C6.79151 11.7413 6.79151 7.30911 9.52518 4.57544L9.87874 4.22188C12.6124 1.48821 17.0446 1.48821 19.7782 4.22188C22.5119 6.95555 22.5119 11.3877 19.7782 14.1214Z"></path></svg>`
        },
        { 
          key: "battery", 
          label: "Battery", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13 12H16L11 19V14H8L13 7V12ZM11 6H7V20H17V6H13V4H11V6ZM9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H18C18.5523 4 19 4.44772 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 4.44772 5.44772 4 6 4H9Z"></path></svg>`
        },
        { 
          key: "wireSizing", 
          label: "Wire Sizing", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.382 4H22V6H16.618L9 21.2361L5.38197 14H2V12H6.61803L9 16.7639L15.382 4Z"></path></svg>`
        },
        { 
          key: "breakers", 
          label: "Breakers", 
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 5V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7ZM17 13V10H15V13H9V10H7V13H4V19H20V13H17ZM9 3V5H15V3H9Z"></path></svg>`
        },
        {
          key: "overview",
          label: "Overview",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 13H11V21H3V13ZM13 3H21V11H13V3ZM13 13H21V21H13V13ZM3 3H11V11H3V3Z"></path></svg>`
        }
      ]
    }
  },
  
  methods: {
    goNext() {

      if (
          this.currentStep === 'battery'
      ) {
      
          const rawBatteryData =
            localStorage.getItem('batteryData')

          const batteryData =
            rawBatteryData &&
            rawBatteryData !== "undefined"
                ? JSON.parse(rawBatteryData)
                : null
      
          const inverter =
              this.selectedInverter
      
          if (
              batteryData?.selectedBattery &&
              inverter
          ) {
          
              const batteryVoltage =
                  batteryData.selectedBattery.voltage
          
              const range =
                  inverter.batteryRange
          
              const min =
                  parseInt(range.split('-')[0])
          
              const max =
                  parseInt(range.split('-')[1])
          
              if (
                  batteryVoltage < min ||
                  batteryVoltage > max
              ) {
              
                this.batteryWarningMessage =
                
                `Battery voltage (${batteryVoltage}V) is outside inverter's range (${range}). You may need to wre batties in series or choose a different battery.`
                this.showBatteryWarning = true
                return
              }
            
          }
        
      }
    
      const index =
          this.steps.findIndex(
              s => s.key === this.currentStep
          )
    
      if (
          index < this.steps.length - 1
      ) {
      
          this.currentStep =
              this.steps[index + 1].key
      
      }
      
    },
    confirmReset() {

      this.showResetConfirmation = false
        
      this.resetAll()
        
    },

    goStep(stepKey) {
      this.currentStep = stepKey;
    },

    resetAll() {
      localStorage.removeItem('currentStep');
      localStorage.removeItem('loadData');
      localStorage.removeItem('panelData');
      localStorage.removeItem('inverterData');
      localStorage.removeItem('mppts');
      localStorage.removeItem('batteryData');

      // wire sizing
      localStorage.removeItem('pvToInverter');
      localStorage.removeItem('batteryToInverter');
      localStorage.removeItem('inverterToLoad');
      localStorage.removeItem('voltageDrop');
      localStorage.removeItem('acVoltage');

      localStorage.removeItem('selectedPanel');
      localStorage.removeItem('selectedInverter');
      localStorage.removeItem('seriesPanels');
      localStorage.removeItem('parallelStrings');
      localStorage.removeItem('totalPanels');

      location.reload();
    },
    proceedAnyway() {
      this.showBatteryWarning = false
      const index =
        this.steps.findIndex(s => s.key === this.currentStep)
      if (index < this.steps.length - 1) {
          this.currentStep =
          this.steps[index + 1].key
      }
    },
    closeWarning() {
      this.showBatteryWarning = false
    },
  },
  mounted() {

    const savedStep =
        localStorage.getItem(
            'currentStep'
        )

    if (savedStep) {

        this.currentStep =
            savedStep
    }

    const savedPanel =
      localStorage.getItem('selectedPanel')

      if (
          savedPanel &&
          savedPanel !== "undefined"
      ) {
          this.selectedPanel =
              JSON.parse(savedPanel)
      }

    const savedInverter =
      localStorage.getItem('selectedInverter')

      if (
          savedInverter &&
          savedInverter !== "undefined"
      ) {
          this.selectedInverter =
              JSON.parse(savedInverter)
      }

    this.seriesPanels =
        Number(
            localStorage.getItem(
                'seriesPanels'
            )
        ) || 0

    this.parallelStrings =
        Number(
            localStorage.getItem(
                'parallelStrings'
            )
        ) || 0

    this.totalPanels =
        Number(
            localStorage.getItem(
                'totalPanels'
            )
        ) || 0
  },

  watch: {

    currentStep(val) {
        localStorage.setItem(
            'currentStep',
            val
        )
    },

    selectedPanel: {
        deep: true,
        handler(val) {
            localStorage.setItem(
                'selectedPanel',
                JSON.stringify(val)
            )
        }
    },

    selectedInverter: {
        deep: true,
        handler(val) {
            localStorage.setItem(
                'selectedInverter',
                JSON.stringify(val)
            )
        }
    },

    seriesPanels(val) {
        localStorage.setItem(
            'seriesPanels',
            val
        )
    },

    parallelStrings(val) {
        localStorage.setItem(
            'parallelStrings',
            val
        )
    },

    totalPanels(val) {
        localStorage.setItem(
            'totalPanels',
            val
        )
    }
  }
  
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">

    <!-- STEPS NAV -->

<div
  class="
    flex
    items-center

    md:justify-center

    overflow-x-auto

    py-6
    mb-6

    gap-0
  "
>


  <template
    v-for="(step, index) in steps"
    :key="step.key"
  >

    <!-- STEP -->

    <div
      class="
        flex
        flex-col
        items-center
        flex-shrink-0
      "
    >

      <button
        @click="goStep(step.key)"
        class="
          w-10
          h-10

          rounded-full

          flex
          items-center
          justify-center

          transition-all
        "
        :class="
          currentStep === step.key

          ? 'bg-blue-500 text-white'

          : 'bg-gray-300 text-gray-600'
        "
      >

        <div v-html="step.icon"></div>

      </button>

      <!-- LABEL -->

      <span
        class="
  text-[10px]
  mt-2
  text-center

  w-20

  whitespace-nowrap

  md:text-xs
"
        :class="
          currentStep === step.key

          ? 'text-blue-500 font-semibold'

          : 'text-gray-500'
        "
      >
        {{ step.label }}
      </span>

    </div>

    <!-- LINE -->
    <div
      v-if="index < steps.length - 1"
      class="flex-1 h-[1px] bg-gray-400

        -mx-5

        mb-6
        min-w-[30px]
      "
    ></div>

  </template>

</div>

    <div class="mt-6 flex justify-end">
      <button
      @click="showResetConfirmation = true"
      class="bg-red-500 text-white px-4 py-2 gap-2 rounded flex items-center justify-between"
      >
        RESET
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path></svg>
      </button>
    </div>

    <LoadAnalysis 
      v-show="currentStep === 'load'"
      @update-solar="requiredSolar = $event"
      @update-energy="dailyWh = $event"
      @update-sunhours="sunHours = $event"
    />
    <PanelSizing 
      v-show="currentStep === 'panel'"
      :requiredSolar="requiredSolar"
      :dailyWh="dailyWh"
      :sunHours="sunHours"

      @update-adjusted="adjustedPower = $event"
      @update-totalpv="totalPvPower = $event"

      @update-panel="selectedPanel = $event"
      @update-total-panels="totalPanels = $event"
    />
    <Inverter 
      v-show="currentStep === 'inverter'"
      :adjusted-power="totalPvPower"

      @update-inverter="selectedInverter = $event"
    />
    <StringConfig 
      v-show="currentStep === 'stringConfig'"

      :selectedPanel="selectedPanel"
      :selected-inverter="selectedInverter"
      :total-panels="totalPanels"

      @update-series-panels="seriesPanels = $event"
      @update-parallel-strings="parallelStrings = $event"
    />
    <Battery 
      v-show="currentStep === 'battery'"

      :dailyWh="dailyWh"
      :selected-inverter="selectedInverter"
    />
    <WireSizing 
      v-show="currentStep === 'wireSizing'"

      :series-panels="seriesPanels"
      :parallel-strings="parallelStrings"
      :selected-panel="selectedPanel"
      :selected-inverter="selectedInverter"
      :daily-wh="dailyWh"
      :total-panels="totalPanels"
    />
    <Breakers 
      v-show="currentStep === 'breakers'"

      :selected-panel="selectedPanel"
      :selected-inverter="selectedInverter"
      :series-panels="seriesPanels"
      :parallel-strings="parallelStrings"

      :ac-voltage="
    selectedInverter?.acOutputVoltage
  "
    />

    <Overview 
      v-show="currentStep === 'overview'"
    />

    <div
      v-if="showBatteryWarning"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >

      <div class="bg-white w-[420px] rounded-xl p-6 shadow-2xl">
      
        <h2 class="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(234,113,46,1)"><path d="M4.00001 20V14C4.00001 9.58172 7.58173 6 12 6C16.4183 6 20 9.58172 20 14V20H21V22H3.00001V20H4.00001ZM6.00001 14H8.00001C8.00001 11.7909 9.79087 10 12 10V8C8.6863 8 6.00001 10.6863 6.00001 14ZM11 2H13V5H11V2ZM19.7782 4.80761L21.1924 6.22183L19.0711 8.34315L17.6569 6.92893L19.7782 4.80761ZM2.80762 6.22183L4.22183 4.80761L6.34315 6.92893L4.92894 8.34315L2.80762 6.22183Z"></path></svg>
          Precautions
        </h2>

        <h2 class="text-orange-500 pb-2">
          Warnings - not advisable
        </h2>
      
        <p class="text-gray-700 mb-6 flex items-center gap-2 bg-orange-200 p-2 rounded-lg">
          <span class="mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="rgba(234,113,46,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>
          </span>
          {{ batteryWarningMessage }}
        </p>
      
        <div class="flex justify-end gap-3">
        
          <button
            @click="closeWarning"
            class="px-4 py-2 rounded bg-gray-200"
          >
            Go Back & Fix
          </button>
        
          <button
            @click="proceedAnyway"
            class="px-4 py-2 rounded bg-orange-500 text-white"
          >
            Proceed Anyway
          </button>
        
        </div>
      
      </div>
    
    </div>

    <div
      v-if="showResetConfirmation"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >

      <div class="bg-white w-[400px] rounded-2xl p-6 shadow-2xl">
      
        <h2 class="text-2xl font-bold text-red-500 mb-4">
          Reset Calculator
        </h2>
      
        <p class="text-gray-600 mb-6">
          Are you sure you want to reset all calculator data?
          This action cannot be undone.
        </p>
      
        <div class="flex justify-end gap-3">
        
          <button
            @click="showResetConfirmation = false"
            class="px-4 py-2 rounded-lg bg-gray-200"
          >
            Cancel
          </button>
        
          <button
            @click="confirmReset"
            class="px-4 py-2 rounded-lg bg-red-500 text-white"
          >
            Yes, Reset
          </button>
        
        </div>
      
      </div>
    
    </div>

    <!--NEXT BUTTON-->
    <div class="mt-6 flex justify-end">
      <button
      @click="goNext"
      class="bg-blue-500 text-white px-4 py-2 gap-2 rounded flex items-center justify-between"
      >
        NEXT 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.6315 12L10.8838 3.03212L9.11622 3.9679L13.3685 12L9.11622 20.0321L10.8838 20.9679L15.6315 12Z"></path></svg>
      </button>
    </div>

  </div>

</template>