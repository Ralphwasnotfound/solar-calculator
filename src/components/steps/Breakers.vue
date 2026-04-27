<script>

export default {

    props: {
        selectedPanel: Object,
        selectedInverter: Object,
        seriesPanels: Number,
        parallelStrings: Number,
        acVoltage: Number,
    },

    methods: {

        getBreakerSize(current) {
            if (!current || isNaN(current)) {
                return null
            }
            const calculated =
                current * 1.25

            const standardSizes = [
        
                6,
                10,
                15,
                20,
                25,
                32,
                40,
                50,
                63,
                80,
                100,
                125,
                150,
                200,
                225,
                250
            ]
        
            return standardSizes.find(
                size => size >= calculated
            ) || calculated
        }
    },

    computed: {

        calculations() {
        
            const pvCurrent =
                (this.selectedPanel?.isc || 0)
                *
                this.parallelStrings
        
            const pvBreaker =
                this.getBreakerSize(
                    pvCurrent
                )
        
            const batteryVoltage =
                parseInt(
                    this.selectedInverter?.voltage
                )
        
            const inverterPower =
                parseInt(
                    this.selectedInverter?.power
                )
        
            const batteryCurrent =
                inverterPower
                /
                (
                    batteryVoltage
                    * 0.9
                )
        
            const batteryBreaker =
                this.getBreakerSize(
                    batteryCurrent
                )
        
            const acCurrent =
                inverterPower
                /
                this.acVoltage
        
            const acBreaker =
                this.getBreakerSize(
                    acCurrent
                )
        
            return {
            
                pvCurrent,
                pvBreaker,
            
                batteryCurrent,
                batteryBreaker,
            
                acCurrent,
                acBreaker
            }
        },

        sections() {

            return [
                {
                    name: 'PV DC Breaker',
                    current:this.calculations.pvCurrent,
                    safety:this.calculations.pvCurrent * 1.25,
                    breaker:this.calculations.pvBreaker,
                    type: 'DC',
                    voltage:this.selectedPanel?.voc
                            ? `${Math.round(
                                this.selectedPanel.voc
                                *
                                this.seriesPanels
                            )}V DC`
                            : '-'
                },
                {
                    name: 'Battery DC MCCB',
                    current:this.calculations.batteryCurrent,
                    safety:this.calculations.batteryCurrent * 1.25,
                    breaker:this.calculations.batteryBreaker,
                    type: 'DC',
                    voltage:this.selectedInverter?.voltage
                            ? `${this.selectedInverter.voltage} DC`
                            : '-'
                },
                {
                    name: 'AC Breaker',
                    current:this.calculations.acCurrent,
                    safety:this.calculations.acCurrent * 1.25,
                    breaker:this.calculations.acBreaker,
                    type: 'AC',
                    voltage:this.acVoltage
                            ? `${this.acVoltage}V AC`
                            : '-'
                }
            ]
        }
    },
}

</script>

<template>

