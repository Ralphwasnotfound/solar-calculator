<script>

export default {
    props: {
        selectedPanel: Object,
        selectedInverter: Object,
        dailyWh: Number,
        totalPanels: Number,
        seriesPanels: Number,
        parallelStrings: Number,
    },
    data() {
        return {
            pvToInverter:
                Number(
                    localStorage.getItem(
                        'pvToInverter'
                    )
                ) || 10,

            batteryToInverter:
                Number(
                    localStorage.getItem(
                        'batteryToInverter'
                    )
                ) || 2,

            inverterToLoad:
                Number(
                    localStorage.getItem(
                        'inverterToLoad'
                    )
                ) || 15,

            voltageDrop:
                Number(
                    localStorage.getItem(
                        'voltageDrop'
                    )
                ) || 3,

            acVoltage:
                Number(
                    localStorage.getItem(
                        'acVoltage'
                    )
                ) || 220
        }
    },
    methods: {
        getWireSize(vdi) {
            const table = [
                
                {
                    max: 0.5,
                    awg: 14,
                    mm: 2.08
                },
            
                {
                    max: 1.0,
                    awg: 12,
                    mm: 3.31
                },
            
                {
                    max: 2.0,
                    awg: 10,
                    mm: 5.26
                },
            
                {
                    max: 4.0,
                    awg: 8,
                    mm: 8.37
                },
            
                {
                    max: 6.0,
                    awg: 6,
                    mm: 13.3
                },
            
                {
                    max: 10.0,
                    awg: 4,
                    mm: 21.1
                }
            
            ]
            
            return (
                table.find(
                    wire => vdi <= wire.max
                )
                ||
                table[table.length - 1]
            )
        }
    },
    computed: {

        sections() {

            const pvCurrent =
                (this.selectedPanel?.isc || 0)
                *
                this.parallelStrings

            const pvVoltage =
                (this.selectedPanel?.voc || 0)
                *
                this.seriesPanels

            const batteryVoltage =
                parseInt(this.selectedInverter?.voltage)
                || 48

            const inverterPower =
                parseInt(this.selectedInverter?.power)
                || 8000

            const batteryCurrent =
                batteryVoltage
                ? (
                    inverterPower /
                    (batteryVoltage * 0.9)
                )
                : 0
            const acCurrent =
                inverterPower / this.acVoltage

            // PV VDI
            const pvVdi =
                (
                    (pvCurrent * this.pvToInverter)
                    /
                    (
                        this.voltageDrop *
                        pvVoltage
                    )
                )
            const pvWire =
                this.getWireSize(pvVdi)

            // Battery VDI
                const batteryDistance =
                this.batteryToInverter
                * 2

            const batteryVdi =
            (
                (
                    batteryCurrent *
                    batteryDistance
                )
                /
                (
                    this.voltageDrop *
                    batteryVoltage
                )
            )
            const batteryWire =
                this.getWireSize(batteryVdi)

            // AC VDI
            const acVdi =
                (
                    (acCurrent * this.inverterToLoad)
                    /
                    (
                        this.voltageDrop *
                        220
                    )
                )
            const acWire =
                this.getWireSize(acVdi)

            return [

                {
                    name: 'PV to Inverter',
                    current: pvCurrent,
                    voltage: pvVoltage,
                    distance: this.pvToInverter,
                    vdi: pvVdi.toFixed(2),
                    awg: pvWire.awg,
                    mm: pvWire.mm
                },

                {
                    name: 'Battery to Inverter',
                    current: batteryCurrent,
                    voltage: batteryVoltage,
                    distance: this.batteryToInverter,
                    vdi: batteryVdi.toFixed(2),
                    awg: batteryWire.awg,
                    mm: batteryWire.mm
                },
                {
                    name: 'Inverter to Load',
                    current: acCurrent,
                    voltage: this.acVoltage,
                    distance: this.inverterToLoad,
                    vdi: acVdi.toFixed(2),
                    awg: acWire.awg,
                    mm: acWire.mm
                }
            ]
        }
    },
    watch: {

        pvToInverter(value) {
            localStorage.setItem(
                'pvToInverter',
                value
            )
        },

        batteryToInverter(value) {
            localStorage.setItem(
                'batteryToInverter',
                value
            )
        },

        inverterToLoad(value) {
            localStorage.setItem(
                'inverterToLoad',
                value
            )
        },

        voltageDrop(value) {
            localStorage.setItem(
                'voltageDrop',
                value
            )
        },

        acVoltage(value) {
            localStorage.setItem(
                'acVoltage',
                value
            )
        }
    }
}

</script>

