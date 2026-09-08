import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase.js'
import { inverters } from './data/inverters.js'

async function uploadInverters() {
  try {
    for (const inverter of inverters) {
      await addDoc(collection(db, 'solarInverters'), inverter)
      console.log('Uploaded:', inverter.model)
    }

    console.log('All Inverters uploaded!')
  } catch (error) {
    console.error(error)
  }
}

uploadInverters()