<script>
import {
    getSystemDesign
} from '../utils/systemStorage.js'

export default {

    data() {

        return {
            mppts: [],
            dailyWh: 0,
            sunHours: 0,
            totalPvPower: 0,
            totalPanels: 0,
            seriesPanels: 0,
            parallelStrings: 0,
            selectedPanel: null,
            selectedInverter: null,
            batteryData: null,
            acVoltage: 0,
            pvWire: null,
            batteryWire: null,
            acWire: null,
            pvBreaker: null,
            batteryBreaker: null,
            acBreaker: null,
        }
    },

    computed: {
        stringVoltage() {

          const firstActive =
            this.mppts.find(m => m.series > 0)
                
          if (!this.selectedPanel || !firstActive) return '-'
                
          return `${(
            this.selectedPanel.voc *
            firstActive.series
          ).toFixed(1)}V`
        },

        stringCurrent() {

          const firstActive =
            this.mppts.find(m => m.parallel > 0)

          if (!this.selectedPanel || !firstActive) return '-'

          return `${(
            this.selectedPanel.isc *
            firstActive.parallel
          ).toFixed(1)}A`
        },

        requiredPvPower() {

            if (
                !this.dailyWh
                ||
                !this.sunHours
            ) {
                return '-'
            }

            return Math.ceil(
                this.dailyWh / this.sunHours
            )
        },

        batteryCapacity() {

            if (
                !this.batteryData?.selectedBattery
            ) {
                return '-'
            }

            const battery =
                this.batteryData.selectedBattery

            const total =
                battery.voltage
                *
                battery.capacityAh
                *
                this.batteryData.batteryCount

            return `${total} Wh`
        },

        batteryDisplayName() {
            if (!this.selectedBattery) return '-'
            return `${this.selectedBattery.brand} ${this.selectedBattery.voltage}V ${this.selectedBattery.capacityAh}Ah (${this.selectedBattery.energyWh}Wh)`
        }
    },

    methods: {

        loadData() {
        
            const systemData =
                getSystemDesign()
            
            this.mppts =
                    systemData.solar?.mppts || []

            // LOAD
            this.dailyWh =
                systemData.load?.dailyWh || 0
            
            this.sunHours =
                systemData.load?.sunHours || 0
            
            // SOLAR
            this.totalPvPower =
                systemData.solar?.totalPvPower || 0
            
            this.totalPanels =
                systemData.solar?.totalPanels || 0
            
            this.seriesPanels =
                systemData.solar?.seriesPanels || 0
            
            this.parallelStrings =
                systemData.solar?.parallelStrings || 0
            
            this.selectedPanel =
                systemData.solar?.selectedPanel || null
            
            // INVERTER
            this.selectedInverter =
                systemData.inverter?.selectedInverter || null
            
            // BATTERY
            this.batteryData = {
                selectedBattery:
                    systemData.battery?.selectedBattery || null,
                batteryCount:
                    systemData.battery?.batteriesNeeded || 0
            }
            
            // WIRES
            this.acVoltage =
                systemData.wires?.acVoltage || 0
            
            const sections =
                systemData.wires?.sections || []
            
            this.pvWire =
                sections.find(s => s.name === 'PV to Inverter')
            
            this.batteryWire =
                sections.find(s => s.name === 'Battery to Inverter')
            
            this.acWire =
                sections.find(s => s.name === 'Inverter to Load')
            
            // BREAKERS
            this.pvBreaker =
                systemData.protection?.pvBreaker
                    ? `${systemData.protection.pvBreaker}A`
                    : '-'
            
            this.batteryBreaker =
                systemData.protection?.batteryBreaker
                    ? `${systemData.protection.batteryBreaker}A`
                    : '-'
            
            this.acBreaker =
                systemData.protection?.acBreaker
                    ? `${systemData.protection.acBreaker}A`
                    : '-'
        }
    },

    mounted() {
      this.loadData()

      window.addEventListener(
        'system-updated',
        this.loadData
      )
    },

    beforeUnmount() {
      window.removeEventListener(
        'system-updated',
        this.loadData
      )
    },

    watch: {
        $route() {
            this.loadData()
            
        }
        
    }
}
</script>

