// Blocks sensitive identifiers from public listing text.
const PATTERNS = [
  { re: /\b\d{5}-?\d{7}-?\d\b/, label: 'a national ID number' },
  { re: /\b(?:\d[ -]?){13,19}\b/, label: 'a card or account number' },
  { re: /\b\d{2,3}[A-Z]{2,5}\d{3,6}\b/i, label: 'a roll or registration number' },
];

export function findSensitive(...texts) {
  const joined = texts.filter(Boolean).join(' \n ');
  for (const p of PATTERNS) if (p.re.test(joined)) return p.label;
  return null;
}
