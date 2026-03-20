# ProStop — Быстрый деплой на Vercel

## Способ 1: Через GitHub (рекомендуется)

Автоматический деплой при каждом пуше. Preview для каждого PR.

### Шаги:

1. Создай репозиторий на GitHub:
   ```bash
   cd prostop-vercel
   git init
   git add -A
   git commit -m "Initial commit: ProStop PWA"
   gh repo create prostop --public --source=. --push
   ```

2. Открой [vercel.com/new](https://vercel.com/new)

3. Выбери репозиторий `prostop`

4. Настройки (Vercel определит автоматически):
   - Framework Preset: **Other**
   - Build Command: оставить пустым
   - Output Directory: `.` (точка — корень проекта)

5. Нажми **Deploy**

Готово! Каждый `git push` в `main` = автоматический деплой в продакшн.

---

## Способ 2: Через Vercel CLI (быстрый)

Деплой одной командой, без GitHub.

### Шаги:

1. Установи Vercel CLI (если ещё нет):
   ```bash
   npm i -g vercel
   ```

2. Залогинься:
   ```bash
   vercel login
   ```

3. Деплой:
   ```bash
   cd prostop-vercel

   # Preview деплой:
   vercel

   # Продакшн деплой:
   vercel --prod
   ```

Или используй готовый скрипт:
```bash
./deploy.sh          # preview
./deploy.sh --prod   # production
```

---

## Способ 3: Через Vercel Import (самый быстрый)

Если проект уже на GitHub, просто открой:

```
https://vercel.com/new/clone?repository-url=https://github.com/ТВОЙ_ЮЗЕРНЕЙМ/prostop
```

---

## Структура проекта

```
prostop-vercel/
├── index.html          # Главная страница (всё приложение)
├── manifest.json       # PWA-манифест
├── sw.js               # Service Worker (офлайн-режим)
├── icon-192.png        # Иконка 192x192
├── icon-512.png        # Иконка 512x512
├── apple-touch-icon.png
├── vercel.json         # Конфигурация Vercel
├── package.json        # Метаданные проекта
├── deploy.sh           # Скрипт быстрого деплоя
└── .gitignore
```

## Что настроено

- **PWA** — установка на домашний экран, офлайн-режим
- **Service Worker** — кэширование ассетов, offline fallback
- **vercel.json** — правильные заголовки для SW и манифеста, SPA-rewrites, security headers
- **Автодеплой** — при подключении GitHub каждый пуш деплоится автоматически
