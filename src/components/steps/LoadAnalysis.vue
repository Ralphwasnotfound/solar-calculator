<script>
export default {
  data() {
    return {
      mode: 'direct',

      sunHours: 4,

      // BILL
      bill: null,
      rate: null,

      // DIRECT
      monthlyKwh: null,

      // DEVICE
      devices: [
        { name: '', 
        watts: null, 
        hours: null, 
        qty: null }
      ]
    };
  },

  computed: {
    // DEVICE CALC
    deviceDailyKwh() {
      return this.devices.reduce((total, d) => {
        const watts = Number(d.watts) || 0;
        const hours = Number(d.hours) || 0;
        const qty = Number(d.qty) || 0;
      
        const kwh = (watts * hours * qty) / 1000;
      
        return total + kwh;
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

      const sun = Number(this.sunHours) || 0;
      if (!sun) return 0; // prevent divide by 0

      const efficiency = 0.8; // for real-world losses (panel, inverter, heat)
      // return this.dailyKwh / (sun * efficiency); ← enable later

      return this.dailyKwh / sun;
    },

    totalDeviceKwh() {
      return this.devices.reduce((total, d) => {
      const watts = Number(d.watts) || 0;
      const hours = Number(d.hours) || 0;
      const qty = Number(d.qty) || 0;

      return total + ((watts * hours * qty * 30) / 1000);
      }, 0);
    },
    // MAIN MONTHLY
    computedMonthlyKwh() {

      if (this.mode === 'direct') {
        return Number(this.monthlyKwh) || 0;
      }
    
      if (this.mode === 'bill') {
        const bill = Number(this.bill);
        const rate = Number(this.rate);
      
        if (!bill || !rate) return 0;
      
        return bill / rate;
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
        watts: null,
        hours: null,
        qty: null
      });
    },

    removeDevice(index) {
      this.devices.splice(index, 1);
    },
    tabClass(modeName) {
    return [
      "flex items-center gap-2 px-24 py-3 text-md rounded-lg font-semiboldd transition-all",
      this.mode === modeName
        ? "bg-blue-500 text-white"
        : "bg-gray-200"
    ];
    }
  },
  mounted() {
    const saved = localStorage.getItem('solarData');
    
    if (saved) {
      Object.assign(this.$data, JSON.parse(saved));
    }
  },
  watch: {
    $data: {
      handler(val) {
        localStorage.setItem('solarData', JSON.stringify(val));
      },
      deep: true
    }
  }

};
</script>

<template>
  <div class="p-6 mx-auto">
    <h2 class="text-2xl flex items-center gap-2 font-bold mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(230,163,4,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
      Load Analysis
    </h2>

    <!-- TABS -->
    <div class="flex justify-between items-center gap-2 mb-6">
      
      <button
        @click="setMode('direct')"
        :class="tabClass('direct')"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="rgba(173,184,194,1)"><path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"></path></svg>
      DIRECT
      </button>

      <button
        @click="setMode('bill')"
        :class="tabClass('bill')"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="rgba(173,184,194,1)"><path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V4H5V20H19ZM8 7H16V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z"></path></svg>
      BILL
      </button>

      <button
        @click="setMode('device')"
        :class="tabClass('device')"
      >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="rgba(173,184,194,1)"><path d="M19 8H21C21.5523 8 22 8.44772 22 9V21C22 21.5523 21.5523 22 21 22H13C12.4477 22 12 21.5523 12 21V20H4C3.44772 20 3 19.5523 3 19V3C3 2.44772 3.44772 2 4 2H18C18.5523 2 19 2.44772 19 3V8ZM17 8V4H5V18H12V9C12 8.44772 12.4477 8 13 8H17ZM14 10V20H20V10H14Z"></path></svg>
      DEVICE
      </button>
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
            v-model="monthlyKwh"
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
            v-model="sunHours"
          />
          <span class="text-gray-500 ml-2">hours/day</span>
        </div>
      
        <p class="text-xs text-gray-400 mt-2">
          Philippines average: 4–5 hours
        </p>
      </div>
    
    </div>

    <!-- BILL -->
    <div v-if="mode === 'bill'" class="  mt-6">
      <div class="grid md:grid-cols-3 gap-4">
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
              v-model="bill"
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
              v-model="rate"
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
              v-model="sunHours"
            />
            <span class="text-gray-500 ml-2">hours/day</span>
          </div>
        
          <p class="text-xs text-gray-400 mt-2">
            Philippines avverage: 4-5 hours
          </p>
        </div>
      </div>

      <div>
        <div>
          <p class="mt-3 text-sm text-green-600 font-semibold flex items-center justify-start gap-2 bg-green-200 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(30,215,105,1)"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"></path></svg>
            Total Monthly: {{ computedMonthlyKwh.toFixed(2) }} kWh/month 
          </p>
        </div>
      </div>
    </div>

    <!-- DEVICE -->
    <div v-if="mode === 'device'">
      <div class="mb-4">
        <label class="text-sm text-gray-500">Sun Peak Hours</label>
        <input
          type="number"
          v-model="sunHours"
          class="border rounded px-3 py-2 w-full"
        />

        <p class="text-xs text-gray-400 mt-2">
            Philippines avverage: 4-5 hours
          </p>
      </div>

      <div class="bg-white p-2 rounded shadow"> 

        <div class="flex items-center justify-between mb-2">
          <p class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="rgba(147,152,153,1)"><path d="M3 17H21V19H3V17ZM3 11H6V14H3V11ZM8 11H11V14H8V11ZM3 5H6V8H3V5ZM13 5H16V8H13V5ZM18 5H21V8H18V5ZM13 11H16V14H13V11ZM18 11H21V14H18V11ZM8 5H11V8H8V5Z"></path></svg>
            Device/Appliances
          </p>
          <button @click="addDevice" class="flex items-center gap-1 text-blue-600 bg-blue-200 p-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>
            Add Device
          </button>

        </div>

        <span class="block h-[2px] w-full bg-slate-300 mb-4"></span>

        <div
          v-for="(device, index) in devices"
          :key="index"
          >

          <div class="grid grid-cols-6 gap-2 mb-2">
            
            <input v-model="device.name" placeholder="Device Name" class="input" />
            <input v-model="device.watts" type="number" placeholder="Watts" class="input" />
            <input v-model="device.hours" type="number" placeholder="Hours" class="input" />
            <input v-model="device.qty" type="number" placeholder="Qty" class="input" />

            <p class="mt-3 text-sm text-gray-600">
            Device Daily: {{ deviceDailyKwh.toFixed(2) }} kWh 
            </p>

            <button @click="removeDevice(index)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="rgba(231,18,18,1)"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path></svg>
            </button>
          
          </div>
        </div>
      </div>
    <div>

        <div>
          <p class="mt-3 text-sm text-green-600 font-semibold flex items-center justify-start gap-2 bg-green-200 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(30,215,105,1)"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z"></path></svg>
            Total Monthly: {{ computedMonthlyKwh.toFixed(2) }} kWh/month 
          </p>
        </div>
      </div>
    </div>


    <!---Results-->
    <div class="grid md:grid-cols-3 gap-6 mt-6">

      <!-- DIRECT MODE -->
      <template v-if="mode === 'direct'">

          <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Daily Consumption</p>
              <p class="text-xl font-bold">
                {{ dailyWh.toFixed(0) }} Wh
              </p>
            </div>

            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Daily Consumption</p>
              <p class="text-xl font-bold">
                {{ dailyKwh.toFixed(2) }} kWh
              </p>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
            </div>
          </div>
      
          <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Hourly Average</p>
              <p class="text-xl font-bold">
                {{ hourlyWatts.toFixed(0) }} W
              </p>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
            </div>
          </div>
      
      </template>

      <!-- BILL MODE -->
      <template v-else-if="mode === 'bill'">
      
        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Monthly Consumption</p>
            <p class="text-xl font-bold">
              {{ computedMonthlyKwh.toFixed(1) }} kWh
            </p>
          </div>

          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM6 15H8V17H6V15ZM10 11H18V13H10V11ZM10 15H15V17H10V15Z"></path></svg>
          </div>
        </div>
      
        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Daily Consumption</p>
            <p class="text-xl font-bold">
              {{ dailyKwh.toFixed(2) }} kWh
            </p>
          </div>

          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
          </div>
        </div>

        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Required Solar Power</p>
            <p class="text-xl font-bold">
              {{ requiredSolar.toFixed(2) }} kW
            </p>
          </div>

          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
          </div>
        </div>

      </template>

      <!-- DEVICE MODE -->
      <template v-else-if="mode === 'device'">

        <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Daily Consumption</p>
              <p class="text-xl font-bold">
                {{ dailyWh.toFixed(0) }} Wh
              </p>
            </div>

            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Daily Consumption</p>
              <p class="text-xl font-bold">
                {{ dailyKwh.toFixed(2) }} kWh
              </p>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M13 10H20L11 23V14H4L13 1V10Z"></path></svg>
            </div>
          </div>
      
          <div class="bg-blue-50 p-4 rounded shadow flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">Hourly Average</p>
              <p class="text-xl font-bold">
                {{ hourlyWatts.toFixed(0) }} W
              </p>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(70,146,221,1)"><path d="M9.97308 18H14.0269C14.1589 16.7984 14.7721 15.8065 15.7676 14.7226C15.8797 14.6006 16.5988 13.8564 16.6841 13.7501C17.5318 12.6931 18 11.385 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 11.3843 6.46774 12.6917 7.31462 13.7484C7.40004 13.855 8.12081 14.6012 8.23154 14.7218C9.22766 15.8064 9.84103 16.7984 9.97308 18ZM14 20H10V21H14V20ZM5.75395 14.9992C4.65645 13.6297 4 11.8915 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 11.8925 19.3428 13.6315 18.2443 15.0014C17.624 15.7748 16 17 16 18.5V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V18.5C8 17 6.37458 15.7736 5.75395 14.9992ZM13 10.0048H15.5L11 16.0048V12.0048H8.5L13 6V10.0048Z"></path></svg>
            </div>
          </div>
      
      </template>
    
    </div>

    <!-- FORMULA -->
    <div class="py-4 text-sm text-blue-600">

      <!-- DIRECT -->
      <template v-if="mode === 'direct'">
        <div class="flex items-center justify-start gap-2 font-semibold bg-blue-100 p-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>
          Formula:
          Daily Wh = ({{ computedMonthlyKwh.toFixed(0) }} kWh / 30 days) × 1000
          = <strong>{{ dailyWh.toFixed(0) }} Wh</strong>
        </div>
      </template>
    
      <!-- BILL -->
      <template v-else-if="mode === 'bill'">
        <div class="flex items-center justify-start gap-2 font-semibold bg-blue-100 p-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>
          Formula:
          (₱{{ bill }} / ₱{{ rate }} per kWh / 30 days / {{ sunHours }}h sun peak)
          =  <strong> {{ requiredSolar.toFixed(2) }} kW</strong> required solar power
        </div>
      </template>
    
      <!-- DEVICE -->
      <template v-else>
        <div class="flex items-center justify-start gap-2 font-semibold bg-blue-100 p-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg>
          Formula:
          Daily Wh = ({{ computedMonthlyKwh.toFixed(0) }} kWh / 30 days) × 1000
          = <strong>{{ dailyWh.toFixed(0) }} Wh</strong>
        </div>
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