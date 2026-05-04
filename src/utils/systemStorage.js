// src/utils/systemStorage.js

export function saveSystemDesign(data) {

    localStorage.setItem(
        'solarSystemDesign',
        JSON.stringify(data)
    )

    window.dispatchEvent(new Event('system-updated'))
}

export function getSystemDesign() {

    return JSON.parse(
        localStorage.getItem(
            'solarSystemDesign'
        )
    ) || {

        load: {},

        solar: {},

        inverter: {},

        battery: {},

        wires: {},

        protection: {}
    }
}