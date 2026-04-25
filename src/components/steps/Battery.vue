<script>
import { handleError } from 'vue';
import { batteries } from '../../data/batteries.js';

export default {
    props: [
        'dailyWh',

        'selectedInverter'
    ],
    
    data() {
        return {

            batteries,

            selectedBattery: null,

            autonomyDays: 1,

            autonomyValue: 12,

            autonomyType: 'hours',

            dod: 0.9,
            
        }
    },
    computed: {
        autonomyDaysComputed() {
            if (this.autonomyType ==='hours') {
                return this.autonomyValue / 24
            }
            return this.autonomyValue
        },
        requiredCapacity() {
            if (
                !this.selectedBattery || 
                !this.dailyWh
            ) return 0

            return Math.round(
                (
                    this.autonomyType === 'hours'

                    ? (
                        this.dailyWh / 24
                    ) * this.autonomyValue

                    : this.dailyWh * this.autonomyValue
                )

                /

                (
                    this.dod *
                    parseInt(this.selectedInverter?.voltage)
                )
            )
        },

        batteriesNeeded() {
            if (
                !this.selectedBattery
            ) return 0

            return Math.ceil(
                this.requiredCapacity / 
                this.selectedBattery.capacityAh
            )
        }
    },
    mounted() {
        const savedBattery =
            localStorage.getItem('batteryData')

        if (savedBattery) {
            Object.assign(
                this.$data,
                JSON.parse(savedBattery)
            )
        }
    },
    watch: {
        $data: {
            handler(value) {
                localStorage.setItem(
                    'batteryData',
                    JSON.stringify(value)
                )
            },
            deep:true
        }
    }

}
</script>

<template>

