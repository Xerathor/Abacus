"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ROW_CONFIG } from "@/lib/abacus";
import { playBeadClick } from "@/lib/audio";

// ─── SVG layout constants ─────────────────────────────────────────────────────
const SVG_W = 580;
const ROW_H = 48;
const SVG_H = ROW_H * ROW_CONFIG.length; // 528

const BEAD_W = 28;   // bead rectangle width
const BEAD_H = 30;   // bead rectangle height
const BEAD_RX = 6;   // corner radius
const BEAD_STEP = BEAD_W + 4; // 32 px between bead centres

const POST_W = 8;
const LEFT_POST_X = 44;
const RIGHT_POST_X = SVG_W - LEFT_POST_X - POST_W - 52;
const ROD_X1 = LEFT_POST_X + POST_W;
const ROD_X2 = RIGHT_POST_X;

const ACTIVE_ORIGIN = ROD_X1 + 2 + BEAD_W / 2;
const INACTIVE_ORIGIN = ROD_X2 - 2 - BEAD_W / 2;

const HIGHLIGHT_SET = new Set([4, 5]);
const SPRING = { type: "spring", stiffness: 520, damping: 28, mass: 0.25 } as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Y-centre of row i in SVG coords (row 0 = bottom, row 10 = top) */
function rowY(rowIndex: number): number {
  return (ROW_CONFIG.length - 1 - rowIndex) * ROW_H + ROW_H / 2;
}

