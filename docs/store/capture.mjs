import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch();

// ── Store assets (opaque backgrounds) ───────────────────────────────────────
const storeAssets = [
  { file: 'icon-128.html',      width: 128,  height: 128,  out: 'icon-128.png' },
  { file: 'promo-small.html',   width: 440,  height: 280,  out: 'promo-small.png' },
  { file: 'promo-marquee.html', width: 1400, height: 560,  out: 'promo-marquee.png' },
];

for (const { file, width, height, out } of storeAssets) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`file://${join(__dirname, file)}`);
  await page.screenshot({
    path: join(__dirname, out),
    clip: { x: 0, y: 0, width, height },
    omitBackground: false,
  });
  await page.close();
  console.log(`✓ ${out}`);
}

// ── Extension icons → public/icon/ (transparent background) ─────────────────
// omitBackground: true preserves the SVG's alpha channel so only the
// rounded-rect bezel and bars are opaque — the corners are fully transparent.
const iconSizes = [16, 32, 48, 96, 128];
const iconFile  = join(__dirname, 'icon-128.html');
const iconsDir  = join(__dirname, '../../public/icon');

for (const size of iconSizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.goto(`file://${iconFile}`);
  await page.screenshot({
    path: join(iconsDir, `${size}.png`),
    clip: { x: 0, y: 0, width: size, height: size },
    omitBackground: true,   // preserve alpha — corners are transparent
  });
  await page.close();
  console.log(`✓ public/icon/${size}.png`);
}

await browser.close();
