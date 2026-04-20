<script>
export default {
  data() {
    return {
      mode: 'bill',

      sunHours: 4,

      // BILL
      bill: 0,
      rate: 12,

      // DIRECT
      monthlyKwh: 0,

      // DEVICE
      devices: [
        { name: '', 
        watts: 0, 
        hours: 0, 
        qty: 1 }
      ]
    };
  },

  computed: {
    // DEVICE CALC
    deviceDailyKwh() {
      return this.devices.reduce((total, d) => {
        const kwh = (d.watts * d.hours * d.qty) / 1000;
        return total + (isNaN(kwh) ? 0 : kwh);
      }, 0);
    },
    estimatedSolar() {
      if (!this.dailyKwh) return 0;

      const efficiency = 0.8;

      return this.dailyKwh / (this.sunHours * efficiency);
    },
    dailyWh() {
      return this.dailyKwh * 1000;
    },
    hourlyWatts() {
      return this.dailyWh / 24;
    },
    requiredSolar() {
      if (!this.dailyKwh) return 0;
    
      const efficiency = 0.8; // * efficiency // for realworld calculation
      return this.dailyKwh / (this.sunHours);
    },
    totalDeviceKwh() {
      return this.devices.reduce((total, d) => {
        return total + ((d.watts * d.hours * d.qty * 30) / 1000);
      }, 0);
    },
    // MAIN MONTHLY
    computedMonthlyKwh() {
      if (this.mode === 'direct') {
        return this.monthlyKwh;
      }

      if (this.mode === 'bill') {
        if (!this.bill || !this.rate) return 0;
        return this.bill / this.rate;
      }

      if (this.mode === 'device') {
        return this.totalDeviceKwh;
      }

      return 0;
    },

    // DAILY
    dailyKwh() {
      return this.computedMonthlyKwh / 30;
    }
  },

  methods: {
    setMode(newMode) {
      this.mode = newMode;
    },

    addDevice() {
      this.devices.push({
        name: '',
        watts: 0,
        hours: 0,
        qty: 1
      });
    },

    removeDevice(index) {
      this.devices.splice(index, 1);
    },
    tabClass(modeName) {
  return [
    "px-4 py-2 rounded",
    this.mode === modeName
      ? "bg-blue-500 text-white"
      : "bg-gray-200"
  ];
}
  }
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">
      
      Load Analysis
    </h2>

    <!-- TABS -->
    <div class="flex gap-2 mb-6">
      <button
        @click="setMode('direct')"
        :class="tabClass('direct')"
      >DIRECT</button>

      <button
        @click="setMode('bill')"
        :class="tabClass('bill')"
      >BILL</button>

      <button
        @click="setMode('device')"
        :class="tabClass('device')"
      >DEVICE</button>
    </div>

    <!-- DIRECT -->
    <div v-if="mode === 'direct'" class="grid md:grid-cols-2 gap-4">

      <!-- Monthly -->
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">
          Monthly Consumption
        </p>
      
        <div class="flex items-center justify-between border rounded-md px-3 py-2">
          <input
            type="number"
            placeholder="0"
            class="outline-none w-full text-lg"
            v-model.number="monthlyKwh"
          />
          <span class="text-gray-500 ml-2">kWh</span>
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Check your electric bill for this value
        </p>
      </div>
    
      <!-- Sun Hours -->
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">
          Sun Peak Hours
        </p>
      
        <div class="flex items-center justify-between border rounded-md px-3 py-2">
          <input
            type="number"
            step="0.1"
            class="outline-none w-full text-lg"
            v-model.number="sunHours"
          />
          <span class="text-gray-500 ml-2">hours/day</span>
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Philippines average: 4–5 hours
        </p>
      </div>
    
    </div>

    <!-- BILL -->
    <div v-if="mode === 'bill'" class="grid md:grid-cols-3 gap-4 mt-6">
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">
          Monthly Electric Bill
        </p>
      
        <div class="flex items-center justify-between border rounded-md px-3 py-2">
          
          <span class="text-gray-500 mr-2">₱</span>

          <input
            type="number"
            placeholder="0"
            class="outline-none w-full text-lg"
            v-model.number="bill"
          />
          
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Enter your total monthly electric bill
        </p>
      </div>

      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">
          Rate per KWh
        </p>
      
        <div class="flex items-center justify-between border rounded-md px-3 py-2">

          <span class="text-gray-500 mr-2">₱</span>

          <input
            type="number"
            placeholder="0"
            class="outline-none w-full text-lg"
            v-model.number="rate"
          />
          <span class="text-gray-500 ml-2">/kWh</span>
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Check your electric bill for the rate (e.g 11.50)
        </p>
      </div>

      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">
          Sun Peak Hours
        </p>
      
        <div class="flex items-center justify-between border rounded-md px-3 py-2">
          <input
            type="number"
            placeholder="0"
            class="outline-none w-full text-lg"
            v-model.number="sunHours"
          />
          <span class="text-gray-500 ml-2">hours/day</span>
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Philippines avverage: 4-5 hours
        </p>
      </div>

      <div>
          <p class="mt-3 text-sm text-green-600 font-semibold">
            Total Monthly: {{ computedMonthlyKwh.toFixed(2) }} kWh/month 
          </p>
        </div>
    </div>

    <!-- DEVICE -->
      <div v-if="mode === 'device'" class="bg-white p-4 rounded shadow">

        <div class="mb-4">
          <label class="text-sm text-gray-500">Sun Peak Hours</label>
          <input
            type="number"
            v-model.number="sunHours"
            class="border rounded px-3 py-2 w-full"
          />
        </div>

        <div
          v-for="(device, index) in devices"
          :key="index"
          class="grid grid-cols-5 gap-2 mb-2"
        >
          <input v-model="device.name" placeholder="Device Name" class="input" />
          <input v-model.number="device.watts" type="number" placeholder="Watts" class="input" />
          <input v-model.number="device.hours" type="number" placeholder="Hours" class="input" />
          <input v-model.number="device.qty" type="number" placeholder="Qty" class="input" />


          <button @click="removeDevice(index)" class="text-red-500">✕</button>
        </div>

        <button @click="addDevice" class="mt-2 text-blue-600">
          + Add Device
        </button>

        <p class="mt-3 text-sm text-gray-600">
          Device Daily: {{ deviceDailyKwh.toFixed(2) }} kWh 
        </p>

        <div>
          <p class="mt-3 text-sm text-green-600 font-semibold">
            Total Monthly: {{ computedMonthlyKwh.toFixed(2) }} kWh/month 
          </p>
        </div>

      </div>


    <!---Results-->
    <div class="grid md:grid-cols-3 gap-6 mt-6">

      <!-- DIRECT MODE -->
      <template v-if="mode === 'direct'">
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Daily Consumption</p>
          <p class="text-xl font-bold">
            {{ dailyWh.toFixed(0) }} Wh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Daily Consumption</p>
          <p class="text-xl font-bold">
            {{ dailyKwh.toFixed(2) }} kWh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Hourly Average</p>
          <p class="text-xl font-bold">
            {{ hourlyWatts.toFixed(0) }} W
          </p>
        </div>
      
      </template>
    
      <!-- BILL MODE -->
      <template v-else-if="mode === 'bill'">
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Monthly Consumption</p>
          <p class="text-xl font-bold">
            {{ computedMonthlyKwh.toFixed(1) }} kWh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Daily Consumption</p>
          <p class="text-xl font-bold">
            {{ dailyKwh.toFixed(2) }} kWh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Required Solar Power</p>
          <p class="text-xl font-bold text-green-600">
            {{ requiredSolar.toFixed(2) }} kW
          </p>
        </div>
      
      </template>

      <!-- DEVICE MODE -->
      <template v-else-if="mode === 'device'">

        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Daily Consumption</p>
          <p class="text-xl font-bold">
            {{ dailyWh.toFixed(0) }} Wh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Daily Consumption</p>
          <p class="text-xl font-bold">
            {{ dailyKwh.toFixed(2) }} kWh
          </p>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow text-center">
          <p class="text-gray-500 text-sm">Hourly Average</p>
          <p class="text-xl font-bold">
            {{ hourlyWatts.toFixed(0) }} W
          </p>
        </div>
      
      </template>
    
    </div>

    <!-- FORMULA -->
    <div class="py-4 text-sm text-blue-600">

      <!-- DIRECT -->
      <template v-if="mode === 'direct'">
      Formula:
      Daily Wh = ({{ computedMonthlyKwh.toFixed(0) }} kWh / 30 days) × 1000
      = {{ dailyWh.toFixed(0) }} Wh
      </template>
    
      <!-- BILL -->
      <template v-else-if="mode === 'bill'">
        Formula:
        (₱{{ bill }} / ₱{{ rate }} per kWh / 30 days / {{ sunHours }}h sun)
        = {{ requiredSolar.toFixed(2) }} kW
      </template>
    
      <!-- DEVICE -->
      <template v-else>
        Formula:
        ({{ computedMonthlyKwh.toFixed(2) }} kWh / 30 days)
        = {{ dailyKwh.toFixed(2) }} kWh/day
      </template>
    
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full border rounded px-3 py-2;
}

.container {
  padding: 20px;
  max-width: 600px;
}

.tabs {
  margin-bottom: 20px;
}

.tabs button {
  margin-right: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.tabs .active {
  background: #007bff;
  color: white;
}

.box {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-row {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.device-row input {
  width: 100px;
}

.add-btn {
  margin-top: 10px;
}

.results {
  margin-top: 20px;
  padding: 10px;
  background: #f3f3f3;
}
</style>