<div>

    <!-- TITLE -->
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(100,205,138,1)"><path d="M13 12H16L11 19V14H8L13 7V12ZM11 6H7V20H17V6H13V4H11V6ZM9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H18C18.5523 4 19 4.44772 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 4.44772 5.44772 4 6 4H9Z"></path></svg>
        Battery Sizing
    </h2>

    <!-- TOGGLE -->
    <div class="flex items-center gap-3 mb-6">

        <label class="relative inline-flex items-center cursor-pointer">

            <input type="checkbox" class="sr-only peer">

            <div
                class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500
                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:border after:rounded-full after:h-5 after:w-5
                after:transition-all peer-checked:after:translate-x-full">
            </div>

        </label>

        <span class="text-gray-700 font-medium">
            Use Custom Battery
        </span>

    </div>

    <!-- INPUTS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <!-- BATTERY SELECT -->
        <div>

            <label class="block text-sm text-gray-500 mb-2">
                Select Battery
            </label>

            <select
                v-model="selectedBattery"
                class="w-full border rounded-lg px-4 py-3"
            >

                <option :value="null">
                    Select Battery
                </option>

                <option
                    v-for="battery in batteries"
                    :key="battery.energyWh"
                    :value="battery"
                >

                    {{ battery.brand }}

                    {{ battery.voltage }}V

                    {{ battery.capacityAh }}Ah

                    ({{ battery.energyWh }}Wh)

                </option>

            </select>

        </div>

        <!-- AUTONOMY -->

        <div>
        
            <label class="block text-sm text-gray-500 mb-2">
                Autonomy
            </label>
        
            <div class="flex">
            
                <!-- INPUT -->
            
                <input
                    v-model="autonomyValue"
                    type="number"
                    class="w-full border border-gray-300 rounded-l-lg px-4 py-3"
                >
            
                <!-- DAYS BUTTON -->
            
                <button
                    @click="autonomyType = 'days';
                            autonomyValue = 1; "
                            
                    type="button"
                    :class="
                        autonomyType === 'days'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                    "

                    class="px-4 text-sm font-semibold border-t border-b border-gray-300"
                >
                    DAYS
                </button>
            
                <!-- HOURS BUTTON -->
            
                <button
                    @click="autonomyType = 'hours';
                            autonomyValue= 12; "
                    type="button"
                    :class="
                        autonomyType === 'hours'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                    "

                    class="px-4 text-sm font-semibold border rounded-r-lg border-gray-300"
                >
                    HRS
                </button>
            
            </div>
        
        </div>

    </div>

    <!-- BATTERY SPECS -->

    <!-- BATTERY SPECIFICATIONS -->

    <div
        v-if="selectedBattery"
        class="border rounded-lg p-5 mb-6"
    >

        <h3 class="font-semibold mb-4 flex items-center gap-2">

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="rgba(173,184,194,1)"><path d="M13 12H16L11 19V14H8L13 7V12ZM11 6H7V20H17V6H13V4H11V6ZM9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H18C18.5523 4 19 4.44772 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 4.44772 5.44772 4 6 4H9Z"></path></svg>
            Battery Specifications

        </h3>

        <div class="space-y-4 text-sm">

            <!-- BRAND -->
            <div class="flex justify-between border-b pb-2">

                <span class="text-gray-500">
                    Brand
                </span>

                <span class="font-medium">
                    {{ selectedBattery.brand }}
                </span>

            </div>

            <!-- MODEL -->
            <div class="flex justify-between border-b pb-2">

                <span class="text-gray-500">
                    Model
                </span>

                <span class="font-medium">

                    {{ selectedBattery.voltage }}V

                    {{ selectedBattery.capacityAh }}Ah

                </span>

            </div>

            <!-- VOLTAGE -->
            <div class="flex justify-between border-b pb-2">

                <span class="text-gray-500">
                    Voltage
                </span>

                <span class="font-medium">
                    {{ selectedBattery.voltage }}V
                </span>

            </div>

            <!-- CAPACITY -->
            <div class="flex justify-between border-b pb-2">

                <span class="text-gray-500">
                    Capacity
                </span>

                <span class="font-medium">

                    {{ selectedBattery.capacityAh }}Ah

                    ({{ selectedBattery.energyWh }}Wh)

                </span>

            </div>

            <!-- DOD -->
            <div class="flex justify-between">

                <span class="text-gray-500">
                    DOD
                </span>

                <span class="font-medium">
                    90%
                </span>

            </div>
        </div>
    </div>

    <div
        v-if="!selectedBattery"
        class="border-2 border-gray-300 rounded-xl p-10 text-center mb-6"
    >

        <h3 class="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="rgba(173,184,194,1)"><path d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H18C18.5523 4 19 4.44772 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 4.44772 5.44772 4 6 4H9ZM13 12V7L8 14H11V19L16 12H13Z"></path></svg>
            No Battery Selected
        </h3>

        <p class="text-gray-400">
            Select a battery to calculate
            required capacity, bank voltage,
            and battery configuration.
        </p>

    </div>

    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <!-- SYSTEM VOLTAGE -->
        <div class="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-2">
                    System Voltage
                </p>

                <h3 class="text-3xl font-bold text-blue-700">
                    {{ selectedInverter?.voltage?.replace('V', ' V') }}
                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(38,95,166,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
            </div>
        </div>

        <!-- REQUIRED CAPACITY -->
        <div class="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-2">
                    Required Capacity
                </p>

                <h3 class="text-3xl font-bold text-orange-600">
                    {{ requiredCapacity }} Ah
                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(234,113,46,1)"><path d="M7.05025 8.04673L12 3.09698L16.9497 8.04673C19.6834 10.7804 19.6834 15.2126 16.9497 17.9462C14.2161 20.6799 9.78392 20.6799 7.05025 17.9462C4.31658 15.2126 4.31658 10.7804 7.05025 8.04673ZM18.364 6.63252L12 0.268555L5.63604 6.63252C2.12132 10.1472 2.12132 15.8457 5.63604 19.3604C9.15076 22.8752 14.8492 22.8752 18.364 19.3604C21.8787 15.8457 21.8787 10.1472 18.364 6.63252ZM16.2427 10.1714L14.8285 8.75718L7.7574 15.8282L9.17161 17.2425L16.2427 10.1714ZM8.11095 11.232C8.69674 11.8178 9.64648 11.8178 10.2323 11.232C10.8181 10.6463 10.8181 9.69652 10.2323 9.11073C9.64648 8.52494 8.69674 8.52494 8.11095 9.11073C7.52516 9.69652 7.52516 10.6463 8.11095 11.232ZM15.8891 16.8889C15.3033 17.4747 14.3536 17.4747 13.7678 16.8889C13.182 16.3031 13.182 15.3534 13.7678 14.7676C14.3536 14.1818 15.3033 14.1818 15.8891 14.7676C16.4749 15.3534 16.4749 16.3031 15.8891 16.8889Z"></path></svg>
            </div>
        </div>

        <!-- BATTERIES NEEDED -->
        <div class="bg-blue-50 p-4 rounded-lg flex items-center justify-between">

            <div>
                <p class="text-sm text-gray-500 mb-2">
                    Batteries Needed
                </p>

                <h3 class="text-3xl font-bold text-blue-700">
                    {{ batteriesNeeded }} pcs
                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(38,95,166,1)"><path d="M14 2C14.5523 2 15 2.44772 15 3V4H18C18.5523 4 19 4.44772 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 4.44772 5.44772 4 6 4H9V3C9 2.44772 9.44772 2 10 2H14ZM13 4H11V6H7V20H17V6H13V4ZM13 9V12H16V14H13V17H11V14H8V12H11V9H13Z"></path></svg>
            </div>
        </div>

    </div>

    <!-- SECOND ROW -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <!-- BANK VOLTAGE -->
        <div class="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-2">
                    Bank Voltage
                </p>

                <h3 class="text-3xl font-bold text-blue-700">

                    {{
                        selectedBattery
                            ? `${Math.round(selectedBattery.voltage)} V`
                            : selectedInverter?.voltage
                    }}

                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(38,95,166,1)"><path d="M12.3389 2.0088L12 4.00001C8.68631 4.00001 6.00003 6.68633 6 10C6 11.3842 6.46775 12.6914 7.31445 13.7481C7.39984 13.8546 8.12027 14.6007 8.23145 14.7217C9.22754 15.8063 9.84058 16.7984 9.97266 18H14.0273C14.1594 16.7985 14.7721 15.8065 15.7676 14.7227C15.8796 14.6007 16.5977 13.857 16.6836 13.75C17.5313 12.693 18 11.385 18 10L19.9902 9.66017C19.9949 9.77288 20 9.88614 20 10C20 11.8924 19.3426 13.6312 18.2441 15.001C17.6238 15.7744 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C7.99996 17 6.37453 15.7734 5.75391 14.999C4.65647 13.6296 4 11.8915 4 10C4.00003 5.58176 7.58174 2.00001 12 2.00001C12.1135 2.00001 12.2265 2.00411 12.3389 2.0088ZM10 21H14V20H10V21ZM17.5293 0.328369C17.7059 -0.0974062 18.2942 -0.0974181 18.4707 0.328369L18.7236 0.939698C19.1556 1.98249 19.9616 2.81521 20.9746 3.26587L21.6924 3.58521C22.1026 3.76803 22.1026 4.36522 21.6924 4.5481L20.9326 4.88599C19.9449 5.32526 19.1534 6.12849 18.7139 7.13696L18.4668 7.70239C18.2864 8.11652 17.7137 8.11652 17.5332 7.70239L17.2871 7.13696C16.8476 6.12833 16.0552 5.32531 15.0674 4.88599L14.3076 4.5481C13.8975 4.36524 13.8974 3.76801 14.3076 3.58521L15.0254 3.26587C16.0385 2.81521 16.8445 1.9825 17.2764 0.939698L17.5293 0.328369Z"></path></svg>
            </div>

        </div>

        <!-- TOTAL CAPACITY -->
        <div class="bg-cyan-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-2">
                    Total Capacity
                </p>

                <h3 class="text-3xl font-bold text-cyan-600">
                    {{ batteriesNeeded * (selectedBattery?.capacityAh || 0) }} Ah
                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(100,205,138,1)"><path d="M12.0049 3.10321L7.05514 8.05295C4.32147 10.7866 4.32147 15.2188 7.05514 17.9524C9.78881 20.6861 14.221 20.6861 16.9546 17.9524C19.6883 15.2188 19.6883 10.7866 16.9546 8.05296L12.0049 3.10321ZM12.0049 0.27478L18.3688 6.63874C21.8836 10.1535 21.8836 15.8519 18.3688 19.3667C14.8541 22.8814 9.15564 22.8814 5.64092 19.3667C2.1262 15.8519 2.1262 10.1535 5.64092 6.63874L12.0049 0.27478ZM13.0049 11.0027H15.5049L11.0049 17.5027V13.0027H8.50488L13.0049 6.5027V11.0027Z"></path></svg>
            </div>

        </div>

        <!-- TOTAL ENERGY -->
        <div class="bg-green-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 mb-2">
                    Total Energy
                </p>

                <h3 class="text-3xl font-bold text-green-600">
                    {{ batteriesNeeded * (selectedBattery?.energyWh || 0) }} Wh
                </h3>
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(100,205,138,1)"><path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path></svg>
            </div>
        </div>

    </div>

    <div v-if="selectedBattery" class="bg-blue-100 text-blue-700 p-2 rounded-lg text-sm">

        <p class="font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
            
        Battery Configuration:

        1S{{ batteriesNeeded }}P

        (1 in series × {{ batteriesNeeded }} in parallel)

        = {{ batteriesNeeded }} batteries total
        </p>

    </div>

    <!-- FORMULA INFO -->
    <div class="pt-2">
        <div class="bg-blue-100 text-blue-700 p-2 rounded-lg text-sm">
            <p class="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
                Formula:
                Capacity =
                ({{ Math.round(dailyWh) }}Wh × {{ autonomyValue }} {{ autonomyType === 'days' ? 'd' : 'hrs' }})
                /
                ({{ dod }} DOD × {{ selectedInverter?.voltage?.replace('V', ' V') }})
                = {{ requiredCapacity }} Ah
            </p>
        </div>
    </div>
</div>

</template>