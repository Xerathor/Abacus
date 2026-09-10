// ─── Row configuration ───────────────────────────────────────────────────────
// Index 0 = bottom row (quarters), index 10 = top row (×10^9)

export interface RowConfig {
  totalBeads: number;
  multiplier: number;
  label: string;
}

export const ROW_CONFIG: RowConfig[] = [
  { totalBeads: 4,  multiplier: 0.25,          label: "¼"    },
  { totalBeads: 10, multiplier: 1,              label: "1"    },
  { totalBeads: 10, multiplier: 10,             label: "10"   },
  { totalBeads: 10, multiplier: 100,            label: "100"  },
  { totalBeads: 10, multiplier: 1_000,          label: "1К"   },
  { totalBeads: 10, multiplier: 10_000,         label: "10К"  },
  { totalBeads: 10, multiplier: 100_000,        label: "100К" },
  { totalBeads: 10, multiplier: 1_000_000,      label: "1М"   },
  { totalBeads: 10, multiplier: 10_000_000,     label: "10М"  },
  { totalBeads: 10, multiplier: 100_000_000,    label: "100М" },
  { totalBeads: 10, multiplier: 1_000_000_000,  label: "1Г"   },
];

export const NUM_ROWS = ROW_CONFIG.length; // 11

export const MAX_VALUE: number = ROW_CONFIG.reduce(
  (sum, row) => sum + row.totalBeads * row.multiplier,
  0,
);

// ─── Core calculation ─────────────────────────────────────────────────────────

/**
 * Calculate the decimal value represented by the current bead positions.
 * `rows[i]` = number of beads shifted LEFT (activated) in row i.
 */
export function calculateValue(rows: number[]): number {
  let total = 0;
  for (let i = 0; i < NUM_ROWS; i++) {
    total += (rows[i] ?? 0) * ROW_CONFIG[i].multiplier;
  }
  // Fix floating-point drift (max 4 decimal places from ×0.25)
  return Math.round(total * 10000) / 10000;
}

/**
 * Convert a decimal number into bead positions (leftCount per row).
 * Clamps to [0, MAX_VALUE] and rounds to nearest 0.25.
 */
export function valueToRows(value: number): number[] {
  const clamped = Math.max(0, Math.min(value, MAX_VALUE));
  const rounded = Math.round(clamped * 4) / 4; // nearest ¼

  const rows = new Array<number>(NUM_ROWS).fill(0);
  let remaining = rounded;

  for (let i = NUM_ROWS - 1; i >= 0; i--) {
    const { multiplier, totalBeads } = ROW_CONFIG[i];
    if (remaining >= multiplier) {
      const count = Math.min(Math.floor(remaining / multiplier), totalBeads);
      rows[i] = count;
      remaining = Math.round((remaining - count * multiplier) * 10000) / 10000;
    }
  }

  return rows;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format a value as "1 234.75" (space = thousands separator, dot = decimal).
 */
export function formatValue(value: number): string {
  const intPart = Math.floor(value);
  const fracRaw = Math.round((value - intPart) * 4) / 4;

  // Thousands-separated integer
  const intChars = intPart.toString();
  let intFormatted = "";
  for (let i = 0; i < intChars.length; i++) {
    if (i > 0 && (intChars.length - i) % 3 === 0) intFormatted += "\u00A0";
    intFormatted += intChars[i];
  }

  if (fracRaw === 0) return intFormatted;

  // ".25" / ".50" / ".75"
  const fracStr = fracRaw.toFixed(2).replace("0.", ".");
  return intFormatted + fracStr;
}

/**
 * Examples for the "Примеры" button in the rules modal.
 */
export const EXAMPLE_VALUES = [
  { label: "1 234.75", value: 1234.75 },
  { label: "0.50",     value: 0.5    },
  { label: "999",      value: 999    },
  { label: "1 000 000", value: 1_000_000 },
];
