# NOVA ONE — Frontend Limit Lab V1

A single-product interactive frontend benchmark designed to run as a static site on GitHub Pages.

## Included interactions
- Cinematic responsive hero
- Canvas ambient particle field
- Custom cursor + magnetic buttons
- Pointer-driven pseudo-3D product tilt
- Finish selector + X-Ray mode
- Interactive hotspots
- Real-time canvas simulation
- Before/after drag comparison
- Product configurator with live calculation
- LocalStorage persistence
- Shareable URL state + Web Share / clipboard fallback
- Animated metrics and SVG chart
- Command palette (Cmd/Ctrl + K)
- Keyboard shortcuts: X = X-Ray, D = debug overlay
- Theme switch
- Fullscreen Browser API
- Minimal WebAudio feedback
- PWA manifest + service worker for install/offline cache
- Reduced-motion accessibility fallback

## Run locally
Use any static web server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages
This project has no build step. Upload the contents of this folder to a GitHub repository and publish from the repository root (or `/docs` if you move the files there).

## Notes
All product claims and calculations are deliberately demo-only. Replace NOVA ONE with a real product after the interaction direction is approved.
