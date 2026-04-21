<script>
import { panels } from '../../data/panels.js';

export default {
    props: ['requiredSolar'], // from LoadAnalysis

        data() {
            return {
                mode: 'list', // list or custom

                search: '',
                results: [],
                selectedPanel: null,
                showDropdown: false,

                useSafety: true
            };
        },

        methods: {
            searchPanel() {
                if (!this.search) {
                    this.results = [];
                    return;
                }

                this.results = panels.filter(p =>
                    (p.brand + ' ' + p.model)
                        .toLowerCase()
                        .includes(this.search.toLowerCase())
                );

                this.showDropdown = true;
            },

            selectPanel(panel) {
                this.selectedPanel = panel;

                this.search = panel.brand + ' ' + panel.model;
                this.showDropdown = false;
            }
        },

        computed: {
            requiredWatts() {
                return (Number(this.requiredSolar) || 0) * 1000;
            },
            adjustedPower() {
                return this.requiredWatts * this.safetyFactor;
            },
            totalPvPower() {
                return this.panelsNeeded * this.panelWattage;
            },
            safetyFactor() {
                return this.useSafety ? 1.25 : 1;
            },
            panelWattage() {
                return this.selectedPanel?.watt || 0;
            },
            panelsNeeded() {
                if (!this.selectedPanel) return 0;
                return Math.ceil(this.adjustedPower / this.panelWattage);
            }
        },
        mounted() {
            const saved = localStorage.getItem('panelData');

            if (saved) {
                Object.assign(this.$data, JSON.parse(saved));
            }
        },
        watch: {
            $data: {
                handler(val) {
                    localStorage.setItem('panelData', JSON.stringify(val));
                },
                deep: true
            },
        }
        
    };
</script>