<div class="space-y-6">

    <!-- TITLE -->

    <div>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M7 5V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7ZM17 13V10H15V13H9V10H7V13H4V19H20V13H17ZM9 3V5H15V3H9Z"></path></svg>

            Breaker Sizing

        </h2>

    </div>

    <!-- BREAKER TABLE -->

    <div class="bg-white p-6 rounded-xl shadow">

        <div class="overflow-x-auto">

            <table class="w-full border-collapse">

                <thead>

                    <tr class="border-b text-left text-gray-500">

                        <th class="py-3">
                            Breaker
                        </th>

                        <th class="py-3">
                            Current (A)
                        </th>

                        <th class="py-3">
                            × 1.25
                        </th>

                        <th class="py-3">
                            Breaker Size (A)
                        </th>

                        <th class="py-3">
                            Type
                        </th>

                        <th class="py-3">
                            Voltage Rating
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <!-- PV -->

                    <tr 
                    v-for="section in sections"
                    :key="section.name"
                    class="border-b">

                        <td class="py-4">
                            {{ section.name }}
                        </td>

                        <td>
                            {{
                                !section.current
                                ||
                                isNaN(section.current)
                                    ? '-'
                                    : Number(
                                        section.current
                                    ).toFixed(1)
                            }}
                        </td>

                        <td>
                            {{
                                !section.safety
                                ||
                                isNaN(section.safety)
                                    ? '-'
                                    : Number(
                                        section.safety
                                    ).toFixed(1)
                            }}
                        </td>

                        <td>
                            {{
                                !section.breaker
                                ||
                                isNaN(section.breaker)
                                    ? '-'
                                    : `${section.breaker}A`
                            }}
                        </td>

                        <td>
                            <span
                                class="px-3 py-1 rounded-full text-xs font-semibold"
                                :class="
                                    section.type === 'DC'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-blue-100 text-blue-600'
                                        ">
                                {{ section.type }}
                            </span>
                        </td>

                        <td>
                            {{
                                !section.voltage
                                ||
                                section.voltage.includes(
                                    'undefined'
                                )
                                ||
                                section.voltage.includes(
                                    'NaN'
                                )
                                ||
                                section.voltage === '0V DC'
                            
                                    ? '-'
                            
                                    : section.voltage
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- FORMULA -->

    <div
        class="bg-blue-100 text-blue-700 p-2 rounded-xl text-sm font-semibold flex items-center gap-2"
    >

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>

        Formula:

        AC Breaker = Inverter Rating ÷

        {{ acVoltage || '-' }}V

        × 1.25 safety factor
        <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="16" fill="rgb(29, 78, 216)"><path d="M1.99974 12.9999L1.9996 11L15.5858 11V5.58582L22 12L15.5858 18.4142V13L1.99974 12.9999Z"></path></svg>
        </span>
        round up to standard size

    </div>

    <!-- WARNING -->

    <div
        class="bg-orange-100 text-orange-700 p-2 rounded-xl text-sm font-semibold flex items-center gap-2"
    >

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(234,113,46,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>

        Use DC-rated breakers for PV and battery circuits.
        Never use AC breakers for DC applications.

    </div>

    <!-- OPTIONAL COMPONENTS -->

    <div>

        <h3 class="text-lg font-bold mb-6 flex items-center gap-2">

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="rgba(70,146,221,1)"><path d="M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM16.4524 8.22183L11.5019 13.1709L8.67421 10.3431L7.25999 11.7574L11.5026 16L17.8666 9.63604L16.4524 8.22183Z"></path></svg>

            Optional Protection Components

        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- DC SPD -->

            <div class="border rounded-xl p-4">

                <h4 class="font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(240,187,64,1)"><path d="M13 9H21L11 24V15H4L13 0V9ZM11 11V7.22063L7.53238 13H13V17.3944L17.263 11H11Z"></path></svg>
                    DC Surge Protection Device (SPD)
                </h4>

                <div class="space-y-2 text-sm">

                    <div class="flex justify-between">
                        <span>Location</span>
                        <span>PV Array → Inverter DC Input</span>
                    </div>

                    <div class="flex justify-between">
                        <span>Type</span>
                        <span>Type II DC SPD</span>
                    </div>

                    <div class="flex justify-between">
                        <span>Voltage Rating</span>
                        <span class="text-blue-500">
                        {{
                            selectedPanel?.voc
                                ? `${Math.round(
                                    selectedPanel.voc
                                    *
                                    seriesPanels
                                )}V DC`
                                : '-'
                        }}

                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Purpose</span>
                        <span>Lightning & surge protection</span>
                    </div>

                </div>

            </div>

            <!-- AC SPD -->

            <div class="border rounded-xl p-4">

                <h4 class="font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(234,113,46,1)"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path></svg>
                    AC Surge Protection Device (SPD)
                </h4>

                <div class="space-y-2 text-sm">

                    <div class="flex justify-between">
                        <span>Location</span>
                        <span>Inverter AC Output / Main Panel</span>
                    </div>

                    <div class="flex justify-between">
                        <span>Type</span>
                        <span>Type II AC SPD</span>
                    </div>

                    <div class="flex justify-between">
                        <span>Voltage Rating</span>
                        <span class="text-blue-500">
                        {{
                            acVoltage
                                ? `${Math.round(
                                    acVoltage * 1.2
                                )}V AC`
                                : '-'
                        }}

                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Purpose</span>
                        <span>Grid surge & transit protection</span>
                    </div>

                </div>

            </div>

            <!-- ATS -->

            <div class="border rounded-xl p-4">

                <h4 class="font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
                    Automatic Transfer Switch (ATS)
                </h4>

                <div class="space-y-2 text-sm">

                    <div class="flex justify-between">
                        <span>Location</span>
                        <span>Between inverter & grid</span>
                    </div>

                    <div class="flex justify-between">
                        <span>Rating</span>
                        <span class="text-blue-500">
                        {{
                            calculations.acBreaker
                                ? `${calculations.acBreaker}A`
                                : '-'
                        }}

                        ,

                        {{
                            acVoltage
                                ? `${acVoltage}V AC`
                                : '-'
                        }}

                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Poles</span>
                        <span>
                            {{
                                !selectedInverter?.phase
                                    ? '-'
                                    : selectedInverter.phase === 'three'
                                        ? '4P (three phase)'
                                        : '2P (single phase)'
                            }}
                            </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Purpose</span>
                        <span>Auto switch between solar & grid/genset</span>
                    </div>

                </div>

            </div>

            <!-- ISOLATOR -->

            <div class="border rounded-xl p-4">

                <h4 class="font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(100,205,138,1)"><path d="M12.3389 2.0088L12 4.00001C8.68631 4.00001 6.00003 6.68633 6 10C6 11.3842 6.46775 12.6914 7.31445 13.7481C7.39984 13.8546 8.12027 14.6007 8.23145 14.7217C9.22754 15.8063 9.84058 16.7984 9.97266 18H14.0273C14.1594 16.7985 14.7721 15.8065 15.7676 14.7227C15.8796 14.6007 16.5977 13.857 16.6836 13.75C17.5313 12.693 18 11.385 18 10L19.9902 9.66017C19.9949 9.77288 20 9.88614 20 10C20 11.8924 19.3426 13.6312 18.2441 15.001C17.6238 15.7744 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C7.99996 17 6.37453 15.7734 5.75391 14.999C4.65647 13.6296 4 11.8915 4 10C4.00003 5.58176 7.58174 2.00001 12 2.00001C12.1135 2.00001 12.2265 2.00411 12.3389 2.0088ZM10 21H14V20H10V21ZM17.5293 0.328369C17.7059 -0.0974062 18.2942 -0.0974181 18.4707 0.328369L18.7236 0.939698C19.1556 1.98249 19.9616 2.81521 20.9746 3.26587L21.6924 3.58521C22.1026 3.76803 22.1026 4.36522 21.6924 4.5481L20.9326 4.88599C19.9449 5.32526 19.1534 6.12849 18.7139 7.13696L18.4668 7.70239C18.2864 8.11652 17.7137 8.11652 17.5332 7.70239L17.2871 7.13696C16.8476 6.12833 16.0552 5.32531 15.0674 4.88599L14.3076 4.5481C13.8975 4.36524 13.8974 3.76801 14.3076 3.58521L15.0254 3.26587C16.0385 2.81521 16.8445 1.9825 17.2764 0.939698L17.5293 0.328369Z"></path></svg>
                    DC Isolator / Disconnect
                </h4>

                <div class="space-y-2 text-sm">

                    <div class="flex justify-between">
                        <span>Location</span>
                        <span>PV array & battery to inverter</span>
                    </div>

                    <div class="flex justify-between">
                        <span>PV Isolator</span>
                        <span class="text-blue-500">
                        {{
                            calculations.pvBreaker
                                ? `${calculations.pvBreaker}A`
                                : '-'
                        }}

                        ,

                        {{
                            selectedPanel?.voc
                        
                                ? `${Math.round(
                                    selectedPanel.voc
                                    *
                                    seriesPanels
                                )}V DC`
                        
                                : '-'
                        }}

                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Battery Isolator</span>
                        <span class="text-blue-500">

                            {{
                                !isNaN(calculations.batteryCurrent)
                                    ? `${Math.ceil(
                                        calculations.batteryCurrent * 1.25
                                    )}A`
                                    : '-'
                            }}

                            ,
                        
                            {{
                                selectedInverter?.voltage
                                    ? `${selectedInverter.voltage} DC`
                                    : '-'
                            }}

                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span>Purpose</span>
                        <span>Safe manua disconnect for maintenance</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div
        class="bg-blue-100 text-blue-700 p-2 rounded-xl text-sm font-semibold flex items-center gap-2"
    >

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg>
        These components are highly recommended for safety and code compliance, even if not strictly required by all jurisdictions
    </div>
</div>

</template>



