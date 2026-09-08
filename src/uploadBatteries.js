import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase.js'
import { batteries } from './data/batteries.js'

async function uploadBatteries() {
  try {
    for (const battery of batteries) {
      await addDoc(collection(db, 'solarBatteries'), battery)
      console.log('Uploaded:', battery.model)
    }

    console.log('All Batteries uploaded!')
  } catch (error) {
    console.error(error)
  }
}

uploadBatteries()