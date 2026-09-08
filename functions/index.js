import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { createSearchHandler } from './solarSearch.js'
import { createTechnicalHandler } from './technicalCatalog.js'

export const technicalSolarPanels = onRequest({
  region: 'asia-east1', timeoutSeconds: 30, memory: '512MiB', maxInstances: 1, invoker: 'public',
}, createTechnicalHandler())

const apiKey = defineSecret('SERPAPI_KEY')
export const onlineSolarPanels = onRequest({
  region: 'asia-east1',
  secrets: [apiKey],
  timeoutSeconds: 30,
  maxInstances: 1,
  invoker: 'public',
}, createSearchHandler({ getKey: () => apiKey.value() }))
