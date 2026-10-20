import { expect, it } from 'vitest';
import { csvCell, householdCsv } from './csv';
it('neutralizes formulas after whitespace, BOM and directional characters', () => {
  for (const value of [
    '=1+1',
    ' +SUM(A1:A2)',
    '\t@SUM(1)',
    '\r\n-HYPERLINK(1)',
    '\ufeff\u200b=1',
    '\u202e+1',
  ])
    expect(csvCell(value)).toBe('"\'' + value + '"');
});
it('preserves Bengali, commas, quotes and multiline notes with CSV escaping', () => {
  expect(csvCell('রহমান, "পরিবার"\nআসবেন')).toBe('"রহমান, ""পরিবার""\nআসবেন"');
  expect(csvCell(null)).toBe('""');
});
it('exports header-only empty reports and marks event scope, source and UTC snapshot', () => {
  const empty = householdCsv({ rows: [], asOf: '2026-10-20T10:00:00Z', eventId: 'reception' });
  expect(empty.startsWith('\ufeff')).toBe(true);
  expect(empty.split('\r\n')).toHaveLength(2);
  const csv = householdCsv({
    asOf: '2026-10-20T10:00:00Z',
    eventId: 'reception',
    rows: [
      {
        id: 'id',
        name: '=DANGER()',
        name_bn: 'রহমান',
        max_people: 5,
        attendance: 'accepted',
        adults: 2,
        children: 1,
        note: 'শুভেচ্ছা',
        updated_at: null,
        source: 'host',
      },
    ],
  });
  expect(csv).toContain("'=DANGER()");
  expect(csv).toContain('আয়োজকের সংশোধন');
  expect(csv).toContain('2026-10-20T10:00:00Z');
  expect(csv).not.toContain('privateNote');
});
