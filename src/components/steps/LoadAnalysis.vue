<script>
export default {
  data() {
    return {
      mode: 'bill',

      // BILL
      bill: 0,
      rate: 12,

      // DIRECT
      monthlyKwh: 0,

      // DEVICE
      devices: [
        { name: '', watts: 0, hours: 0, qty: 1 }
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
        return this.deviceDailyKwh * 30;
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
    <h2 class="text-2xl font-bold mb-4">⚡ Load Analysis</h2>

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
    <div v-if="mode === 'direct'" class="bg-white p-4 rounded shadow">
      <label class="block mb-2 font-medium">Monthly Consumption (kWh)</label>
      <input type="number" v-model.number="monthlyKwh" class="input" />
    </div>

    <!-- BILL -->
    <div v-if="mode === 'bill'" class="bg-white p-4 rounded shadow space-y-3">
      <div>
        <label class="block mb-1">Monthly Bill (₱)</label>
        <input type="number" v-model.number="bill" class="input" />
      </div>

      <div>
        <label class="block mb-1">Rate per kWh (₱)</label>
        <input type="number" v-model.number="rate" class="input" />
      </div>
    </div>

    <!-- DEVICE -->
    <div v-if="mode === 'device'" class="bg-white p-4 rounded shadow">
      <div
        v-for="(device, index) in devices"
        :key="index"
        class="grid grid-cols-4 gap-2 mb-2"
      >
        <input v-model="device.name" placeholder="Device" class="input" />
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
    </div>

    <!-- RESULTS -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div class="bg-blue-50 p-4 rounded shadow text-center">
        <p class="text-gray-500 text-sm">Monthly</p>
        <p class="text-xl font-bold">
          {{ computedMonthlyKwh.toFixed(2) }} kWh
        </p>
      </div>

      <div class="bg-blue-50 p-4 rounded shadow text-center">
        <p class="text-gray-500 text-sm">Daily</p>
        <p class="text-xl font-bold">
          {{ dailyKwh.toFixed(2) }} kWh
        </p>
      </div>
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