# 🧮 Цифровые русские счёты

Интерактивный симулятор традиционных русских счётов с цифровым табло.  
Progressive Web App на Next.js 15, оптимизированная для мобильных устройств.

**Live demo:** https://russian-abacus.vercel.app

---

## Стек технологий

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15 (App Router) + TypeScript |
| Стили | Tailwind CSS |
| UI-компоненты | Radix UI (Dialog, Tabs) |
| Анимации | Framer Motion (spring physics) |
| Состояние | useReducer + localStorage |
| Жесты | Pointer Events API (нативные) |
| Звук | Web Audio API |
| PWA | manifest.json + Service Worker |
| Тесты | Vitest |
| Деплой | Vercel |

---

## Архитектура

```
russian-abacus/
├── app/
│   ├── layout.tsx          # Root layout, PWA meta, SW регистрация
│   ├── page.tsx            # Главная страница: табы, оркестрация
│   └── globals.css         # CSS variables, шрифты, базовые стили
│
├── components/
│   ├── AbacusRussian.tsx   # SVG счёты + логика жестов/клавиатуры
│   ├── AbacusSoroban.tsx   # Соробан-placeholder (v2-ready)
│   ├── Display.tsx         # Цифровое табло + контролы (undo/redo/звук)
│   ├── RulesModal.tsx      # Модальное окно правил + примеры
│   └── Tutorial.tsx        # 3-экранный туториал при первом запуске
│
├── hooks/
│   └── useAbacus.ts        # useReducer: весь стейт + история + localStorage
│
├── lib/
│   ├── abacus.ts           # Чистая логика: calculateValue, valueToRows, format
│   └── audio.ts            # Web Audio API — звук клика бусинки
│
├── tests/
│   └── abacus.test.ts      # Unit-тесты (Vitest) ~25 тестов
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker (network-first + offline fallback)
│   └── icons/              # PWA иконки 192/512 px
│
└── scripts/
    ├── generate-icons.mjs      # Генерация PNG иконок (требует: npm i canvas)
    └── generate-icons-svg.mjs  # SVG-иконки без зависимостей
```

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-username/russian-abacus.git
cd russian-abacus

# 2. Установить зависимости
npm install

# 3. (Опционально) сгенерировать PWA-иконки
node scripts/generate-icons-svg.mjs

# 4. Запустить dev-сервер
npm run dev
# → http://localhost:3000

# 5. Запустить тесты
npm test

# 6. Production build
npm run build && npm start
```

---

## Деплой на Vercel

```bash
# Через CLI
npx vercel --prod

