// Quote every cell; neutralize spreadsheet formulas even after invisible leading characters.
export function csvCell(value: unknown) {
  let text = value == null ? '' : String(value);
  if (/^[\s\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]*[=+@-]/u.test(text))
    text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export type ExportSnapshot = {
  asOf: string;
  eventId: string;
  rows: {
    id: string;
    name: string;
    name_bn: string;
    max_people: number;
    attendance: string;
    adults: number;
    children: number;
    note: string;
    updated_at: string | null;
    source: string;
  }[];
};
export function householdCsv(snapshot: ExportSnapshot) {
  const rows: unknown[][] = [
    [
      'পরিবার আইডি',
      'অতিথি / পরিবার',
      'বাংলা নাম',
      'অনুষ্ঠান',
      'সর্বোচ্চ লোকসংখ্যা',
      'উত্তর',
      'প্রাপ্তবয়স্ক',
      'শিশু',
      'মোট নিশ্চিত',
      'অতিথির নোট',
      'উত্তরের উৎস',
      'সর্বশেষ পরিবর্তন (UTC)',
      'রিপোর্টের সময় (UTC)',
    ],
  ];
  const status: Record<string, string> = { accepted: 'আসবেন', declined: 'আসবেন না', pending: 'উত্তর বাকি' };
  for (const row of snapshot.rows)
    rows.push([
      row.id,
      row.name,
      row.name_bn,
      snapshot.eventId === 'nikah' ? 'আকদ' : 'বিবাহোত্তর সংবর্ধনা',
      row.max_people,
      status[row.attendance] ?? row.attendance,
      row.adults,
      row.children,
      row.attendance === 'accepted' ? row.adults + row.children : 0,
      row.note,
      row.source === 'host' ? 'আয়োজকের সংশোধন' : row.source === 'guest' ? 'অতিথি' : '',
      row.updated_at,
      snapshot.asOf,
    ]);
  return '\ufeff' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
