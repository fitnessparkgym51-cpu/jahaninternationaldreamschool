/**
 * One-off migration: moves the Class routine page's shared `days` / `slots` onto
 * every `classRoutine` document, so each class owns its full table (day columns,
 * rows with time/label/kind, subjects). Removes the old page-level fields and each
 * row's `slotKey`. Idempotent: routines already migrated (having `days`) are skipped.
 *
 * Usage: node scripts/migrate-class-routine-rows.mjs
 */
import {client} from './lib/verify-helpers.mjs'

const page = await client.fetch(
  `*[_id in ["classRoutinePage", "drafts.classRoutinePage"]]{_id, "section": sections[_type == "routineSection"][0]{_key, days, slots}}`,
)
const source = page.find((p) => p.section?.slots?.length)?.section
if (!source) {
  console.log('No page-level slots found — nothing to migrate.')
  process.exit(0)
}
const days = source.days ?? []
const routines = await client.fetch(`*[_type == "classRoutine" && !defined(days)]{_id, rows}`)

const tx = client.transaction()
for (const routine of routines) {
  const bySlot = new Map((routine.rows ?? []).map((row) => [row.slotKey, row]))
  // Keep the old "trim trailing empty lesson rows" behaviour as real data.
  let last = -1
  source.slots.forEach((slot, i) => {
    const cells = bySlot.get(slot.key)?.cells ?? []
    if (slot.kind !== 'lesson' || cells.some((c) => c?.trim())) last = i
  })
  const rows = source.slots.slice(0, last + 1).map((slot) => {
    const cells = bySlot.get(slot.key)?.cells ?? []
    return {
      _key: slot.key || slot._key,
      _type: 'classRoutineRow',
      time: slot.time,
      label: slot.label,
      kind: slot.kind || 'lesson',
      ...(slot.kind === 'lesson' || !slot.kind
        ? {cells: days.map((_, d) => cells[d] ?? '')}
        : {}),
    }
  })
  tx.patch(routine._id, (p) => p.set({days, rows}))
}
for (const p of page) {
  if (p.section) tx.patch(p._id, (patch) => patch.unset([`sections[_key == "${p.section._key}"].days`, `sections[_key == "${p.section._key}"].slots`]))
}
const res = await tx.commit()
console.log(`Migrated ${routines.length} routines; cleaned ${page.length} page document(s).`, res.transactionId)
