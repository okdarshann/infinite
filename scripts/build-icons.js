#!/usr/bin/env node
/*
 * Turns deserve.png into the app icon and splash sources that
 * `npx capacitor-assets generate` expects in assets/.
 *
 * Run it whenever the logo changes, then:
 *   node scripts/build-icons.js
 *   npx capacitor-assets generate --android --ios \
 *     --iconBackgroundColor '#0a0f16' --splashBackgroundColor '#0a0f16'
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'deserve.png');
const OUT = path.join(ROOT, 'assets');
const BACKGROUND = '#0a0f16';

function canvas(size) {
  return sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND }
  });
}

function logo(size) {
  return sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(SOURCE)) throw new Error('missing deserve.png at the repo root');

  const ICON = 1024;
  const SPLASH = 2732;

  const icon = await logo(Math.round(ICON * 0.66));
  await canvas(ICON)
    .composite([{ input: icon, gravity: 'centre' }])
    .png()
    .toFile(path.join(OUT, 'icon-only.png'));

  // Adaptive icon (Android): the foreground is masked to a circle or squircle,
  // so the mark keeps a wide margin around it.
  await logo(Math.round(ICON * 0.52))
    .then((buf) => sharp(buf).png().toFile(path.join(OUT, 'icon-foreground.png')));
  await canvas(ICON).png().toFile(path.join(OUT, 'icon-background.png'));

  const splashMark = await logo(Math.round(SPLASH * 0.22));
  for (const name of ['splash.png', 'splash-dark.png']) {
    await canvas(SPLASH)
      .composite([{ input: splashMark, gravity: 'centre' }])
      .png()
      .toFile(path.join(OUT, name));
  }

  console.log('assets/ written: icon-only, icon-foreground, icon-background, splash, splash-dark');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
