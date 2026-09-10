"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AbacusSoroban — Japanese soroban placeholder
// Architecture is prepared: SorobanColumn type and component stub are defined.
// Implement the real soroban in v2 by replacing this file.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types (ready for v2) ─────────────────────────────────────────────────────

export interface SorobanColumn {
  /** 0 = lower bead at bottom, 1 = lower bead touching divider */
  lowerBeads: [number, number, number, number]; // 4 lower beads (each = ×1)
  /** 0 = upper bead at top, 1 = touching divider */
  upperBead: number; // 1 upper bead (= ×5)
}

export type SorobanState = SorobanColumn[]; // 13 columns for a standard soroban

// ─────────────────────────────────────────────────────────────────────────────

export function AbacusSoroban() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Soroban illustration (SVG) */}
      <svg
        viewBox="0 0 280 180"
        width="240"
        className="mb-8 opacity-70"
        aria-hidden="true"
      >
        {/* Frame */}
        <rect x="4" y="4" width="272" height="172" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
        {/* Posts */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            x1={24 + i * 38}
            y1={12}
            x2={24 + i * 38}
            y2={168}
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        {/* Divider */}
        <rect x="4" y="78" width="272" height="6" fill="#334155" />
        {/* Upper beads (above divider) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse
            key={`u${i}`}
            cx={24 + i * 38}
            cy={62}
            rx={13}
            ry={9}
            fill="#3b82f6"
            stroke="#1e40af"
            strokeWidth="1"
          />
        ))}
        {/* Lower beads (below divider) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) =>
          [0, 1, 2, 3].map((j) => (
            <ellipse
              key={`l${i}${j}`}
              cx={24 + i * 38}
              cy={96 + j * 18}
              rx={13}
              ry={7}
              fill={j < 2 ? "#3b82f6" : "#cbd5e1"}
              stroke={j < 2 ? "#1e40af" : "#94a3b8"}
              strokeWidth="1"
            />
          )),
        )}
        {/* "Coming soon" overlay */}
        <rect x="4" y="4" width="272" height="172" rx="8" fill="white" opacity="0.55" />
      </svg>

      <h2 className="text-2xl font-semibold text-slate-700 mb-3">
        Японские счёты (соробан)
      </h2>

      <p className="text-slate-500 max-w-xs leading-relaxed mb-6">
        В разработке. Скоро будет полная версия с{" "}
        <strong className="text-slate-700">1 верхней</strong> и{" "}
        <strong className="text-slate-700">4 нижними</strong> бусинами на каждом
        столбце, система счёта до 9 999 999 999.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm text-blue-700">
          10 столбцов
        </span>
        <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm text-blue-700">
          1+4 бусины
        </span>
        <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm text-blue-700">
          до 9 999 999 999
        </span>
      </div>
    </div>
  );
}
