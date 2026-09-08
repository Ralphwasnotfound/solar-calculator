import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase.js'
import { panels } from './data/panels.js'

async function uploadPanels() {
  try {
    for (const panel of panels) {
      await addDoc(collection(db, 'solarPanels'), panel)
      console.log('Uploaded:', panel.model)
    }

    console.log('All panels uploaded!')
  } catch (error) {
    console.error(error)
  }
}

uploadPanels()