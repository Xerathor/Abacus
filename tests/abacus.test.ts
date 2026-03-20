import { describe, it, expect } from "vitest";
import {
  calculateValue,
  valueToRows,
  formatValue,
  ROW_CONFIG,
  NUM_ROWS,
  MAX_VALUE,
} from "../lib/abacus";

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeRows(overrides: Record<number, number> = {}): number[] {
  return Array.from({ length: NUM_ROWS }, (_, i) => overrides[i] ?? 0);
}

// ─── calculateValue ───────────────────────────────────────────────────────────
describe("calculateValue", () => {
  it("returns 0 when all beads are at zero", () => {
    expect(calculateValue(makeRows())).toBe(0);
  });

  it("counts 1 bead on units row as 1", () => {
    expect(calculateValue(makeRows({ 1: 1 }))).toBe(1);
  });

  it("counts 3 beads on tens row as 30", () => {
    expect(calculateValue(makeRows({ 2: 3 }))).toBe(30);
  });

  it("combines multiple rows correctly: 342", () => {
    // ×100 → 3, ×10 → 4, ×1 → 2
    expect(calculateValue(makeRows({ 3: 3, 2: 4, 1: 2 }))).toBe(342);
  });

  it("handles quarter row: 2 beads = 0.50", () => {
    expect(calculateValue(makeRows({ 0: 2 }))).toBe(0.5);
  });

  it("handles 1234.75 (mixed)", () => {
    // 1234.75 = 1×1000 + 2×100 + 3×10 + 4×1 + 3×0.25
    expect(calculateValue(makeRows({ 4: 1, 3: 2, 2: 3, 1: 4, 0: 3 }))).toBe(1234.75);
  });

  it("handles all-max beads = MAX_VALUE", () => {
    const allMax = ROW_CONFIG.map((r) => r.totalBeads);
    expect(calculateValue(allMax)).toBe(MAX_VALUE);
  });

  it("does not return negative values", () => {
    expect(calculateValue(makeRows())).toBeGreaterThanOrEqual(0);
  });

  it("handles floating-point edge case: 0.25 × 1 = 0.25", () => {
    expect(calculateValue(makeRows({ 0: 1 }))).toBe(0.25);
  });
});

// ─── valueToRows ──────────────────────────────────────────────────────────────
describe("valueToRows", () => {
  it("converts 0 to all-zero rows", () => {
    expect(valueToRows(0)).toEqual(makeRows());
  });

  it("converts 1 to units row = 1", () => {
    const rows = valueToRows(1);
    expect(rows[1]).toBe(1);
    expect(rows.filter((_, i) => i !== 1).every((v) => v === 0)).toBe(true);
  });

  it("converts 342 correctly", () => {
    const rows = valueToRows(342);
    expect(rows[3]).toBe(3); // ×100
    expect(rows[2]).toBe(4); // ×10
    expect(rows[1]).toBe(2); // ×1
  });

  it("converts 1234.75 correctly", () => {
    const rows = valueToRows(1234.75);
    expect(rows[4]).toBe(1); // ×1000
    expect(rows[3]).toBe(2); // ×100
    expect(rows[2]).toBe(3); // ×10
    expect(rows[1]).toBe(4); // ×1
    expect(rows[0]).toBe(3); // ×0.25 (3 × 0.25 = 0.75)
  });

  it("clamps negative values to 0", () => {
    expect(valueToRows(-5)).toEqual(makeRows());
  });

  it("clamps above MAX_VALUE", () => {
    const rows = valueToRows(MAX_VALUE + 1_000_000);
    const reconstructed = calculateValue(rows);
    expect(reconstructed).toBeLessThanOrEqual(MAX_VALUE);
  });

  it("round-trips: calculateValue(valueToRows(v)) === v for integers 0–999", () => {
    for (let v = 0; v <= 999; v++) {
      expect(calculateValue(valueToRows(v))).toBe(v);
    }
  });

  it("round-trips for quarter values", () => {
    for (const frac of [0, 0.25, 0.5, 0.75]) {
      const v = 123 + frac;
      expect(calculateValue(valueToRows(v))).toBeCloseTo(v, 4);
    }
  });

  it("rounds to nearest 0.25 (e.g. 1.1 → 1.0 or 1.25)", () => {
    const rows = valueToRows(1.1);
    const result = calculateValue(rows);
    // 1.1 rounded to nearest 0.25 = 1.0
    expect(result).toBe(1.0);
  });
});

// ─── formatValue ──────────────────────────────────────────────────────────────
describe("formatValue", () => {
  it('formats 0 as "0"', () => {
    expect(formatValue(0)).toBe("0");
  });

  it('formats 1234.75 with non-breaking space', () => {
    const result = formatValue(1234.75);
    expect(result).toContain("234");
    expect(result).toContain(".75");
  });

  it("formats integer without decimal", () => {
    expect(formatValue(1000)).toMatch(/1\s*000/);
  });

  it('formats 0.25 as "0.25"', () => {
    const result = formatValue(0.25);
    expect(result).toBe("0.25");
  });

  it('formats 0.5 as "0.50"', () => {
    const result = formatValue(0.5);
    expect(result).toBe("0.50");
  });
});

// ─── ROW_CONFIG integrity ─────────────────────────────────────────────────────
describe("ROW_CONFIG", () => {
  it("has exactly 11 rows", () => {
    expect(ROW_CONFIG.length).toBe(11);
  });

  it("bottom row has 4 beads and multiplier 0.25", () => {
    expect(ROW_CONFIG[0].totalBeads).toBe(4);
    expect(ROW_CONFIG[0].multiplier).toBe(0.25);
  });

  it("all other rows have 10 beads", () => {
    for (let i = 1; i < ROW_CONFIG.length; i++) {
      expect(ROW_CONFIG[i].totalBeads).toBe(10);
    }
  });

  it("multipliers are powers of 10 from row 1 upward", () => {
    for (let i = 1; i < ROW_CONFIG.length; i++) {
      expect(ROW_CONFIG[i].multiplier).toBe(Math.pow(10, i - 1));
    }
  });
});
