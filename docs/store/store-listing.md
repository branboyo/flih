# Sampler — Chrome Web Store Listing Copy

## Name
Sampler

## Short Description (132 chars max)
Record tab audio, edit the waveform, and export to your DAW or music software — all without leaving your browser.

## Detailed Description
Heard something in a YouTube video, Bandcamp track, or SoundCloud mix that you want in your next project? Sampler lets you capture it instantly — no screen recording apps, no third-party uploads, no friction.

Click the Sampler icon, hit Record, and your active tab's audio streams directly into the side panel. When the moment is right, stop the recording, trim the waveform to exactly what you need, run it through the FX chain, and export to your downloads folder. Open it in Ableton, Logic, FL Studio, or any other DAW and start making music.

Everything happens locally in your browser. Sampler has no servers, no sign-in, and no analytics. Your audio never leaves your machine.

---

CAPTURE
Record any tab's audio with one click — YouTube, SoundCloud, Bandcamp, Spotify, video calls, browser-based synths, anything playing in Chrome.

EDIT
Trim the waveform down to the exact sample you want. Loop a region to audition it before you export.

PROCESS
Apply an FX chain — pitch shift and more — before export so the sample is ready to drop straight into your project.

EXPORT
Save as WAV to your local downloads folder. Files go exactly where you choose, named and organized the way you work.

PRIVATE BY DESIGN
Recordings are stored in your browser's local IndexedDB — on your device, accessible across sessions, never uploaded anywhere. Unlimited local storage means long sessions are never cut short.

---

PERFECT FOR
• Musicians and producers who sample from the browser
• Beatmakers who want to grab a loop or one-shot without leaving Chrome
• Anyone who needs a quick-capture tool that integrates with their existing DAW workflow

---

## Category
Music & Audio (or Productivity)

## Language
English

---

## Permission Justifications
(Enter these in the "Permissions" section of the Developer Dashboard)

**tabCapture**
Required to access the audio stream from the user's active browser tab for recording. Without this permission, the extension cannot capture any audio.

**storage**
Used to save recordings and user settings (preferred format, download folder name) locally in the browser's IndexedDB. No data leaves the device.

**unlimitedStorage**
Audio recordings can be large (a 10-minute session at 44.1 kHz WAV is ~100 MB). The default 5 MB storage quota would prevent recording anything beyond a few seconds. Users rely on this permission to store recordings locally so they can access files directly from the extension and integrate them with their music software without re-downloading each time.

**downloads**
Writes exported audio files to the user's chosen download folder so they can open them in a DAW or other music application.

**sidePanel**
Displays the Sampler interface in Chrome's side panel so users can record while continuing to browse the tab they are capturing.

---

## Privacy Policy URL
Host docs/store/privacy-policy.html at a public URL (e.g. GitHub Pages) and paste the URL here.

Suggested: https://<your-github-username>.github.io/chromewave/store/privacy-policy.html

---

## Store Assets

Source HTML files are in docs/store/. Export them as PNG before uploading.

### Export instructions (one-time, using Chrome DevTools)

**Icon (128×128)**
1. Open `docs/store/icon-128.html` in Chrome
2. DevTools → More tools → Sensors → set device size 128×128
3. Right-click the SVG → Save image as → `icon-128.png`
   (Or: DevTools Console → `copy(document.querySelector('svg').outerHTML)` then paste into an SVG-to-PNG converter)

**Easier method for all three (recommended):**
Run this in terminal from the project root — requires Node + Puppeteer:

```bash
npx puppeteer-screenshot --url http://localhost:5199/docs/store/icon-128.html \
  --width 128 --height 128 --output docs/store/icon-128.png

npx puppeteer-screenshot --url http://localhost:5199/docs/store/promo-small.html \
  --width 440 --height 280 --output docs/store/promo-small.png

npx puppeteer-screenshot --url http://localhost:5199/docs/store/promo-marquee.html \
  --width 1400 --height 560 --output docs/store/promo-marquee.png
```

Or open each HTML file, use DevTools device emulation to set exact px dimensions, then screenshot.