# Или: подключить GitHub репозиторий на vercel.com
# Vercel автоматически обнаружит Next.js и задеплоит
```

Иконки для PWA нужно **закоммитить в репозиторий** до деплоя:

```bash
node scripts/generate-icons-svg.mjs  # или generate-icons.mjs при наличии canvas
git add public/icons/
git commit -m "feat: add PWA icons"
```

---

## Функциональность

### Русские счёты
- **11 спиц**: нижняя — 4 бусины (×0,25), остальные — 10 бусин (×1…×10⁹)
- **Жесты**: свайп влево (+1 бусина), вправо (−1), тап по бусине
- **Клавиатура**: ←→ добавить/убрать, ↑↓ переключить спицу, Del — сбросить ряд
- **Цифровое табло**: форматирование «1 234.75», клик для ручного ввода
- **Undo/Redo**: стек 20 шагов (Ctrl+Z / Ctrl+Y)
- **Звук**: Web Audio синтетический клик (toggle в тулбаре)
- **Автосохранение**: localStorage, состояние восстанавливается при возврате
- **Туториал**: 3 экрана при первом запуске

### Японские счёты (v2)
- Placeholder с описанием соробана
- Компонент `AbacusSoroban.tsx` с готовыми TypeScript-типами для быстрой реализации

### PWA
- Установка на главный экран (Add to Home Screen)
- Offline-режим через Service Worker
- Иконки 192 × 512 px, тема цвета синяя (#1e3a8a)

---

## Тесты

```bash
npm test
```

25+ unit-тестов охватывают:
- `calculateValue` — все разряды, комбинации, граничные случаи
- `valueToRows` — round-trip для 0–999, дробные значения, clamping
- `formatValue` — форматирование пробелами и точкой
- `ROW_CONFIG` — структурная валидность конфигурации

---

## Добавление японских счётов (соробан) в v2

1. Реализовать логику в `lib/soroban.ts` (типы уже есть в `AbacusSoroban.tsx`)
2. Заменить содержимое `components/AbacusSoroban.tsx` на интерактивный компонент
3. Добавить `useSoroban` hook по образцу `useAbacus`
4. Подключить в `app/page.tsx` — табы уже готовы

---

## Лицензия

MIT — свободное использование и модификация.






==================================================









Есть три способа — выбирайте по ситуации:

---

## Способ 1 — Быстрый (SVG, без зависимостей)

Уже включён в проект, просто запустите:

```bash
node scripts/generate-icons-svg.mjs
```

Создаст файлы в `public/icons/`. SVG-иконки работают в большинстве браузеров, но **не все PWA-установщики их принимают** (iOS требует PNG).

---

## Способ 2 — PNG через `sharp` (рекомендую)

`sharp` — лёгкая библиотека, не требует системных зависимостей:

```bash
npm install -D sharp
```

Создайте файл `scripts/generate-icons-sharp.mjs`:

```js
import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#1e3a8a"/>
  <line x1="64" y1="154" x2="448" y2="154" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
  <line x1="64" y1="230" x2="448" y2="230" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
  <line x1="64" y1="306" x2="448" y2="306" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
  <line x1="64" y1="382" x2="448" y2="382" stroke="rgba(255,255,255,.35)" stroke-width="14" stroke-linecap="round"/>
  <circle cx="100" cy="154" r="26" fill="#60a5fa"/>
  <circle cx="152" cy="154" r="26" fill="#60a5fa"/>
  <circle cx="204" cy="154" r="26" fill="#60a5fa"/>
  <circle cx="100" cy="230" r="26" fill="#60a5fa"/>
  <circle cx="152" cy="230" r="26" fill="#60a5fa"/>
  <circle cx="100" cy="306" r="26" fill="#60a5fa"/>
  <circle cx="152" cy="306" r="26" fill="#60a5fa"/>
  <circle cx="204" cy="306" r="26" fill="#60a5fa"/>
  <circle cx="256" cy="306" r="26" fill="#60a5fa"/>
  <circle cx="100" cy="382" r="26" fill="#60a5fa"/>
  <circle cx="412" cy="154" r="26" fill="rgba(255,255,255,.15)"/>
  <circle cx="412" cy="230" r="26" fill="rgba(255,255,255,.15)"/>
  <circle cx="412" cy="306" r="26" fill="rgba(255,255,255,.15)"/>
  <circle cx="412" cy="382" r="26" fill="rgba(255,255,255,.15)"/>
  <circle cx="360" cy="382" r="26" fill="rgba(255,255,255,.15)"/>
</svg>`;

const buf = Buffer.from(svg);

for (const size of [192, 512]) {
  await sharp(buf)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`✓ icon-${size}.png`);
}
```

Запустите:
```bash
node scripts/generate-icons-sharp.mjs
```

---

## Способ 3 — Своя иконка (логотип/картинка)

Если у вас есть готовый PNG или SVG файл:

```bash
npm install -D sharp
```

```js
// scripts/resize-icon.mjs
import sharp from "sharp";

// Замените на путь к вашему файлу (PNG или SVG)
const SOURCE = "my-logo.png";

for (const size of [192, 512]) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: "#1e3a8a" })
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`✓ icon-${size}.png`);
}
```

---

## После генерации — не забудьте закоммитить

```bash
git add public/icons/
git commit -m "feat: add PWA icons"
git push
```

Vercel подхватит иконки автоматически при следующем деплое. Если деплоите вручную через `npx vercel --prod` — иконки уже будут в папке `public/`.

---

**Итого:** для быстрого старта — Способ 1 (уже есть в проекте). Для нормальных PNG под iOS — Способ 2, это 5 минут работы.