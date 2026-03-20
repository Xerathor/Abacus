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
    <main className="min-h-dvh bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      {/* ── Header / Tab bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">

          {/* Tabs */}
          <nav className="flex gap-1 bg-slate-100 rounded-xl p-1" role="tablist">
            {(["russian", "soroban"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    activeTab === tab
                      ? "bg-white text-blue-700 shadow-sm font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab === "russian" ? "Русские счёты" : "Соробан"}
              </button>
            ))}
          </nav>

          {/* Rules button */}
          <button
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                       text-slate-600 hover:text-blue-700 hover:bg-blue-50
                       transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
            aria-label="Открыть правила"
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">Правила</span>
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-3 py-4 flex flex-col gap-0">

        {activeTab === "russian" ? (
          <>
            {/* Digital display */}
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

            {/* Abacus */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <AbacusRussian
                rows={rows}
                soundEnabled={soundEnabled}
                onSetRow={setRow}
              />
            </div>

            {/* Footer hint */}
            <p className="text-center text-slate-400 text-xs mt-3 px-4">
              Свайп ← добавить бусину · Свайп → убрать · ↑↓ переключить спицу (клавиатура)
            </p>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <AbacusSoroban />
          </div>
        )}
      </div>

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
