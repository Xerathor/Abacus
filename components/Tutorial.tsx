"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: "👆",
    title: "Добро пожаловать!",
    body: "Это цифровые русские счёты. Бусины двигаются влево — это значит «посчитано». Давайте разберёмся за 30 секунд.",
    hint: null,
  },
  {
    emoji: "←",
    title: "Свайп влево — добавить",
    body: "Проведите пальцем влево по любой спице, чтобы добавить одну бусину. Или нажмите прямо на бусину — она встанет на своё место.",
    hint: "Каждая спица — отдельный разряд числа",
  },
  {
    emoji: "🔢",
    title: "Табло — ввод числа",
    body: "Нажмите на цифровое табло вверху, чтобы ввести любое число напрямую. Счёты автоматически расставят бусины!",
    hint: "Кнопка ↺↻ — отмена и повтор последних действий",
  },
];

export function Tutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onComplete();
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onComplete}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i <= step ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 pb-6 pt-4"
          >
            {/* Emoji / icon */}
            <div className="text-5xl mb-4 text-center">
              {current.emoji}
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {current.title}
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              {current.body}
            </p>

            {current.hint && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm text-blue-700 mb-4">
                💡 {current.hint}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-2">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                  <ArrowLeft size={14} /> Назад
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                  Пропустить
                </button>
              )}

              <button
                onClick={next}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                           text-white rounded-xl px-5 py-2.5 font-semibold text-sm
                           transition-colors active:scale-95"
              >
                {step < STEPS.length - 1 ? (
                  <>Далее <ChevronRight size={16} /></>
                ) : (
                  "Начать!"
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