<template>
    <div class="p-6 mx-auto">

        <!-- TITLE -->

        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="36"
                height="36"
                fill="rgba(59,130,246,1)"
            >
                <path d="M21 4V6H19V4H21ZM15 4H17V6H15V4ZM9 4H11V6H9V4ZM3 4H5V6H3V4ZM21 9V11H19V9H21ZM15 9H17V11H15V9ZM9 9H11V11H9V9ZM3 9H5V11H3V9ZM21 14V16H19V14H21ZM15 14H17V16H15V14ZM9 14H11V16H9V14ZM3 14H5V16H3V14ZM21 19V21H19V19H21ZM15 19H17V21H15V19ZM9 19H11V21H9V19ZM3 19H5V21H3V19Z"></path>
            </svg>

            Wire Sizing (VDI Method)

        </h2>

        <!-- INPUTS -->

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            <!-- PV TO INVERTER -->

            <div>

                <label class="block text-sm text-gray-500 mb-2">
                    PV to Inverter
                </label>

                <div class="flex">

                    <input
                        v-model="pvToInverter"
                        type="number"
                        class="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                    >

                    <div
                        class="bg-gray-100 border border-l-0 border-gray-300 px-4 flex items-center rounded-r-lg"
                    >
                        m
                    </div>

                </div>

            </div>

            <!-- BATTERY TO INVERTER -->

            <div>

                <label class="block text-sm text-gray-500 mb-2">
                    Battery to Inverter
                </label>

                <div class="flex">

                    <input
                        v-model="batteryToInverter"
                        type="number"
                        class="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                    >

                    <div
                        class="bg-gray-100 border border-l-0 border-gray-300 px-4 flex items-center rounded-r-lg"
                    >
                        m
                    </div>

                </div>

            </div>

            <!-- INVERTER TO LOAD -->

            <div>

                <label class="block text-sm text-gray-500 mb-2">
                    Inverter to Load
                </label>

                <div class="flex">

                    <input
                        v-model="inverterToLoad"
                        type="number"
                        class="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                    >

                    <div
                        class="bg-gray-100 border border-l-0 border-gray-300 px-4 flex items-center rounded-r-lg"
                    >
                        m
                    </div>

                </div>

            </div>

            <!-- VOLTAGE DROP -->

            <div>

                <label class="block text-sm text-gray-500 mb-2">
                    Voltage Drop
                </label>

                <div class="flex">

                    <input
                        v-model="voltageDrop"
                        type="number"
                        class="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                    >

                    <div
                        class="bg-gray-100 border border-l-0 border-gray-300 px-4 flex items-center rounded-r-lg"
                    >
                        %
                    </div>

                </div>

            </div>

        </div>

        <!-- TABLE -->

        <div class=" overflow-x-auto mb-6 bg-white p-4 md:p-6 rounded-xl shadow">

            <table class=" min-w-[700px] w-full border-collapse text-sm">   

                <thead>

                    <tr class="border-b text-left text-gray-500">

                        <th class="py-3 whitespace-nowrap">
                            Section
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            Current (A)
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            Voltage (V)
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            Distance (m)
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            VDI
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            Wire (AWG)
                        </th>
                        
                        <th class="py-3 whitespace-nowrap">
                            Wire (mm²)
                        </th>
                    
                    </tr>
                
                </thead>
                
                <tbody>

                    <tr
                        v-for="section in sections"
                        :key="section.name"
                        class="border-b"
                    >

                        <td class="py-4 whitespace-nowrap">
                            {{ section.name }}
                        </td>
                        
                        <td class="whitespace-nowrap">
                            {{ Number(section.current).toFixed(1) }}
                        </td>
                        
                        <td class="whitespace-nowrap">
                            {{ Number(section.voltage).toFixed(1) }}
                        </td>
                        
                        <td class="whitespace-nowrap">
                            {{ section.distance }}
                        </td>
                        
                        <td class="whitespace-nowrap">
                            {{ Number(section.vdi).toFixed(1) }}
                        </td>
                        
                        <td class="font-semibold whitespace-nowrap">
                            {{ section.awg }}
                        </td>
                        
                        <td class="whitespace-nowrap">
                            {{ Number(section.mm).toFixed(2) }}
                        </td>
                    
                    </tr>
                
                </tbody>
            </table>
        </div>

        <!-- FORMULA -->

        <div class="md:block hidden bg-blue-100 text-blue-700 p-2 rounded-lg text-sm">
            <p class="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                <span class="font-bold">VDI Formula:</span>

                VDI =
                (Current × Distance_ft)
                /
                (% Voltage Drop × Voltage)

                → lookup AWG from table

            </p>
        </div>

        <div class="md:hidden bg-blue-100 text-blue-700 p-3 rounded-lg text-sm flex flex-col md:flex-row gap-2 break-words">

            <div class="flex items-center gap-2 font-semibold">
            
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)" class="flex-shrink-0"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                
                <span class="font-bold">
                    VDI Formula:
                </span>
            
            </div>
            
            <span>
            
                VDI =
            
                (Current × Distance_ft)
            
                /
            
                (% Voltage Drop × Voltage)
            
                →
            
                lookup AWG from table
            
            </span>
        </div>
    </div>
</template>