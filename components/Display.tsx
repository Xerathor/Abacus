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
    <div className="rounded-xl bg-slate-800 px-5 py-4 shadow-inner border border-slate-700 mb-4">
      {/* ── Number display ───────────────────────────────────────── */}
      <div
        className="text-center min-h-[3.5rem] flex items-center justify-center cursor-text group"
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
            className="bg-transparent text-white text-4xl sm:text-5xl font-display tracking-widest
                       text-center w-full outline-none border-b-2 border-blue-400 pb-1
                       placeholder-slate-500"
            inputMode="decimal"
            autoFocus
            placeholder="0"
            aria-label="Введите число"
          />
        ) : (
          <span
            className="text-white font-display tracking-widest text-4xl sm:text-5xl
                       group-hover:text-blue-200 transition-colors duration-200"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value === 0 ? (
              <span className="text-slate-500">0</span>
            ) : (
              formatValue(value)
            )}
          </span>
        )}
      </div>

      {/* ── Controls row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1 mt-3">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`${iconBtn} ${!canUndo ? iconBtnDisabled : ""}`}
          aria-label="Отменить"
          title="Отменить (Ctrl+Z)"
        >
          <RotateCcw size={16} />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`${iconBtn} ${!canRedo ? iconBtnDisabled : ""}`}
          aria-label="Повторить"
          title="Повторить (Ctrl+Y)"
        >
          <RotateCw size={16} />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-1" />

        {/* Reset */}
        <button
          onClick={onReset}
          className={iconBtn}
          aria-label="Сброс в ноль"
          title="Сбросить счёты"
        >
          <Trash2 size={16} />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className={iconBtn}
          aria-label={soundEnabled ? "Выключить звук" : "Включить звук"}
          title={soundEnabled ? "Звук включён" : "Звук выключен"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className={iconBtn}
          aria-label="Скопировать число"
          title="Скопировать в буфер обмена"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      {/* Hint */}
      {!editing && (
        <p className="text-center text-slate-500 text-xs mt-2">
          Нажмите на число, чтобы ввести вручную
        </p>
      )}
    </div>
  );
}
