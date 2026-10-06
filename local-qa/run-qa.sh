#!/bin/sh
set -eu
qa_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$qa_root"
npm run build
node local-qa/prepare.mjs pass3
argent flow run reception-a3-local --device chromium-cdp-9222 --platform chromium --output local-qa/reports/replay-artifacts --json > local-qa/reports/latest-replay.json
