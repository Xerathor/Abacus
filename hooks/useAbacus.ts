"use client";

import { useReducer, useEffect, useCallback } from "react";
import { ROW_CONFIG, NUM_ROWS, calculateValue, valueToRows } from "@/lib/abacus";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActiveTab = "russian" | "soroban";

export interface AbacusState {
  rows: number[];        // leftCount per row (0 = all right, max = all left)
  past: number[][];      // undo stack (snapshots of rows)
  future: number[][];    // redo stack
  soundEnabled: boolean;
  tutorialDone: boolean;
  activeTab: ActiveTab;
}

type Action =
  | { type: "SET_ROW"; rowIndex: number; leftCount: number }
  | { type: "SET_VALUE"; value: number }
  | { type: "RESET" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_SOUND" }
  | { type: "SET_TAB"; tab: ActiveTab }
  | { type: "COMPLETE_TUTORIAL" }
  | { type: "HYDRATE"; saved: Partial<AbacusState> };

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_ROWS = ROW_CONFIG.map(() => 0);
const MAX_HISTORY = 20;
const STORAGE_KEY = "russian-abacus-v1";

function makeInitialState(): AbacusState {
  return {
    rows: INITIAL_ROWS,
    past: [],
    future: [],
    soundEnabled: true,
    tutorialDone: false,
    activeTab: "russian",
  };
}

// ─── History helpers ──────────────────────────────────────────────────────────

function pushPast(past: number[][], current: number[]): number[][] {
  const next = [...past, current];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AbacusState, action: Action): AbacusState {
  switch (action.type) {
    case "SET_ROW": {
      const { rowIndex, leftCount } = action;
      const clamped = Math.max(0, Math.min(leftCount, ROW_CONFIG[rowIndex].totalBeads));
      if (state.rows[rowIndex] === clamped) return state;
      const newRows = [...state.rows];
      newRows[rowIndex] = clamped;
      return { ...state, rows: newRows, past: pushPast(state.past, state.rows), future: [] };
    }
    case "SET_VALUE": {
      const newRows = valueToRows(action.value);
      return { ...state, rows: newRows, past: pushPast(state.past, state.rows), future: [] };
    }
    case "RESET": {
      if (state.rows.every((v) => v === 0)) return state;
      return { ...state, rows: INITIAL_ROWS, past: pushPast(state.past, state.rows), future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        rows: previous,
        past: state.past.slice(0, -1),
        future: [state.rows, ...state.future].slice(0, MAX_HISTORY),
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        rows: next,
        past: pushPast(state.past, state.rows),
        future: rest,
      };
    }
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "COMPLETE_TUTORIAL":
      return { ...state, tutorialDone: true };
    case "HYDRATE":
      return { ...state, ...action.saved, past: [], future: [] };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAbacus() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  // Hydrate from localStorage (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AbacusState>;
      // Validate rows array
      if (
        Array.isArray(parsed.rows) &&
        parsed.rows.length === NUM_ROWS &&
        parsed.rows.every((v) => typeof v === "number")
      ) {
        dispatch({ type: "HYDRATE", saved: parsed });
      }
    } catch {
      // Ignore corrupt storage
    }
  }, []);

  // Persist to localStorage whenever relevant state changes
  useEffect(() => {
    try {
      const toSave: Partial<AbacusState> = {
        rows: state.rows,
        soundEnabled: state.soundEnabled,
        tutorialDone: state.tutorialDone,
        activeTab: state.activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Storage unavailable (private mode, quota exceeded, etc.)
    }
  }, [state.rows, state.soundEnabled, state.tutorialDone, state.activeTab]);

  // Derived value
  const value = calculateValue(state.rows);

  // Stable action callbacks
  const setRow = useCallback(
    (rowIndex: number, leftCount: number) =>
      dispatch({ type: "SET_ROW", rowIndex, leftCount }),
    [],
  );
  const setValue = useCallback(
    (v: number) => dispatch({ type: "SET_VALUE", value: v }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const toggleSound = useCallback(() => dispatch({ type: "TOGGLE_SOUND" }), []);
  const setTab = useCallback(
    (tab: ActiveTab) => dispatch({ type: "SET_TAB", tab }),
    [],
  );
  const completeTutorial = useCallback(
    () => dispatch({ type: "COMPLETE_TUTORIAL" }),
    [],
  );

  return {
    rows: state.rows,
    value,
    soundEnabled: state.soundEnabled,
    tutorialDone: state.tutorialDone,
    activeTab: state.activeTab,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setRow,
    setValue,
    reset,
    undo,
    redo,
    toggleSound,
    setTab,
    completeTutorial,
  };
}
