"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { EXAMPLE_VALUES } from "@/lib/abacus";

interface Props {
  open: boolean;
  onClose: () => void;
  onSetValue: (v: number) => void;
}

export function RulesModal({ open, onClose, onSetValue }: Props) {
  const handleExample = (value: number) => {
    onSetValue(value);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />

        {/* Content */}
        <Dialog.Content
          className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2
                     sm:-translate-y-1/2 sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl
                     bg-white z-50 overflow-y-auto animate-slide-up outline-none"
          aria-describedby="rules-desc"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <Dialog.Title className="text-xl font-semibold text-slate-800">
              Правила счётов
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div id="rules-desc" className="px-6 py-5 space-y-6 text-slate-700 text-[15px] leading-relaxed">

            {/* ── Устройство счётов ─────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-2">Устройство счётов</h2>
              <p>
                Традиционные русские счёты имеют <strong>11 горизонтальных спиц</strong>.
                Нижняя спица — особая: на ней всего <strong>4 бусины</strong>, каждая равна
                четверти (0,25). Остальные 10 спиц несут по 10 бусин.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold w-8 text-right">×1Г</span>
                  <span>━━ ○ ○ ○ ○ ○ ● ● ● ● ● ━━</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold w-8 text-right">…</span>
                  <span className="text-slate-400">средние строки</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold w-8 text-right">×1</span>
                  <span>━━ ○ ○ ○ ○ ○ ○ ● ● ● ● ━━</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold w-8 text-right">¼</span>
                  <span>━━ ○ ○ ● ● ━━</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                <strong>●</strong> — бусина сдвинута <em>влево</em> (активна, учитывается).&nbsp;
                <strong>○</strong> — бусина справа (не учитывается).
              </p>
            </section>

            {/* ── Разряды ──────────────────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-2">Разряды (снизу вверх)</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {[
                  ["Нижняя", "×0,25 (четверть)"],
                  ["2-я снизу", "×1 (единицы)"],
                  ["3-я снизу", "×10 (десятки)"],
                  ["4-я снизу", "×100 (сотни)"],
                  ["5-я снизу", "×1 000"],
                  ["6-я снизу", "×10 000"],
                  ["7-я снизу", "×100 000"],
                  ["8-я снизу", "×1 000 000"],
                  ["9-я снизу", "×10 000 000"],
                  ["10-я снизу", "×100 000 000"],
                  ["Верхняя", "×1 000 000 000"],
                ].map(([row, val]) => (
                  <div key={row} className="contents">
                    <span className="text-slate-500">{row}</span>
                    <span className="font-mono text-blue-700">{val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Как установить число ─────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-2">
                Как установить число
              </h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>Сбросьте счёты — сдвиньте все бусины вправо (кнопка 🗑 или «Сброс»).</li>
                <li>Найдите нужный разряд (спицу). Например, для 342 нужны спицы ×100, ×10, ×1.</li>
                <li>
                  Сдвиньте влево столько бусин, сколько единиц в этом разряде:
                  3 на спице ×100, 4 на ×10, 2 на ×1.
                </li>
                <li>Цифровое табло сверху покажет результат автоматически.</li>
              </ol>
              <p className="mt-2 text-sm text-slate-500">
                <strong>Совет:</strong> Нажмите на табло, чтобы ввести число напрямую — счёты
                установятся автоматически.
              </p>
            </section>

            {/* ── Сложение и вычитание ─────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-2">
                Сложение и вычитание
              </h2>
              <p>
                <strong>Сложение:</strong> установите первое число, затем прибавляйте разряд за
                разрядом. Если бусин в разряде не хватает — делайте перенос: уберите 10 бусин в
                данном разряде и добавьте 1 бусину в следующий.
              </p>
              <p className="mt-2">
                <strong>Вычитание:</strong> обратная операция — убирайте бусины разряд за
                разрядом. Если бусин не хватает — заём: уберите 1 бусину из старшего разряда,
                добавьте 10 в текущий.
              </p>
            </section>

            {/* ── Примеры чисел ────────────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-3">
                Примеры — нажмите, чтобы установить
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_VALUES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExample(ex.value)}
                    className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3
                               text-blue-800 font-mono text-lg font-semibold
                               hover:border-blue-400 hover:bg-blue-100 transition-colors
                               active:scale-95"
                    aria-label={`Установить ${ex.label}`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Отличие от соробана ──────────────────── */}
            <section>
              <h2 className="font-semibold text-slate-900 text-base mb-2">
                Отличие от японских счётов (соробан)
              </h2>
              <p>
                Соробан имеет вертикальные спицы с 5 бусинами каждая (1 верхняя = 5 +
                4 нижних = 1 каждая). Русские счёты — горизонтальные, десятичные, без
                пятёрочной бусины. Максимальное значение соробана на стандартном экземпляре —
                9 999 999 999, у русских счётов этого симулятора — 11 111 111 111.
              </p>
            </section>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
