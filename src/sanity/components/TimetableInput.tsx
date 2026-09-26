'use client'

import {Box, Button, Card, Flex, Select, Stack, Text, TextInput} from '@sanity/ui'
import {type ObjectInputProps, insert, set, setIfMissing, unset} from 'sanity'

type Row = {
  _key: string
  _type?: string
  time?: string
  label?: string
  kind?: string
  cells?: string[]
}

type RoutineValue = {days?: string[]; rows?: Row[]}

const newKey = () => Math.random().toString(36).slice(2, 12)

const cellStyle: React.CSSProperties = {padding: 4, minWidth: 130, verticalAlign: 'top'}

/**
 * A spreadsheet-style editor shown at the top of every Class routine document.
 *
 * It edits the same `days` and `rows` fields as the standard form below it, and
 * adds visual "Add row" / "Add column" buttons plus a delete button on every row
 * and column. Adding or removing a column keeps every row's subjects aligned.
 */
export function TimetableInput(props: ObjectInputProps) {
  const {onChange, renderDefault, readOnly} = props
  const value = (props.value ?? {}) as RoutineValue
  const days = value.days ?? []
  const rows = value.rows ?? []

  const padCells = (cells: string[] | undefined, length: number) =>
    Array.from({length}, (_, i) => cells?.[i] ?? '')

  const setRowField = (key: string, field: keyof Row, next: unknown) =>
    onChange(set(next, ['rows', {_key: key}, field]))

  const setCell = (row: Row, dayIndex: number, next: string) => {
    const cells = padCells(row.cells, days.length)
    cells[dayIndex] = next
    setRowField(row._key, 'cells', cells)
  }

  const addRow = () =>
    onChange([
      setIfMissing([], ['rows']),
      insert(
        [
          {
            _key: newKey(),
            _type: 'classRoutineRow',
            time: '',
            label: '',
            kind: 'lesson',
            cells: days.map(() => ''),
          },
        ],
        'after',
        ['rows', -1],
      ),
    ])

  const deleteRow = (key: string) => onChange(unset(['rows', {_key: key}]))

  const addColumn = () =>
    onChange([
      set([...days, 'New day'], ['days']),
      ...rows.map((row) => set([...padCells(row.cells, days.length), ''], ['rows', {_key: row._key}, 'cells'])),
    ])

  const deleteColumn = (index: number) =>
    onChange([
      set(days.filter((_, i) => i !== index), ['days']),
      ...rows.map((row) =>
        set(
          padCells(row.cells, days.length).filter((_, i) => i !== index),
          ['rows', {_key: row._key}, 'cells'],
        ),
      ),
    ])

  const setDay = (index: number, next: string) =>
    onChange(set(days.map((d, i) => (i === index ? next : d)), ['days']))

  return (
    <Stack gap={5}>
      <Card padding={3} radius={2} border>
        <Stack gap={3}>
          <Flex align="center" justify="space-between" gap={2} wrap="wrap">
            <Text weight="semibold">Timetable</Text>
            <Flex gap={2}>
              <Button text="+ Add row" tone="primary" mode="ghost" onClick={addRow} disabled={readOnly} />
              <Button text="+ Add column" tone="primary" mode="ghost" onClick={addColumn} disabled={readOnly} />
            </Flex>
          </Flex>

          <Box style={{overflowX: 'auto'}}>
            <table style={{borderCollapse: 'collapse', width: '100%'}}>
              <thead>
                <tr>
                  <th style={cellStyle}><Text size={1} muted>Time</Text></th>
                  <th style={cellStyle}><Text size={1} muted>Slot name</Text></th>
                  <th style={cellStyle}><Text size={1} muted>Row type</Text></th>
                  {days.map((day, i) => (
                    <th key={i} style={cellStyle}>
                      <Flex gap={1}>
                        <Box flex={1}>
                          <TextInput
                            fontSize={1}
                            value={day ?? ''}
                            readOnly={readOnly}
                            onChange={(e) => setDay(i, e.currentTarget.value)}
                          />
                        </Box>
                        <Button
                          text="✕"
                          mode="bleed"
                          tone="critical"
                          title="Delete this column"
                          disabled={readOnly}
                          onClick={() => deleteColumn(i)}
                        />
                      </Flex>
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const kind = row.kind ?? 'lesson'
                  return (
                    <tr key={row._key}>
                      <td style={cellStyle}>
                        <TextInput
                          fontSize={1}
                          value={row.time ?? ''}
                          placeholder="8:30 – 9:15"
                          readOnly={readOnly}
                          onChange={(e) => setRowField(row._key, 'time', e.currentTarget.value)}
                        />
                      </td>
                      <td style={cellStyle}>
                        <TextInput
                          fontSize={1}
                          value={row.label ?? ''}
                          placeholder="Period 1"
                          readOnly={readOnly}
                          onChange={(e) => setRowField(row._key, 'label', e.currentTarget.value)}
                        />
                      </td>
                      <td style={cellStyle}>
                        <Select
                          fontSize={1}
                          value={kind}
                          readOnly={readOnly}
                          onChange={(e) => setRowField(row._key, 'kind', e.currentTarget.value)}
                        >
                          <option value="lesson">Lessons</option>
                          <option value="all">Same every day</option>
                          <option value="break">Break</option>
                        </Select>
                      </td>
                      {days.map((_, i) =>
                        kind === 'lesson' ? (
                          <td key={i} style={cellStyle}>
                            <TextInput
                              fontSize={1}
                              value={row.cells?.[i] ?? ''}
                              readOnly={readOnly}
                              onChange={(e) => setCell(row, i, e.currentTarget.value)}
                            />
                          </td>
                        ) : (
                          <td key={i} style={{...cellStyle, textAlign: 'center'}}>
                            <Text size={1} muted>{row.label || '—'}</Text>
                          </td>
                        ),
                      )}
                      <td style={cellStyle}>
                        <Button
                          text="✕"
                          mode="bleed"
                          tone="critical"
                          title="Delete this row"
                          disabled={readOnly}
                          onClick={() => deleteRow(row._key)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
          {!rows.length ? <Text size={1} muted>No rows yet — click “Add row”.</Text> : null}
        </Stack>
      </Card>

      {renderDefault(props)}
    </Stack>
  )
}