<template>

    <div class="bg-white rounded-2xl shadow p-4 md:p-6">

        <!-- HEADER -->
        
        <div class="mb-6">
            
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                System Design Summary
            </h1>
            
            <p class="text-gray-500 mt-1">
                Final solar system overview and bill of materials
            </p>
        
        </div>

        <!-- LOAD & SOLAR -->
    
        <div class="mb-8">
            
            <h2 class="text-xl font-semibold mb-4 text-blue-600">
                Load & Solar
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border rounded-xl p-4">
                    <div class="flex justify-between py-2 border-b">
                        <span>Daily Consumption</span>
                        <span class="font-semibold">
                            {{ dailyWh ? `${Math.round(dailyWh)} Wh` : '-' }}
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b">
                        <span>Sun Peak Hours</span>
                        <span class="font-semibold">
                            {{
                                sunHours
                                    ? `${sunHours} hrs`
                                    : '-'
                            }}
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2">
                        <span>Required PV Power</span>
                        <span class="font-semibold">
                            {{
                                requiredPvPower !== '-'
                                    ? `${requiredPvPower} W`
                                    : '-'
                            }}
                        </span>
                    </div>
                </div>
                
                <div class="border rounded-xl p-4">

                    <div class="flex justify-between py-2 border-b">
                        <span>Total PV Power</span>
                        <span class="font-semibold">
                            {{
                                totalPvPower
                                    ? `${totalPvPower} W`
                                    : '-'
                            }}
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b">
                        <span>Total Panels</span>
                        <span class="font-semibold">
                            {{
                                totalPanels || '-'
                            }}
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2">
                        <span>Panel Model</span>
                        <span class="font-semibold">
                            {{
                                selectedPanel
                                    ? `${selectedPanel.brand} ${selectedPanel.model}`
                                    : '-'
                            }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    
        <!-- STRING CONFIG -->
    
        <div class="mb-8">
            
            <h2 class="text-xl font-semibold mb-4 text-blue-600">
                String Configuration
            </h2>
        
            <div class="border rounded-xl p-4">
                
                <div class="flex justify-between py-2 border-b">
                    <span>Panels in Series</span>
                    <span class="font-semibold">
                        {{
                            seriesPanels || '-'
                        }}
                    </span>
                </div>
                
                <div class="flex justify-between py-2 border-b">
                    <span>Parallel Strings</span>
                    <span class="font-semibold">
                        {{
                            parallelStrings || '-'
                        }}
                    </span>
                </div>
                
                <div class="flex justify-between py-2 border-b">
                    <span>String Voltage</span>
                    <span class="font-semibold">
                        {{ stringVoltage }}
                    </span>
                </div>
                
                <div class="flex justify-between py-2">
                    <span>String Current</span>
                    <span class="font-semibold">
                        {{ stringCurrent }}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- INVERTER & BATTERY -->
        
        <div class="mb-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- inverter -->
                
                <div>

                        <h2 class="text-xl font-semibold mb-4 text-blue-600">
                        Inverter
                    </h2>
                    
                    <div class="border rounded-xl p-4">

                        <div class="flex justify-between py-2 border-b">
                            <span>Model</span>
                            <span class="font-semibold">
                                {{ selectedInverter?.model || '-' }}
                            </span>
                        </div>
                    
                        <div class="flex justify-between py-2 border-b">
                            <span>Power</span>
                            <span class="font-semibold">
                                {{
                                    selectedInverter?.power
                                        ? `${selectedInverter.power}W`
                                        : '-'
                                }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2 border-b">
                            <span>Phase</span>
                            <span class="font-semibold">
                                {{ selectedInverter?.phase || '-' }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2">
                            <span>AC Voltage</span>
                            <span class="font-semibold">
                                {{
                                    acVoltage
                                        ? `${acVoltage}V`
                                        : '-'
                                }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- battery -->
                
                <div>
                    
                    <h2 class="text-xl font-semibold mb-4 text-blue-600">
                        Battery
                    </h2>
                    
                    <div class="border rounded-xl p-4">
                        
                        <div class="flex justify-between py-2 border-b">
                            <span>Battery Voltage</span>
                            <span class="font-semibold">
                                {{
                                    batteryData?.selectedBattery?.voltage
                                        ? `${batteryData.selectedBattery.voltage}V`
                                        : '-'
                                }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2 border-b">
                            <span>Battery Count</span>
                            <span class="font-semibold">
                                {{
                                    batteryData?.batteryCount || '-'
                                }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2">
                            <span>Total Capacity</span>
                            <span class="font-semibold">
                                {{ batteryCapacity || '-'}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- WIRE SIZING -->
        
        <div class="mb-8">
            
            <h2 class="text-xl font-semibold mb-4 text-blue-600">
                Wire Sizing
            </h2>
            
            <div class="overflow-x-auto">

                <table class="min-w-[700px] w-full">

                    <thead>

                        <tr class="border-b text-left">

                            <th class="py-3">
                                Wire
                            </th>
                            
                            <th>
                                Size
                            </th>
                            
                            <th>
                                Length
                            </th>
                        
                        </tr>
                    
                    </thead>
                    
                    <tbody>
                        
                        <tr class="border-b">

                            <td class="py-3">
                                PV Wire
                            </td>
                            
                            <td>
                                {{
                                    pvWire?.awg
                                        ? `AWG ${pvWire.awg}`
                                        : '-'
                                }}
                            </td>
                            
                            <td>
                                {{
                                    pvWire?.distance
                                        ? `${pvWire.distance}m`
                                        : '-'
                                }}
                            </td>
                        
                        </tr>
                        
                        <tr class="border-b">

                            <td class="py-3">
                                Battery Wire
                            </td>
                            
                            <td>
                                {{
                                    batteryWire?.awg
                                        ? `AWG ${batteryWire.awg}`
                                        : '-'
                                }}
                            </td>
                            
                            <td>
                                {{
                                    batteryWire?.distance
                                        ? `${batteryWire.distance}m`
                                        : '-'
                                }}
                            </td>
                        
                        </tr>
                        
                        <tr>

                            <td class="py-3">
                                AC Wire
                            </td>
                            
                            <td>
                                {{
                                    acWire?.awg
                                        ? `AWG ${acWire.awg}`
                                        : '-'
                                }}
                            </td>
                            
                            <td>
                                {{
                                    acWire?.distance
                                        ? `${acWire.distance}m`
                                        : '-'
                                }}
                            </td>
                        
                        </tr>
                    
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- PROTECTION DEVICES -->
        
        <div class="mb-8">
            
            <h2 class="text-xl font-semibold mb-4 text-blue-600">
                Protection Devices
            </h2>
            
            <div class="border rounded-xl p-4">

                <div class="flex justify-between py-2 border-b">
                    <span>PV DC Breaker</span>
                    <span class="font-semibold">
                        {{ pvBreaker || '-' }}
                    </span>
                </div>
            
                <div class="flex justify-between py-2 border-b">
                    <span>Battery DC MCCB</span>
                    <span class="font-semibold">
                        {{ batteryBreaker || '-' }}
                    </span>
                    </div>
                
                <div class="flex justify-between py-2">
                    <span>AC Breaker</span>
                    <span class="font-semibold">
                        {{ acBreaker || '-' }}
                    </span>
                </div>
            
            </div>
            
        </div>

        <!-- BOM -->
        <div>
            
            <h2 class="text-xl font-semibold mb-4 text-blue-600">
                Bill of Materials (BOM)
            </h2>

            <div class="overflow-x-auto">
                <table class="min-w-[700px] w-full">
                    <thead>
                        
                        <tr class="border-b text-left">
                            
                            <th class="py-3">
                                Item
                            </th>
                            
                            <th>
                                Qty
                            </th>
                            
                            <th>
                                Specification
                            </th>
                            
                        </tr>
                    
                    </thead>
                    
                    <tbody>

                        <tr class="border-b">
                            
                            <td class="py-3">
                                Solar Panels
                            </td>
                            
                            <td>
                                {{ totalPanels || '-' }}
                            </td>
                            
                            <td>
                                {{
                                    selectedPanel
                                    ? `${selectedPanel.brand} ${selectedPanel.model}`
                                    : '-'
                                }}
                            </td>
                        
                        </tr>
                    
                        <tr class="border-b">
                            
                            <td class="py-3">
                                Hybrid Inverter
                            </td>
                            
                            <td>
                                {{ selectedInverter && '1' || '-' }}
                            </td>
                            
                            <td>
                                {{ selectedInverter?.model || '-' }}
                            </td>
                        
                        </tr>
                    
                        <tr class="border-b">
                            
                            <td class="py-3">
                                Batteries
                            </td>
                            
                            <td>
                                {{
                                batteryData?.batteryCount !== undefined
                                    ? batteryData.batteryCount
                                    : '-'
                                }}
                            </td>
                            
                            <td>
                                {{
  batteryData?.selectedBattery?.displayName || '-'
}}
                            </td>
                        
                        </tr>
                    
                        <tr>
                            
                            <td class="py-3">
                                AC Breaker
                            </td>
                        
                            <td>
                                {{ acBreaker ? 1 : '-' }}
                            </td>
                        
                            <td>
                                {{ acBreaker || '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</template>