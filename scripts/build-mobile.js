#!/usr/bin/env node
/*
 * Builds www/ - the folder Capacitor packages into the Android and iOS apps.
 *
 * The site at the repo root stays the single source of truth: this script only
 * copies it. Nothing is rewritten here, which is why every page links to
 * something/index.html rather than a bare folder: the WebView's local server does
 * not map a directory URL to its index.html the way GitHub Pages does.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'www');

const ENTRIES = [
  'index.html',
  'calendar.html',
  'deserve.png',
  'static',
  'calendar',
  'lifesheet',
  'notepad',
  'team'
];

// Never shipped inside the app: server config, tests, docs and dev tooling.
const SKIP = new Set(['node_modules', '.git', 'tests', 'scripts', 'android', 'ios', 'www']);

function copy(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      if (SKIP.has(name)) continue;
      copy(path.join(from, name), path.join(to, name));
    }
    return;
  }
  fs.copyFileSync(from, to);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const name of ENTRIES) {
  const from = path.join(ROOT, name);
  if (!fs.existsSync(from)) {
    console.warn('  skipped (missing): ' + name);
    continue;
  }
  copy(from, path.join(OUT, name));
}

const pages = fs.readdirSync(OUT, { withFileTypes: true });
console.log('www/ built from the site at the repo root: ' + pages.map((p) => p.name).join(', '));
