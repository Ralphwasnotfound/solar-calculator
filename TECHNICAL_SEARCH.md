# Technical panel API — Phase 2

GET `/api/technical-panels?q=Jinko%20550W&limit=20&offset=0` searches the pinned
Phase 1 accepted snapshot only. No CSV downloads, Firestore or SerpApi calls occur.
The separate Firebase export is `technicalSolarPanels`, region `asia-east1`.

Queries require 2–160 characters. Limit defaults to 20, maximum 50. Offset defaults
to zero, maximum 100000. Responses contain `results`, `total`, `limit`, `offset`,
`nextOffset` (null at the end), and `snapshotId`. Use nextOffset with the same query
and snapshot version. Ranking is exact normalized model, manufacturer plus model,
manufacturer/text with explicit wattage, then all-token substring relevance.
Power only filters candidates; it never grants an exact identity. Stable ID sorting
breaks ranking ties. Original models and suffixes are always preserved in results.

Normalization uses Unicode NFKC, lowercase, punctuation-as-spaces and collapsed
whitespace. Exact search ranking uses compact normalized identities. This is search
ranking, not proof that a shopping listing is the same model. No marketing aliases
are invented: Canadian Solar currently gives no results because this snapshot uses
CSI Solar Co Ltd rather than that manufacturer name. Search the catalog name instead.

The loader verifies manifest/schema and snapshot SHA-256 and rejects duplicate IDs
or identities. It filters unexpected invalid specifications and rechecks before
returning results. Only allowlisted fields and provenance are exposed. Concurrent
cold requests share one load; warm requests reuse parsed records and normalized
search strings. Failed loads can retry. The selected snapshot is explicitly pinned
in technicalCatalog.js; importing a new snapshot does not automatically activate it.

Errors: 400 invalid input/pagination, 405 unsupported method, 503 unavailable/corrupt
catalog. No matches is 200 with an empty results array. Errors disclose no internal
paths or stack traces. Browser use is same-origin through proxies, so no additional
CORS configuration is needed for this flow.

## Local testing

From the solar-calculator directory, use separate terminals:

```powershell
firebase emulators:start --only functions,hosting
npm run dev
```

No SerpApi secret is needed by this function. The existing shopping function retains
its separate secret setup. Restart Vite after proxy changes. No deployment is needed.

```powershell
curl.exe --max-time 35 "http://localhost:5173/api/technical-panels?q=Jinko%20550W&limit=3"
curl.exe --max-time 35 "http://localhost:5000/api/technical-panels?q=JKM550M-72HL4"
curl.exe --max-time 35 "http://localhost:5000/api/technical-panels?q=Jinko&limit=3&offset=3"
curl.exe --max-time 35 "http://localhost:5001/solar-calculator-rjb2026-cb70e/asia-east1/technicalSolarPanels?q=Jinko"
```

Offline tests: `node --test functions/technicalCatalog.test.js`.
Measured locally on Node 24 against 21,601 records: approximately 176 ms cold load,
8 ms mean search across 100 queries, 30 ms observed maximum. Heap increased roughly
28 MB during load/search; process RSS was roughly 162 MB. These are local process
measurements, not emulator/cloud latency guarantees. Function memory is 512 MiB to
leave room for runtime overhead and concurrent requests. The 11.24 MB JSON requires
additional memory for parsed objects, temporary buffers and search strings.

No modal or calculator integration is part of Phase 2.
