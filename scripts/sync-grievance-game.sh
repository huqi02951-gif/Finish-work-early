#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAME_SRC="${GAME_SRC:-"$ROOT_DIR/../Workplace-Grievance-Recycling-Station-main/src"}"
DEST="$ROOT_DIR/components/games/grievance"

if [[ ! -d "$GAME_SRC" ]]; then
  echo "Game source not found: $GAME_SRC" >&2
  exit 1
fi

mkdir -p "$DEST/components" "$DEST/assets"

rsync -a --delete "$GAME_SRC/components/" "$DEST/components/"
rsync -a --delete "$GAME_SRC/assets/" "$DEST/assets/"

for file in types.ts data.ts artPresets.ts levelMechanics.ts officeProps.ts; do
  cp "$GAME_SRC/$file" "$DEST/$file"
done

cp "$GAME_SRC/App.tsx" "$DEST/GameRoot.tsx"

perl -pi -e "s/from 'motion\\/react'/from 'framer-motion'/g; s/from \\\"motion\\/react\\\"/from \\\"framer-motion\\\"/g" \
  "$DEST/GameRoot.tsx" "$DEST"/components/*.tsx
perl -pi -e "s/export default function App/export default function GameRoot/g; s/behavior: 'instant'/behavior: 'auto'/g" \
  "$DEST/GameRoot.tsx"

DEST="$DEST" node <<'NODE'
const fs = require('fs');
const path = require('path');

const gameRootPath = path.join(process.env.DEST, 'GameRoot.tsx');
let source = fs.readFileSync(gameRootPath, 'utf8');

source = source.replace("import { Sparkles } from 'lucide-react';\n", '');
source = source.replace(
  /const \[maxLevelUnlocked, setMaxLevelUnlocked\] = useState\(\(\) => \{\n\s*const savedLevel = Number\(window\.localStorage\.getItem\('officeHellMaxLevelUnlocked'\)\);\n\s*return Number\.isFinite\(savedLevel\) && savedLevel >= 1 \? Math\.min\(18, savedLevel\) : 1;\n\s*\}\);/,
  "const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(() => 18);"
);
source = source.replace(
  'min-h-screen font-sans tracking-tight antialiased flex flex-col justify-between transition-colors duration-500',
  'min-h-[calc(100dvh-3.5rem)] font-sans tracking-tight antialiased flex flex-col transition-colors duration-500'
);
source = source.replace(
  "flex-1 w-full mx-auto flex flex-col py-4 relative z-10 ${isBattlePage ? 'max-w-[1560px] px-2 sm:px-4 justify-start' : 'max-w-lg justify-center'}",
  "flex-1 w-full mx-auto flex flex-col relative z-10 ${isBattlePage ? 'max-w-[1560px] px-0 sm:px-2 justify-start' : 'max-w-lg justify-center py-4'}"
);
source = source.replace(
  /\n\s*\{\/\* Decorative header ornament \*\/\}[\s\S]*?\n\s*\{\/\* Primary interactive screens viewport \*\/\}/,
  '\n      {/* Primary interactive screens viewport */}'
);
source = source.replace(
  /\n\s*\{\/\* Decorative footer \*\/\}[\s\S]*?\n\s*<\/footer>\n/,
  '\n'
);
source = source.replace(
  "const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(() => 18);",
  "// 测试阶段先全开 18 层；正式上线再恢复锁关机制。\n  const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(() => 18);"
);

fs.writeFileSync(gameRootPath, source);
NODE

GAME_SRC="$GAME_SRC" DEST="$DEST" node <<'NODE'
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const source = path.join(process.env.GAME_SRC, 'index.css');
const dest = path.join(process.env.DEST, 'grievance.css');
const root = postcss.parse(fs.readFileSync(source, 'utf8'), { from: source });
const prefix = '.grievance-game-root';

root.walkAtRules((rule) => {
  if (rule.name === 'import' && rule.params.includes('tailwindcss')) rule.remove();
  if (rule.name === 'theme') rule.remove();
});

root.walkRules((rule) => {
  let parent = rule.parent;
  while (parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return;
    parent = parent.parent;
  }

  rule.selectors = rule.selectors.map((selector) => {
    const trimmed = selector.trim();
    if (!trimmed || trimmed.startsWith(prefix)) return trimmed;
    if (trimmed === ':root') return prefix;
    return `${prefix} ${trimmed}`;
  });
});

const vars = postcss.rule({ selector: prefix });
vars.append({ prop: '--font-gothic', value: '"Creepster", cursive, sans-serif' });
vars.append({ prop: '--font-brush', value: '"Ma Shan Zheng", "ZCOOL XiaoWei", serif' });
vars.append({ prop: 'isolation', value: 'isolate' });

let insertAfter = null;
for (const node of root.nodes) {
  if (node.type === 'atrule' && node.name === 'import') insertAfter = node;
}
if (insertAfter) root.insertAfter(insertAfter, vars);
else root.prepend(vars);

fs.writeFileSync(dest, root.toString());
NODE

cat >> "$DEST/grievance.css" <<'CSS'

