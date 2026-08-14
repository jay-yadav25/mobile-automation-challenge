/**
 * Parses a dollar amount out of a UI string such as "Item total: $45.98".
 * Centralised here (rather than inline in a page object) so any screen that
 * renders a "$X.XX" label can reuse the same, independently-testable parsing rule.
 */
export function parseDollarAmount(text: string): number {
  const match = text.match(/\$([\d.]+)/);
  if (!match) {
    throw new Error(`Could not parse a dollar amount from "${text}"`);
  }
  return Number(match[1]);
}
