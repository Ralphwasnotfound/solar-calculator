<script>

export default {

    data() {

        return {

            pvToInverter: 10,
            batteryToInverter: 2,
            inverterToLoad: 15,

            voltageDrop: 3,

            sections: [

                {
                    name: 'PV to Inverter',
                    current: 13.9,
                    voltage: 435.7,
                    distance: 10,
                    vdi: 0.3,
                    awg: 14,
                    mm: 2.08
                },

                {
                    name: 'Battery to Inverter',
                    current: 185.2,
                    voltage: 48,
                    distance: 2,
                    vdi: 8.4,
                    awg: 6,
                    mm: 13.3
                },

                {
                    name: 'Inverter to Load',
                    current: 36.4,
                    voltage: 220,
                    distance: 15,
                    vdi: 2.7,
                    awg: 10,
                    mm: 5.26
                }

            ]

        }

    }

}

</script>

<template>

<div class="bg-white p-6 rounded-xl shadow">

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

    <div class="overflow-x-auto mb-6">

        <table class="w-full border-collapse">

            <thead>

                <tr class="border-b text-left text-gray-500">

                    <th class="py-3">
                        Section
                    </th>

                    <th class="py-3">
                        Current (A)
                    </th>

                    <th class="py-3">
                        Voltage (V)
                    </th>

                    <th class="py-3">
                        Distance (m)
                    </th>

                    <th class="py-3">
                        VDI
                    </th>

                    <th class="py-3">
                        Wire (AWG)
                    </th>

                    <th class="py-3">
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

                    <td class="py-4">
                        {{ section.name }}
                    </td>

                    <td>
                        {{ section.current }}
                    </td>

                    <td>
                        {{ section.voltage }}
                    </td>

                    <td>
                        {{ section.distance }}
                    </td>

                    <td>
                        {{ section.vdi }}
                    </td>

                    <td class="font-semibold">
                        {{ section.awg }}
                    </td>

                    <td>
                        {{ section.mm }}
                    </td>

                </tr>

            </tbody>

        </table>

    </div>

    <!-- FORMULA -->

    <div
        class="bg-blue-100 text-blue-700 p-3 rounded-lg text-sm"
    >

        <p class="font-semibold flex items-center gap-2">

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
            >
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>

            VDI Formula:

            VDI =
            (Current × Distance_ft)
            /
            (% Voltage Drop × Voltage)

            → lookup AWG from table

        </p>

    </div>

</div>

</template>