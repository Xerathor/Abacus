"use client";

import { useState, useEffect, useCallback } from "react";
import { useAbacus } from "@/hooks/useAbacus";
import { AbacusRussian } from "@/components/AbacusRussian";
import { AbacusSoroban } from "@/components/AbacusSoroban";
import { Display } from "@/components/Display";
import { RulesModal } from "@/components/RulesModal";
import { Tutorial } from "@/components/Tutorial";
import { BookOpen } from "lucide-react";

export default function Home() {
  const {
    rows,
    value,
    canUndo,
    canRedo,
    soundEnabled,
    tutorialDone,
    activeTab,
    setRow,
    setValue,
    reset,
    undo,
    redo,
    toggleSound,
    setTab,
    completeTutorial,
  } = useAbacus();

  const [rulesOpen, setRulesOpen] = useState(false);
  // Show tutorial only client-side (after hydration) to avoid SSR mismatch
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!tutorialDone) setShowTutorial(true);
  }, [tutorialDone]);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  const handleGlobalKey = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape") {
        setRulesOpen(false);
      }
    },
    [undo, redo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  return (
    <main className="h-dvh bg-[#b8c8d8] flex flex-col overflow-hidden">

      {/* ── Display strip (top) ──────────────────────────────────────────── */}
      {activeTab === "russian" && (
        <Display
          value={value}
          canUndo={canUndo}
          canRedo={canRedo}
          soundEnabled={soundEnabled}
          onSetValue={setValue}
          onUndo={undo}
          onRedo={redo}
          onReset={reset}
          onToggleSound={toggleSound}
        />
      )}

      {/* ── Abacus (fills all remaining space) ──────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "russian" ? (
          <AbacusRussian
            rows={rows}
            soundEnabled={soundEnabled}
            onSetRow={setRow}
          />
        ) : (
          <AbacusSoroban />
        )}
      </div>

      {/* ── Bottom toolbar ───────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-4 h-11 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 shrink-0">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-700/60 rounded-lg p-0.5" role="tablist">
          {(["russian", "soroban"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                ${activeTab === tab
                  ? "bg-slate-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              {tab === "russian" ? "Русские счёты" : "Соробан"}
            </button>
          ))}
        </div>

        {/* Rules button */}
        <button
          onClick={() => setRulesOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400
                     hover:text-white hover:bg-white/10 transition-colors text-xs"
          aria-label="Открыть правила"
        >
          <BookOpen size={13} />
          <span>Правила</span>
        </button>
      </nav>

      {/* ── Modals / overlays ─────────────────────────────────────────────── */}
      <RulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        onSetValue={(v) => { setValue(v); setRulesOpen(false); }}
      />

      {showTutorial && (
        <Tutorial onComplete={handleCompleteTutorial} />
      )}
    </main>
  );
}
