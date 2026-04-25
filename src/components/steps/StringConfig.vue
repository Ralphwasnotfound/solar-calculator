<script>
export default {
    props: [
        'selectedPanel',
        'selectedInverter',
        'totalPanels'
    ],

    data() {
        return {
            activeMppt: null,
            mpptCount: 2,

            mppts: [
            {
            series: 0,
            parallel: 1
            },
            {
            series: 0,
            parallel: 1
            }
            ]
        }
    },

    computed: {

        maxSeriesPanels() {
            if (!this.selectedPanel || !this.selectedInverter) return 0;
            
            return Math.floor(
                parseFloat(this.selectedInverter.maxVoltagePerMppt) /
                parseFloat(this.selectedPanel.voc)
            );
        },

        assignedPanels() {
            return this.mppts.reduce((total, mppt) => {
              return total + (mppt.series * mppt.parallel);
            }, 0);
        },

        currentStatus() {
        
            if (!this.selectedPanel || !this.selectedInverter) {
                return {
                    current: 0,
                    max: 0,
                    safe: true
                }
            }
        
            const stringCurrent =
                this.mppts[0].parallel *
                parseFloat(this.selectedPanel.isc)
        
            const maxCurrent =
                parseFloat(this.selectedInverter.maxCurrentPerMppt)
        
            return {
                current: stringCurrent,
                max: maxCurrent,
                safe: stringCurrent <= maxCurrent
            }
        },

        mpptStatus() {
            return this.mppts.map(mppt => {
                const voltage =
                    mppt.series *
                        (this.selectedPanel?.voc || 0)

                const current =
                    mppt.parallel *
                        (this.selectedPanel?.isc || 0)

                const maxVoltage =
                    parseFloat(
                        this.selectedInverter?.maxVoltagePerMppt || 0
                    )

                const maxCurrent =
                    parseFloat(
                        this.selectedInverter?.maxCurrentPerMppt || 0
                    )

                return {

                    voltageSafe:
                        voltage <= maxVoltage,

                    currentSafe:
                        current <= maxCurrent
                }
            })
        }
    },

    mounted() {
        this.activeMppt = null;
        const savedMppts =
            localStorage.getItem("mppts")

        if (savedMppts) {
            this.mppts =
                JSON.parse(savedMppts)
        }
    },
    watch: {
        maxSeriesPanels(newVal) {
            if (newVal > 0 && this.mppts[0].series === 0) {
            this.mppts[0].series = newVal;
        }
    },
    mppts: {
        handler(newValue) {

            localStorage.setItem(
                "mppts",
                JSON.stringify(newValue)
            )

            const totalSeriesVoltage = Math.max(
                ...newValue.map(mppt => mppt.series)
            )

            const maxParallelStrings = Math.max(
                ...newValue.map(mppt => mppt.parallel)
            )

            this.$emit(
                'update-series-panels',
                totalSeriesVoltage
            )

            this.$emit(
                'update-parallel-strings',
                maxParallelStrings
            )
        },
        deep: true
    }
    },
}
</script>