@media (max-width: 620px) {
  .grievance-game-root #battle_screen_root.arcade-shell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: calc(100dvh - 3.5rem);
    min-height: 0;
    overflow: hidden;
    border-width: 0;
    padding: 6px;
  }

  .grievance-game-root #battle_screen_root .arcade-topbar,
  .grievance-game-root #battle_screen_root .hell-rail-panel,
  .grievance-game-root #battle_screen_root .furnace-panel {
    display: none;
  }

  .grievance-game-root #battle_screen_root .arcade-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    flex: 1 1 auto;
    min-height: 0;
    gap: 0;
  }

  .grievance-game-root #battle_screen_root .battle-stage {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .grievance-game-root #battle_screen_root .boss-hud {
    padding: 8px 8px 4px;
  }

  .grievance-game-root #battle_screen_root .boss-title-row {
    align-items: flex-start;
  }

  .grievance-game-root #battle_screen_root .boss-title-row span {
    font-size: 10px;
  }

  .grievance-game-root #battle_screen_root .boss-title-row h2 {
    margin-top: 2px;
    font-size: 20px;
    line-height: 1.05;
  }

  .grievance-game-root #battle_screen_root .threat-multiplier {
    font-size: 20px;
  }

  .grievance-game-root #battle_screen_root .hp-frame {
    height: 18px;
    margin-top: 5px;
  }

  .grievance-game-root #battle_screen_root .hp-frame span {
    font-size: 10px;
  }

  .grievance-game-root #battle_screen_root .boss-stat-row,
  .grievance-game-root #battle_screen_root .sin-tags {
    display: none;
  }

  .grievance-game-root #battle_screen_root .stage-fire-hint {
    top: 62px;
    left: 8px;
    right: 8px;
    gap: 5px;
    max-width: none;
    padding: 5px 7px;
  }

  .grievance-game-root #battle_screen_root .stage-fire-hint b {
    font-size: 13px;
  }

  .grievance-game-root #battle_screen_root .stage-fire-hint span {
    font-size: 9px;
  }

  .grievance-game-root #battle_screen_root .stage-center {
    inset: 86px 0 50px;
  }

  .grievance-game-root #battle_screen_root .target-battle-stack {
    grid-template-columns: minmax(118px, 0.86fr) minmax(150px, 1fr);
    align-items: center;
    align-content: center;
    gap: 4px;
    height: 100%;
    padding: 0 5px;
  }

  .grievance-game-root #battle_screen_root .spinning-target {
    width: min(40vw, 148px);
    min-width: 118px;
    padding: 8px 6px;
  }

  .grievance-game-root #battle_screen_root .target-title {
    margin-bottom: 4px;
  }

  .grievance-game-root #battle_screen_root .target-title span {
    font-size: 10px;
  }

  .grievance-game-root #battle_screen_root .target-disc-wrap {
    max-height: 124px;
  }

  .grievance-game-root #battle_screen_root .target-readout {
    margin-top: 5px;
    grid-template-columns: 1fr;
  }

  .grievance-game-root #battle_screen_root .target-readout span {
    font-size: 9px;
  }

  .grievance-game-root #battle_screen_root .target-mechanic-actions {
    gap: 4px;
    margin-top: 5px;
  }

  .grievance-game-root #battle_screen_root .target-mechanic-actions button {
    min-height: 28px;
    padding: 4px 5px;
    font-size: 9px;
  }

  .grievance-game-root #battle_screen_root .boss-visual-root {
    width: min(54vw, 205px);
    height: min(36dvh, 268px);
  }

  .grievance-game-root #battle_screen_root .boss-title-chip {
    top: 6px;
    min-width: 0;
    padding: 5px 8px;
  }

  .grievance-game-root #battle_screen_root .boss-title-chip span {
    font-size: 13px;
  }

  .grievance-game-root #battle_screen_root .boss-title-chip b {
    font-size: 8px;
  }

  .grievance-game-root #battle_screen_root .active-tag-dock {
    left: 8px;
    right: 8px;
    bottom: 44px;
    gap: 4px;
  }

  .grievance-game-root #battle_screen_root .active-tag-dock button {
    padding: 4px 6px;
    font-size: 9px;
  }

  .grievance-game-root #battle_screen_root .ritual-dock {
    flex: 0 0 auto;
    display: block;
    padding: 5px;
    min-height: 0;
  }

  .grievance-game-root #battle_screen_root .ritual-tool-card,
  .grievance-game-root #battle_screen_root .ritual-stat-strip {
    display: none;
  }

  .grievance-game-root #battle_screen_root .ritual-action-panel {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
  }

  .grievance-game-root #battle_screen_root .ritual-action-panel button {
    min-height: 34px;
    padding: 4px 3px;
    gap: 3px;
    font-size: 9px;
  }

  .grievance-game-root #battle_screen_root .settlement-modal {
    top: 52%;
    width: calc(100% - 20px);
    padding: 14px 10px 10px;
  }

  .grievance-game-root #battle_screen_root .settlement-seal {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .grievance-game-root #battle_screen_root .settlement-modal h3 {
    font-size: 22px;
  }

  .grievance-game-root #battle_screen_root .settlement-modal p {
    font-size: 11px;
  }
}
CSS

echo "Grievance game synced into APEX."
