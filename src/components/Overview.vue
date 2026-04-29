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
                            12920 Wh
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b">
                        <span>Sun Peak Hours</span>
                        <span class="font-semibold">
                            4 hrs
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2">
                        <span>Required PV Power</span>
                        <span class="font-semibold">
                            3230 W
                        </span>
                    </div>
                </div>
                
                <div class="border rounded-xl p-4">

                    <div class="flex justify-between py-2 border-b">
                        <span>Total PV Power</span>
                        <span class="font-semibold">
                            3600 W
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b">
                        <span>Total Panels</span>
                        <span class="font-semibold">
                            9
                        </span>
                    </div>
                    
                    <div class="flex justify-between py-2">
                        <span>Panel Model</span>
                        <span class="font-semibold">
                            Jinko Tiger Neo 400W
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
                        14
                    </span>
                </div>
                
                <div class="flex justify-between py-2 border-b">
                    <span>Parallel Strings</span>
                    <span class="font-semibold">
                        1
                    </span>
                </div>
                
                <div class="flex justify-between py-2 border-b">
                    <span>String Voltage</span>
                    <span class="font-semibold">
                        521.4V
                    </span>
                </div>
                
                <div class="flex justify-between py-2">
                    <span>String Current</span>
                    <span class="font-semibold">
                        13.9A
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
                                Deye SUN-8K-SG04LP3
                            </span>
                        </div>
                    
                        <div class="flex justify-between py-2 border-b">
                            <span>Power</span>
                            <span class="font-semibold">
                                8000W
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2 border-b">
                            <span>Phase</span>
                            <span class="font-semibold">
                                three
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2">
                            <span>AC Voltage</span>
                            <span class="font-semibold">
                                400V
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
                                48V
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2 border-b">
                            <span>Battery Count</span>
                            <span class="font-semibold">
                                2
                            </span>
                        </div>
                        
                        <div class="flex justify-between py-2">
                            <span>Total Capacity</span>
                            <span class="font-semibold">
                                10240 Wh
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
                                AWG 14 (2.08mm²)
                            </td>
                            
                            <td>
                                20m
                            </td>
                        
                        </tr>
                        
                        <tr class="border-b">

                            <td class="py-3">
                                Battery Wire
                            </td>
                            
                            <td>
                                AWG 8 (8.37mm²)
                            </td>
                            
                            <td>
                                2m
                            </td>
                        
                        </tr>
                        
                        <tr>

                            <td class="py-3">
                                AC Wire
                            </td>
                            
                            <td>
                                AWG 10 (5.26mm²)
                            </td>
                            
                            <td>
                                40m
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
                        20A DC
                    </span>
                </div>
            
                <div class="flex justify-between py-2 border-b">
                    <span>Battery DC MCCB</span>
                    <span class="font-semibold">
                        250A DC
                    </span>
                    </div>
                
                <div class="flex justify-between py-2">
                    <span>AC Breaker</span>
                    <span class="font-semibold">
                        25A AC
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
                                9
                            </td>
                            
                            <td>
                                Jinko Tiger Neo 400W
                            </td>
                        
                        </tr>
                    
                        <tr class="border-b">
                            
                            <td class="py-3">
                                Hybrid Inverter
                            </td>
                            
                            <td>
                                1
                            </td>
                            
                            <td>
                                Deye SUN-8K-SG04LP3
                            </td>
                        
                        </tr>
                    
                        <tr class="border-b">
                            
                            <td class="py-3">
                                Batteries
                            </td>
                            
                            <td>
                                2
                            </td>
                            
                            <td>
                                LiFePO4 48V 100Ah
                            </td>
                            
                        </tr>
                    
                        <tr>
                            
                            <td class="py-3">
                                AC Breaker
                            </td>
                        
                            <td>
                                1
                            </td>
                        
                            <td>
                                25A AC
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</template>