<template>
    <div class=" p-6">

        <!-- TITLE -->
        <h2 class="text-2xl flex items-center gap-2 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgb(150, 210, 250)"><path d="M3 3C2.44772 3 2 3.44772 2 4V8L7.5 8V3H3ZM9.5 3V8H14.5V3H9.5ZM16.5 3V8H22V4C22 3.44772 21.5523 3 21 3H16.5ZM22 10H16.5V14H22V10ZM22 16H16.5V21H21C21.5523 21 22 20.5523 22 20V16ZM14.5 21V16H9.5V21H14.5ZM7.5 21V16H2V20C2 20.5523 2.44772 21 3 21H7.5ZM2 14H7.5V10L2 10V14ZM9.5 10H14.5V14H9.5V10Z"></path></svg>
            Panel Sizing
        </h2>

        <!-- MODE SWITCH -->
        <div class="grid grid-cols-2">
            <div class="flex justify-between items-center gap-3 mb-6">
                <button
                    @click="mode = 'list'"
                    :class="mode === 'list'
                    
                    ? 'bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center'
                    : 'bg-gray-200 px-4 py-2 rounded flex items-center gap-2 w-full justify-center'"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path></svg>
                FROM LIST
                </button>

                <button
                    @click="mode = 'custom'"
                    :class="mode === 'custom'
                    ? 'bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center'
                    : 'bg-gray-200 px-4 py-2 rounded flex itemps-center gap-2 w-full justify-center'"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.13127 13.6308C1.9492 12.5349 1.95521 11.434 2.13216 10.3695C3.23337 10.3963 4.22374 9.86798 4.60865 8.93871C4.99357 8.00944 4.66685 6.93557 3.86926 6.17581C4.49685 5.29798 5.27105 4.51528 6.17471 3.86911C6.9345 4.66716 8.0087 4.99416 8.93822 4.60914C9.86774 4.22412 10.3961 3.23332 10.369 2.13176C11.4649 1.94969 12.5658 1.9557 13.6303 2.13265C13.6036 3.23385 14.1319 4.22422 15.0612 4.60914C15.9904 4.99406 17.0643 4.66733 17.8241 3.86975C18.7019 4.49734 19.4846 5.27153 20.1308 6.1752C19.3327 6.93499 19.0057 8.00919 19.3907 8.93871C19.7757 9.86823 20.7665 10.3966 21.8681 10.3695C22.0502 11.4654 22.0442 12.5663 21.8672 13.6308C20.766 13.6041 19.7756 14.1324 19.3907 15.0616C19.0058 15.9909 19.3325 17.0648 20.1301 17.8245C19.5025 18.7024 18.7283 19.4851 17.8247 20.1312C17.0649 19.3332 15.9907 19.0062 15.0612 19.3912C14.1316 19.7762 13.6033 20.767 13.6303 21.8686C12.5344 22.0507 11.4335 22.0447 10.3691 21.8677C10.3958 20.7665 9.86749 19.7761 8.93822 19.3912C8.00895 19.0063 6.93508 19.333 6.17532 20.1306C5.29749 19.503 4.51479 18.7288 3.86862 17.8252C4.66667 17.0654 4.99367 15.9912 4.60865 15.0616C4.22363 14.1321 3.23284 13.6038 2.13127 13.6308ZM11.9997 15.0002C13.6565 15.0002 14.9997 13.657 14.9997 12.0002C14.9997 10.3433 13.6565 9.00018 11.9997 9.00018C10.3428 9.00018 8.99969 10.3433 8.99969 12.0002C8.99969 13.657 10.3428 15.0002 11.9997 15.0002Z"></path></svg>
                CUSTOM
                </button>
            </div>
        </div>

        <!-- PANEL INPUT -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <!-- SEARCH (ONLY IN LIST MODE) -->
            <div v-if="mode === 'list'" class="mb-4 relative">
            
                <label class="text-sm text-gray-500">Search Solar Panel</label>
                
                <input
                    v-model="search"
                    @input="searchPanel"
                    placeholder="e.g. Jinko 550W"
                    class="w-full border rounded px-3 py-2"
                />
            
            <!-- DROPDOWN -->
                <div
                    v-if="showDropdown && results.length"
                    class="absolute w-full bg-white border rounded mt-1 max-h-48 overflow-y-auto z-10"
                    >
                    <div
                        v-for="panel in results"
                        :key="panel.model"
                        @click="selectPanel(panel)"
                        class="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                        <p class="font-medium">
                            {{ panel.brand }} {{ panel.model }}
                        </p>
                        <p class="text-xs text-gray-500">
                            {{ panel.watt }}W • {{ panel.efficiency }}%
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="mode === 'list' && selectedPanel" class="mt-4 border rounded-lg p-4 bg-gray-50">

            <h3 class="font-semibold mb-3 text-gray-700">
                Panel Specifications
            </h3>
        
            <div class="grid grid-cols-2 gap-y-2 text-sm">
            
                <span class="text-gray-500">Wattage</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.watt }} W
                </span>
            
                <span class="text-gray-500">Voc (Open-Circuit Voltage)</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.voc }} V
                </span>
            
                <span class="text-gray-500">Vmp (Voltage at Max Power)</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.vmp }} V
                </span>

                <span class="text-gray-500">Isc (Short-Circuit Current)</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.isc }} A
                </span>

                <span class="text-gray-500">Imp (Current at Max Power)</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.imp }} A
                </span>
            
                <span class="text-gray-500">Efficiency</span>
                <span class="text-right font-medium">
                    {{ selectedPanel.efficiency }} %
                </span>
            </div>
        </div>

        <div v-if="mode === 'custom'" class="mt-4 p-4 border rounded text-gray-400 text-center">
            Panel Custom specs coming soon...
        </div>

        <label class="flex items-center gap-3 mb-2 cursor-pointer mt-4">

            <!-- TOGGLE -->
            <div class="relative">
                <input
                    type="checkbox"
                    v-model="useSafety"
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
                Safety Factor (1.25)
            </span>

        </label>

        <!-- RESULT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

        <!-- Required Power -->
            <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Required PV Power</p>
                    <p class="text-xl font-bold">
                        {{ adjustedPower.toFixed(0) }} W
                    </p>
                </div>
            
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
                </div>
            </div>

            <!-- Panels Needed -->
            <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Panels Needed</p>
                    <p class="text-xl font-bold">
                        {{ panelsNeeded }} pcs
                    </p>
                </div>
            
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M3 3C2.44772 3 2 3.44772 2 4V8L7.5 8V3H3ZM9.5 3V8H14.5V3H9.5ZM16.5 3V8H22V4C22 3.44772 21.5523 3 21 3H16.5ZM22 10H16.5V14H22V10ZM22 16H16.5V21H21C21.5523 21 22 20.5523 22 20V16ZM14.5 21V16H9.5V21H14.5ZM7.5 21V16H2V20C2 20.5523 2.44772 21 3 21H7.5ZM2 14H7.5V10L2 10V14ZM9.5 10H14.5V14H9.5V10Z"></path></svg>
                </div>
            </div>

        <!-- Total Power -->
            <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Total PV Power</p>
                    <p class="text-xl font-bold">
                        {{ totalPvPower }} W
                    </p>
                </div>
            
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M12.3389 2.0088L12 4.00001C8.68631 4.00001 6.00003 6.68633 6 10C6 11.3842 6.46775 12.6914 7.31445 13.7481C7.39984 13.8546 8.12027 14.6007 8.23145 14.7217C9.22754 15.8063 9.84058 16.7984 9.97266 18H14.0273C14.1594 16.7985 14.7721 15.8065 15.7676 14.7227C15.8796 14.6007 16.5977 13.857 16.6836 13.75C17.5313 12.693 18 11.385 18 10L19.9902 9.66017C19.9949 9.77288 20 9.88614 20 10C20 11.8924 19.3426 13.6312 18.2441 15.001C17.6238 15.7744 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C7.99996 17 6.37453 15.7734 5.75391 14.999C4.65647 13.6296 4 11.8915 4 10C4.00003 5.58176 7.58174 2.00001 12 2.00001C12.1135 2.00001 12.2265 2.00411 12.3389 2.0088ZM10 21H14V20H10V21ZM17.5293 0.328369C17.7059 -0.0974062 18.2942 -0.0974181 18.4707 0.328369L18.7236 0.939698C19.1556 1.98249 19.9616 2.81521 20.9746 3.26587L21.6924 3.58521C22.1026 3.76803 22.1026 4.36522 21.6924 4.5481L20.9326 4.88599C19.9449 5.32526 19.1534 6.12849 18.7139 7.13696L18.4668 7.70239C18.2864 8.11652 17.7137 8.11652 17.5332 7.70239L17.2871 7.13696C16.8476 6.12833 16.0552 5.32531 15.0674 4.88599L14.3076 4.5481C13.8975 4.36524 13.8974 3.76801 14.3076 3.58521L15.0254 3.26587C16.0385 2.81521 16.8445 1.9825 17.2764 0.939698L17.5293 0.328369Z"></path></svg>
                </div>
            </div>
        </div>

        <!-- FORMULA -->
        <div class="py-4 text-sm text-blue-600">
            <div class="flex items-center justify-start gap-2 font-semibold bg-blue-100 p-1 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>
                <span class="flex items-center gap-1">
                    <h1 class="font-bold">Formula:</h1>
                    
                    PV Power =
                    ({{ (requiredWatts).toFixed(0) }} W ÷ {{ sunHours || 4 }}h)
                    = {{ requiredWatts.toFixed(0) }} W
                    |
                    Panels =
                    {{ adjustedPower.toFixed(0) }} W ÷ {{ panelWattage }} W
                    = 
                    <h1 class="font-bold">{{ panelsNeeded }} pcs</h1>
                </span>
            </div>
        </div>
    </div>
</template>