/** X-centre of bead at beadIndex, given leftCount and totalBeads for this row */
function beadCX(beadIndex: number, leftCount: number, totalBeads: number): number {
  if (beadIndex < leftCount) {
    return ACTIVE_ORIGIN + beadIndex * BEAD_STEP;
  } else {
    const j = totalBeads - 1 - beadIndex;
    return INACTIVE_ORIGIN - j * BEAD_STEP;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  rows: number[];
  soundEnabled: boolean;
  onSetRow: (rowIndex: number, leftCount: number) => void;
}

export function AbacusRussian({ rows, soundEnabled, onSetRow }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Gesture state: tracks active swipe per pointer
  const gestureRef = useRef<Map<number, { rowIndex: number; startX: number }>>(new Map());
  // Keyboard: which row is focused
  const focusedRow = useRef<number>(1);

  // ── Sound ──────────────────────────────────────────────────────────────────
  const sound = useCallback(() => {
    if (soundEnabled) playBeadClick();
  }, [soundEnabled]);

  // ── Bead click (derived from pointer up if it's a tap) ────────────────────
  const handleTap = useCallback(
    (rowIndex: number, svgX: number) => {
      const { totalBeads } = ROW_CONFIG[rowIndex];
      const currentLeft = rows[rowIndex];

      let hit = -1;
      for (let i = 0; i < totalBeads; i++) {
        const cx = beadCX(i, currentLeft, totalBeads);
        if (Math.abs(svgX - cx) <= BEAD_W / 2 + 4) {
          hit = i;
          break;
        }
      }
      if (hit < 0) return;

      const newLeft = hit < currentLeft ? hit : hit + 1;
      if (newLeft !== currentLeft) {
        sound();
        onSetRow(rowIndex, newLeft);
      }
    },
    [rows, sound, onSetRow],
  );

  // ── Pointer handlers (on each row's invisible rect) ───────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>, rowIndex: number) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      gestureRef.current.set(e.pointerId, { rowIndex, startX: e.clientX });
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGRectElement>, rowIndex: number) => {
      const g = gestureRef.current.get(e.pointerId);
      gestureRef.current.delete(e.pointerId);
      if (!g || g.rowIndex !== rowIndex) return;

      const deltaX = e.clientX - g.startX;
      const { totalBeads } = ROW_CONFIG[rowIndex];
      const cur = rows[rowIndex];

      if (Math.abs(deltaX) < 12) {
        // Tap: identify clicked bead via SVG coordinate
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = SVG_W / rect.width;
        const svgX = (e.clientX - rect.left) * scaleX;
        handleTap(rowIndex, svgX);
      } else if (deltaX < -12) {
        // Swipe left → add one bead
        const n = Math.min(cur + 1, totalBeads);
        if (n !== cur) { sound(); onSetRow(rowIndex, n); }
      } else {
        // Swipe right → remove one bead
        const n = Math.max(cur - 1, 0);
        if (n !== cur) { sound(); onSetRow(rowIndex, n); }
      }
    },
    [rows, sound, onSetRow, handleTap],
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onKey = (e: KeyboardEvent) => {
      const ri = focusedRow.current;
      const { totalBeads } = ROW_CONFIG[ri];
      const cur = rows[ri];

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          const n = Math.min(cur + 1, totalBeads);
          if (n !== cur) { sound(); onSetRow(ri, n); }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const n = Math.max(cur - 1, 0);
          if (n !== cur) { sound(); onSetRow(ri, n); }
          break;
        }
        case "ArrowUp":
          e.preventDefault();
          focusedRow.current = Math.min(ri + 1, ROW_CONFIG.length - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          focusedRow.current = Math.max(ri - 1, 0);
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          if (cur !== 0) { sound(); onSetRow(ri, 0); }
          break;
      }
    };

    svg.addEventListener("keydown", onKey);
    return () => svg.removeEventListener("keydown", onKey);
  }, [rows, sound, onSetRow]);

  return (
    <div className="w-full h-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="touch-none"
        aria-label="Русские счёты — интерактивный симулятор"
        tabIndex={0}
        style={{ outline: "none" }}
      >
        {/* ── Frame background ─────────────────────────────────────── */}
        <rect
          x={LEFT_POST_X}
          y={0}
          width={RIGHT_POST_X + POST_W - LEFT_POST_X}
          height={SVG_H}
          rx={6}
          fill="#c8d8e8"
          stroke="#a0b4c8"
          strokeWidth={1.5}
        />

        {/* ── Left post ────────────────────────────────────────────── */}
        <rect x={LEFT_POST_X} y={0} width={POST_W} height={SVG_H} rx={3} fill="#2d3f52" />

        {/* ── Right post ───────────────────────────────────────────── */}
        <rect x={RIGHT_POST_X} y={0} width={POST_W} height={SVG_H} rx={3} fill="#2d3f52" />

        {/* ── Rows ─────────────────────────────────────────────────── */}
        {ROW_CONFIG.map((cfg, ri) => {
          const cy = rowY(ri);
          const leftCount = rows[ri];
          const isQuarterRow = ri === 0;

          return (
            <g key={ri} role="group" aria-label={`Ряд ×${cfg.multiplier}, активно ${leftCount} из ${cfg.totalBeads}`}>
              {/* Divider */}
              {ri < ROW_CONFIG.length - 1 && (
                <line
                  x1={LEFT_POST_X + POST_W} y1={cy + ROW_H / 2}
                  x2={RIGHT_POST_X} y2={cy + ROW_H / 2}
                  stroke="#a0b4c8" strokeWidth={1}
                />
              )}

              {/* Rod */}
              <line
                x1={ROD_X1} y1={cy} x2={ROD_X2} y2={cy}
                stroke="#6b7f94"
                strokeWidth={isQuarterRow ? 2.5 : 3}
                strokeLinecap="round"
              />

              {/* Label */}
              <text
                x={SVG_W - 6} y={cy}
                textAnchor="end" dominantBaseline="middle"
                fill={leftCount > 0 ? "#1e40af" : "#6b7f94"}
                fontSize={isQuarterRow ? 12 : 11}
                fontFamily="system-ui, sans-serif"
                fontWeight={leftCount > 0 ? 600 : 400}
                style={{ transition: "fill 0.2s" }}
              >
                {cfg.label}
              </text>

              {/* Hit area */}
              <rect
                x={ROD_X1} y={cy - ROW_H / 2}
                width={ROD_X2 - ROD_X1} height={ROW_H}
                fill="transparent"
                style={{ cursor: "ew-resize", touchAction: "none" }}
                onPointerDown={(e) => handlePointerDown(e, ri)}
                onPointerUp={(e) => handlePointerUp(e, ri)}
              />

              {/* Beads — rounded rectangles */}
              {Array.from({ length: cfg.totalBeads }, (_, bi) => {
                const isActive = bi < leftCount;
                const isHighlighted = !isQuarterRow && HIGHLIGHT_SET.has(bi);
                const cx = beadCX(bi, leftCount, cfg.totalBeads);

                let fill: string;
                let stroke: string;
                if (isActive) {
                  fill = isHighlighted ? "#1e3a5f" : "#2d4a6e";
                  stroke = "#1a2f45";
                } else {
                  fill = isHighlighted ? "#5a6e82" : "#7a8fa3";
                  stroke = "#4a5e72";
                }

                return (
                  <motion.rect
                    key={bi}
                    y={cy - BEAD_H / 2}
                    width={BEAD_W}
                    height={BEAD_H}
                    rx={BEAD_RX}
                    initial={{ x: cx - BEAD_W / 2 }}
                    animate={{ x: cx - BEAD_W / 2 }}
                    transition={SPRING}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={1}
                    style={{ pointerEvents: "none" }}
                    aria-label={`Бусина ${bi + 1}: ${isActive ? "активна" : "неактивна"}`}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
