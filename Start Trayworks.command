#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  print 'Trayworks needs Node.js 22 or newer. Install the LTS release from https://nodejs.org, then reopen this launcher.'
  read '?Press Return to close.'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  print 'Installing dependencies. This first setup needs an internet connection.'
  npm ci --no-audit --no-fund
fi
if [[ ! -f dist/index.html ]]; then npm run build; fi
export PORT="${PORT:-4173}"
if node --input-type=module -e 'const r=await fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).catch(()=>null);if(!r?.ok)process.exit(1);const d=await r.json();process.exit(d.app==="trayworks"?0:1)' 2>/dev/null; then
  open "http://127.0.0.1:$PORT"
  print 'Trayworks is already running. This window can be closed.'
  exit 0
fi
print "Starting Trayworks at http://127.0.0.1:$PORT"
print 'Keep this Terminal window open while using the designer. Press Control-C to stop.'
(
  for attempt in {1..30}; do
    if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
      open "http://127.0.0.1:$PORT"
      break
    fi
    sleep 0.3
  done
) &
exec npm start
