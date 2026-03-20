"use client";

import { useState, useRef } from "react";
import { RotateCcw, RotateCw, Trash2, Volume2, VolumeX, Copy, Check } from "lucide-react";
import { formatValue, MAX_VALUE } from "@/lib/abacus";

interface Props {
  value: number;
  canUndo: boolean;
  canRedo: boolean;
  soundEnabled: boolean;
  onSetValue: (v: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onToggleSound: () => void;
}

export function Display({
  value,
  canUndo,
  canRedo,
  soundEnabled,
  onSetValue,
  onUndo,
  onRedo,
  onReset,
  onToggleSound,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setInputVal(value === 0 ? "" : value.toString());
    setEditing(true);
    // Focus after next paint
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commitEdit = () => {
    const raw = inputVal.replace(/\s/g, "").replace(",", ".");
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onSetValue(Math.max(0, Math.min(parsed, MAX_VALUE)));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { setEditing(false); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* permissions denied */ }
  };

  const iconBtn =
    "p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 active:scale-90";
  const iconBtnDisabled = "opacity-25 cursor-not-allowed pointer-events-none";

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex items-center gap-2 shrink-0">
      {/* ── Number display ───────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center cursor-text min-w-0"
        onClick={!editing ? startEdit : undefined}
        title="Нажмите, чтобы ввести число"
        aria-label={`Значение: ${value}. Нажмите для ввода.`}
        role="button"
        tabIndex={editing ? -1 : 0}
        onKeyDown={(e) => !editing && e.key === "Enter" && startEdit()}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-white text-2xl font-display tracking-widest
                       text-center w-full outline-none border-b border-blue-400
                       placeholder-slate-500"
            inputMode="decimal"
            autoFocus
            placeholder="0"
            aria-label="Введите число"
          />
        ) : (
          <span
            className="text-white font-display tracking-widest text-2xl hover:text-blue-200 transition-colors"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value === 0 ? <span className="text-slate-500">0</span> : formatValue(value)}
          </span>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={onUndo} disabled={!canUndo} className={`${iconBtn} ${!canUndo ? iconBtnDisabled : ""}`} aria-label="Отменить" title="Ctrl+Z">
          <RotateCcw size={14} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={`${iconBtn} ${!canRedo ? iconBtnDisabled : ""}`} aria-label="Повторить" title="Ctrl+Y">
          <RotateCw size={14} />
        </button>
        <div className="w-px h-4 bg-slate-600 mx-0.5" />
        <button onClick={onReset} className={iconBtn} aria-label="Сброс" title="Сбросить">
          <Trash2 size={14} />
        </button>
        <button onClick={onToggleSound} className={iconBtn} aria-label={soundEnabled ? "Выкл звук" : "Вкл звук"}>
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button onClick={handleCopy} className={iconBtn} aria-label="Копировать">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
