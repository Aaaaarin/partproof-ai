# PartProof AI

An interactive, phone-first 3D pre-inspection prototype for the ZEISS Beyond Code 2026 hackathon.

**Live application:** https://Aaaaarin.github.io/partproof-ai/

## Run

Node.js 22 or newer is recommended.

    npm ci
    npm run dev

Open http://localhost:3000. To compile the static production application:

    npm run typecheck
    npm run build

The static export is in the out folder. GitHub Actions builds and deploys it to GitHub Pages on every push to main. The workflow sets NEXT_PUBLIC_BASE_PATH=/partproof-ai; leave that variable empty for root-domain deployment.

The build script also adds normalized static segment aliases on Windows, addressing Next.js issue #85374. Native Linux deployment builds already emit the correct segment paths.

## Product walkthrough

1. Select a component on **Overview** and inspect its nominal dimensions and rotating CAD preview.
2. Open **Calibration board** to print a real OpenCV ChArUco board at 100% scale.
3. Click **Start new inspection** and use the demo capture, or select one MP4 / JPEG sequence.
4. Watch four capture checks followed by three 1.5-second processing steps.
5. In **Inspection studio**, switch between metallic CAD and deviation heatmap, orbit, zoom, reset, toggle wireframe or expand the viewer.
6. Review the +0.38 mm flange deviation and the 91% confidence surface finding.
7. Open **Export PDF Pre-Inspection Report**, then **Print / Save PDF**. The layout is optimized for A4.
8. **Forward Package to ZEISS INSPECT** opens a transparent demo handoff and downloads a structured JSON review package.

## Routes and source

| Route         | Implementation                 |
| ------------- | ------------------------------ |
| /             | src/components/dashboard.tsx   |
| /inspection/  | src/components/studio.tsx      |
| /report/      | src/components/report.tsx      |
| /calibration/ | src/components/calibration.tsx |

- src/components/part-viewer.tsx: procedural impeller/rotor, vertex-color deviation mapping, orbit controls, lighting and annotations.
- src/components/capture-modal.tsx: local file selection, validation, timed processing and inspection creation.
- src/components/provider.tsx: inspection persistence, snapshot storage and service worker registration.
- src/lib/data.ts: component presets and deterministic sample data.
- src/app/globals.css: responsive industrial UI and A4 print layouts, with Tailwind CSS available.
- public/sw.js and public/manifest.webmanifest: installable PWA and offline caching of visited assets.
- scripts/generate-assets.py: repeatable generation of ChArUco board and PWA icons.
- tests/prototype.spec.ts: end-to-end capture, upload, traceability, downloads, printing and mobile checks.

## Stack

Next.js App Router, TypeScript, React 19, Tailwind CSS 4, Lucide icons, Three.js, React Three Fiber, Drei, Playwright. No server, API key, external model download or paid service is required.

The 3D model uses an extruded flange with bolt holes, a lathed hub and individually curved blades. A deterministic per-vertex color field highlights the flange zone. This is authored demo geometry, not an imported production CAD file.

## Simulation boundaries

All inspection metrics and model outputs are simulated. Uploaded media remains in the browser and is not analyzed. COLMAP, ICP and Anomalib steps are timed demonstrations, not backend invocations. JSON export is a generic manual review package; no ZEISS API is called and it is not a proprietary ZEISS INSPECT file. ZEISS branding identifies the hackathon context; this independent prototype is not endorsed by ZEISS.

Inspection metadata persists in localStorage and the heatmap snapshot in sessionStorage. Clear site data to reset. The application keeps only the latest inspection. PWA offline behavior requires an initial online visit; visit each route to cache its JavaScript.

## Verification

Start the local server, then:

    npm run test:e2e

Tests use an installed Chrome browser. To test a deployed instance, set TEST_URL to its URL. Screenshots and print PDFs are generated under qa/ (gitignored).

To regenerate board/icon assets:

    pip install opencv-contrib-python numpy
    python scripts/generate-assets.py

The ChArUco board is 7 × 5 squares, with 20 mm squares and 14 mm markers from DICT_4X4_50. Its 17 markers are verified during asset generation.
