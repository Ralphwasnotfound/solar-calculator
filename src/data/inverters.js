export const inverters = [

  // HYBRID
    {
        brand: "SRNE",
        model: "HF4850S80-100",
        type: "hybrid",
        power: 4800,

        voltage: "48V",
        phase: "single",

        maxPvInput: "6000W",
        batteryRange: "40–60V",
        mpptCount: 2,
        maxVoltagePerMppt: "500V",
        maxCurrentPerMppt: "18A"

    },

    {
        brand: "Growatt",
        model: "SPF 5000 ES",
        type: "hybrid",
        power: 5000,

        voltage: "48V",
        phase: "single",

        maxPvInput: "6000W",
        batteryRange: "40-60V",
        mpptCount: 2,
        maxVoltagePerMppt: "450V",
        maxCurrentPerMppt: "18"
    },

    {
        brand: "Deye",
        model: "SUN-5K-SG04LP1",
        type: "hybrid",
        power: 5000,

        voltage: "48V",
        phase: "single",

        maxPvInput: "9000W",
        batteryRange: "40–60V",
        mpptCount: 2,
        maxVoltagePerMppt: "550V",
        maxCurrentPerMppt: "11A"
    },

    {
        brand: "Deye",
        model: "SUN-6K-SG03LP1-EU",
        type: "hybrid",
        power: 6000,

        voltage: "48V",
        phase: "single",

        maxPvInput: "9000W",
        batteryRange: "40–60V",
        mpptCount: 2,
        maxVoltagePerMppt: "550V",
        maxCurrentPerMppt: "11A"
    },

    {
        brand: "SMA",
        model: "Sunny Island 6.0H",
        type: "hybrid",
        power: 6000,
        voltage: "48V",
        phase: "single",

        maxPvInput: "8000W",
        batteryRange: "41–63V",
        mpptCount: 2,
        maxVoltagePerMppt: "600V",
        maxCurrentPerMppt: "12A"
    },
    {
    brand: "Deye",
    model: "SUN-8K-SG04LP3",
    type: "hybrid",

    power: 8000,

    voltage: "48V",
    phase: "three",

    maxPvInput: "10400W",

    batteryRange: "48-48V",

    mpptCount: 2,

    maxVoltagePerMppt: "550V",

    maxCurrentPerMppt: "15A"
  },

  /* ⚡ ON-GRID (future)
  {
    brand: "Huawei",
    model: "SUN2000-5K",
    type: "ongrid",
    power: 5000,
    voltage: "230V",
    phase: "single"
  },

  /* 🔌 OFF-GRID (future)
  {
    brand: "Victron",
    model: "MultiPlus-II 48/5000",
    type: "offgrid",
    power: 5000,
    voltage: "48V",
    phase: "single"
  }

  */
];