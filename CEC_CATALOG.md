# CEC/SAM technical catalog — Phase 1

This is an offline technical-data preparation pipeline. No UI, Firebase function,
Firestore integration or shopping requests are enabled by these files.

## Import and test

Requires Node.js 22 or newer. From the solar-calculator directory:

```powershell
node scripts/importCecModules.mjs
node --test tests/cecCatalog.test.mjs
```

The default import is pinned to SAM commit
`cba319ded1c32a7f5b3ac76545a29e1f7181d238`. For a reviewed update:

```powershell
node scripts/importCecModules.mjs --revision <FULL_40_CHARACTER_COMMIT_SHA>
```

Replace the placeholder with the actual SAM commit SHA. Branches such as
`develop` are rejected. No API key is required. Imports download only the official
SAM CSV; tests use fixtures and the archived CSV without network access.

## Artifacts and provenance

Each immutable directory under `functions/data/cec/` contains:

- `source.csv`: original downloaded bytes for reproducibility.
- `snapshot.json`: schema version, snapshot ID and accepted technical records.
- `quarantine.json`: excluded source rows with reason codes and original fields.
- `manifest.json`: source URL, exact commit, SHA-256 of source and snapshot,
  import timestamp, counts, rejection reasons, byte sizes and schema/importer versions.

Directory names include schema/importer version, upstream commit and source hash.
Identical imports reuse the existing snapshot after checking its snapshot hash.
New imports stage a complete directory before publication by rename. Existing
versions are not overwritten; there is intentionally no active-version pointer yet.
Download, parsing, unit/schema errors, zero accepted records, or more than 5%
rejected rows fail the import. The 5% threshold is an explicit defensive policy,
not an assertion about upstream quality. Smaller invalid subsets are quarantined.

## Normalization and validation

`Name` is preserved exactly as `sourceRecordName`; its UTF-8 SHA-256 determines
the stable `cec-...` ID. Full manufacturer-prefix removal supplies `model` only
when that prefix is explicitly present. Unresolved models are quarantined.
Suffixes, punctuation and case are not collapsed or fuzzily merged.

`Manufacturer` supplies `manufacturer` and `brand`. `STC`, `V_oc_ref`, `V_mp_ref`,
`I_sc_ref`, `I_mp_ref` and `A_c` supply `watt`, `voc`, `vmp`, `isc`, `imp`, `areaM2`.
Efficiency is `100 * STC / (1000 * A_c)` percent, calculated only from catalog
data. Records also retain catalog date/version and the efficiency method.

All engineering values must be finite and positive; efficiency must not exceed
100%, Vmp must be below Voc, and Imp must not exceed Isc. Every member of a
duplicate identity or ID collision is quarantined, even if one member is invalid.
Values are never repaired. `specificationsVerified` means validated catalog data,
not independent laboratory certification or verification of a shopping listing.

## Initial snapshot

- Source SHA-256: `a28cf8956a839ed98bb941809b439e4907f5b4c237bd9299bc123fb502c29aff`
- Source rows: 21,677; accepted: 21,601; quarantined: 76.
- 72 rows belong to 36 duplicate identities; four have Imp greater than Isc.
- Normalized snapshot: 11,243,628 bytes. Archived CSV: 6,274,198 bytes.
- Catalog version: `2026.7.3`; catalog date: `6/23/2026`.

Review each future manifest/quarantine report and retain the last good version.
Importer behavior/schema changes should increment the respective version before
publishing another snapshot. Existing saved calculator designs are unaffected.

## Source and attribution

Source: California Energy Commission module data distributed in the System
Advisor Model (SAM) CEC Modules library:

- https://sam.nlr.gov/photovoltaic/pv-cost-component.html
- https://github.com/NatLabRockies/SAM/tree/develop/deploy/libraries
- https://www.energy.ca.gov/programs-and-topics/programs/solar-equipment-lists
- https://github.com/NatLabRockies/SAM/blob/cba319ded1c32a7f5b3ac76545a29e1f7181d238/LICENSE

Keep upstream attribution and applicable notices when distributing this data.
CEC does not warrant manufacturer-reported performance. Catalog efficiency is
derived from catalog area and may differ from a manufacturer's rounded figure.