<template>

    <div class=" p-6">

        <!-- TITLE -->
        <h2 class="text-2xl flex items-center gap-2 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(71,75,79,1)"><path d="M13.0607 8.11097L14.4749 9.52518C17.2086 12.2589 17.2086 16.691 14.4749 19.4247L14.1214 19.7782C11.3877 22.5119 6.95555 22.5119 4.22188 19.7782C1.48821 17.0446 1.48821 12.6124 4.22188 9.87874L5.6361 11.293C3.68348 13.2456 3.68348 16.4114 5.6361 18.364C7.58872 20.3166 10.7545 20.3166 12.7072 18.364L13.0607 18.0105C15.0133 16.0578 15.0133 12.892 13.0607 10.9394L11.6465 9.52518L13.0607 8.11097ZM19.7782 14.1214L18.364 12.7072C20.3166 10.7545 20.3166 7.58872 18.364 5.6361C16.4114 3.68348 13.2456 3.68348 11.293 5.6361L10.9394 5.98965C8.98678 7.94227 8.98678 11.1081 10.9394 13.0607L12.3536 14.4749L10.9394 15.8891L9.52518 14.4749C6.79151 11.7413 6.79151 7.30911 9.52518 4.57544L9.87874 4.22188C12.6124 1.48821 17.0446 1.48821 19.7782 4.22188C22.5119 6.95555 22.5119 11.3877 19.7782 14.1214Z"></path></svg>
            PV String Configuration
        </h2>

        <!-- WARNING -->
        <div 
            :class="currentStatus.safe
                ? 'bg-green-100 text-green-700 p-3 rounded mb-4'
                : 'bg-red-100 text-red-700'"
            class="p-3 rounded-lg mb-4"
            >

            <span v-if="currentStatus.safe" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(100,205,138,1)"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"></path></svg>
                MPPT Current is safe
            </span>
        
            <span v-else class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(239,41,41,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path></svg>MPPT 1:
                Isc exceeds max
                {{ currentStatus.max }}A
            </span>

        </div>

        <!-- TOP CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Max Series / MPPT</p>
                    <p class="text-2xl font-bold">
                        {{ maxSeriesPanels }} pcs
                    </p>
                </div>
            
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M12 11V8L16 12L12 16V13H8V11H12ZM12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20Z"></path></svg>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Total Panels</p>
                    <p class="text-2xl font-bold">
                        {{ totalPanels }} pcs
                    </p>
                </div>

                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M3 3C2.44772 3 2 3.44772 2 4V8L7.5 8V3H3ZM9.5 3V8H14.5V3H9.5ZM16.5 3V8H22V4C22 3.44772 21.5523 3 21 3H16.5ZM22 10H16.5V14H22V10ZM22 16H16.5V21H21C21.5523 21 22 20.5523 22 20V16ZM14.5 21V16H9.5V21H14.5ZM7.5 21V16H2V20C2 20.5523 2.44772 21 3 21H7.5ZM2 14H7.5V10L2 10V14ZM9.5 10H14.5V14H9.5V10Z"></path></svg>
                </div>
            </div>

            <div class="bg-orange-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Max Voltage / MPPT</p>
                    <p class="text-2xl font-bold">
                        {{ selectedInverter?.maxVoltagePerMppt }}
                    </p>
                </div>

                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(240,187,64,1)"><path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path></svg>
                </div>
            </div>

            <div class="bg-cyan-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Max Current / MPPT</p>
                    <p class="text-2xl font-bold">
                        {{ Number(currentStatus.max).toFixed(1) }} A
                    </p>
                </div>

                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(100,205,138,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
                </div>
            </div>
        </div>

        <!-- MPPT SECTION -->
        <div class="border rounded-lg p-4">

            <div class="flex justify-between items-center mb-4">

                <h3 class="font-semibold text-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(226,167,37,1)"><path d="M5 3V19H21V21H3V3H5ZM20.2929 6.29289L21.7071 7.70711L16 13.4142L13 10.415L8.70711 14.7071L7.29289 13.2929L13 7.58579L16 10.585L20.2929 6.29289Z"></path></svg>
                    MPPT String Distribution
                </h3>

                <button class="bg-gray-200 px-3 py-1 rounded">
                    Reset
                </button>
            </div>

            <!-- INFO HINT -->
            <div class="bg-blue-100 text-blue-700 p-2 rounded-lg mb-3 text-sm flex items-start gap-2">
                <span class="mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                </span>


                <p class="leading-relaxed">
                    Click on an MPPT card to adjust the number of panels in series and parallel strings.
                    Each <span class="font-semibold">MPPT</span>
                    validates against max voltage (Voc) and max current (Isc) limits.
                </p>
            </div>

            <!-- WARNING -->
            <div 
                :class=" assignedPanels === totalPanels
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'"
                class="p-3 rounded-lg mb-4 text-sm"
            >

                <span v-if="assignedPanels === totalPanels" class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(100,205,138,1)"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"></path></svg>
                    Total panels assigned:
                    {{ assignedPanels }} / {{ totalPanels }}
                </span>
            
                <span v-else class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(234,113,46,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                    Total panels assigned:
                    {{ assignedPanels }} / {{ totalPanels }}
                </span>
            </div>

            <!-- MPPT CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="(mppt, index) in mppts"
                    :key="index"
                   
                     @click.stop="
        activeMppt =
            activeMppt === index
                ? null
                : index
    "

                    :class=" mppt.series > 0
                                ? (
                                    mpptStatus[index]?.voltageSafe &&
                                    mpptStatus[index]?.currentSafe
                                        ? 'border-green-300'
                                        : 'border-red-300 bg-red-50'
                                  )
                                : 'border-gray-200'
                        "

                        class="border rounded-lg p-4 cursor-pointer transition"
                    >

                    <div class="text-center mb-4">
                        
                            <p class="text-sm text-gray-500">
                                MPPT {{ index + 1 }}
                            </p>
                        
                            <p class="text-3xl font-bold">
                                {{ mppt.series * mppt.parallel }}
                            </p>
                        
                            <p class="text-sm text-gray-500">
                                panels
                            </p>
                    
                        <div class="mt-3 text-sm">
                        
                            <p>
                                {{ mppt.series }}S ×
                                {{ mppt.parallel }}P
                            </p>
                        
                        
                            <p>
                                {{ ((mppt.series * mppt.parallel) * (selectedPanel?.watt || 0)).toFixed(0) }}W
                            </p>
                        
                            <p>
                                Voc:{{( mppt.series * (selectedPanel?.voc || 0)).toFixed(1)}} V
                            </p>
                        
                            <p>
                                Isc:{{(mppt.parallel * (selectedPanel?.isc || 0)).toFixed(1)}} A
                            </p>
                        </div>

                        <div
                            v-if="!mpptStatus[index]?.voltageSafe || !mpptStatus[index]?.currentSafe"
                            class="bg-red-100 text-red-700 p-2 rounded mt-3 text-sm"
                        >

                            <span class="flex items-center gap-2 justify-center">
                            
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    fill="rgba(239,41,41,1)">
                            
                                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
                            
                                </svg>
                            
                                MPPT {{ index + 1 }}:
                                Isc ({{ (mppt.parallel * (selectedPanel?.isc || 0)).toFixed(1) }}A)
                                exceeds max
                                {{ Number(currentStatus.max).toFixed(1) }}A
                            
                            </span>
                        </div>
                    </div>

                    <div v-if="activeMppt === index">
                    <!-- INPUTS -->
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm text-gray-500">
                                    Series Panels
                                </label>
                                <div class="flex gap-2">
                                
                                    <input
                                        @click.stop
                                        type="number"
                                        v-model="mppt.series"
                                        :placeholder="`Max ${maxSeriesPanels}`"
                                        class="flex-1 border rounded px-3 py-2"
                                    />
                                    
                                    <div class="w-24 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                                        {{(mppt.series *(selectedPanel?.voc || 0)).toFixed(1)}}V
                                    </div>
                                </div>
                            </div>
                                    
                            <div>
                                <label class="text-sm text-gray-500">
                                    Parallel Strings
                                </label>
                                <div class="flex gap-2">

                                    <input
                                        @click.stop
                                        type="number"
                                        v-model="mppt.parallel"
                                        class="flex-1 border rounded px-3 py-2"
                                    />
                                    <div class="w-24 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                                        {{(mppt.parallel *(selectedPanel?.isc || 0)).toFixed(1)}}A
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-blue-100 text-blue-700 p-3 rounded-lg mt-4 text-sm">
            <div class="flex items-start gap-2">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                </span>
                <div>
                    <p class="font-semibold">
                        Max Series/MPPT:
                        {{ selectedInverter?.maxVoltagePerMppt }}V
                        (max MPPT)
                        /
                        {{ selectedPanel?.voc }}V
                        (Voc)
                        =
                        {{ maxSeriesPanels }}
                        panels
                    </p>

                    <p class="mt-1">
                        Total Panels (Step 2):
                        {{ totalPanels }} pcs
                    </p>

                    <p class="mt-1">
                        Total panels across MPPTs:
                        {{ assignedPanels }} / {{ totalPanels }}
                        from step 2
                    </p>
                </div>
            </div>
        </div>
    </div>

</template>