#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js не встановлено.\n\nЗавантажте з https://nodejs.org та повторіть запуск." buttons {"OK"} default button 1 with icon stop'
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Встановлюю залежності, це займе 1-2 хвилини..."
  npm install || { echo "Помилка npm install"; read -n 1; exit 1; }
fi

echo ""
echo "Запускаю Dii.Volunteer на http://localhost:3000"
echo "Для зупинки натисніть Ctrl+C"
echo ""

(sleep 4 && open http://localhost:3000) &
npm run dev
