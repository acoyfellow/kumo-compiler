# Canonical React CDP tracer

Captures the trusted Button, Checkbox, Field, and Popover journey matrix at 390, 768, and 1440 CSS pixels. Each trace contains deterministic DOM and sorted attributes/classes, inferred accessibility roles/state, selected computed presentation, rounded geometry, focus and event vectors, stable `data-part` identities, and a real CDP PNG digest.

The implementation reuses the repository's direct Chrome DevTools Protocol architecture: an isolated Chrome profile, zero browser framework dependency, device metrics emulation, runtime evaluation, diagnostics, and `Page.captureScreenshot`. Artifacts are confined to this directory.

## Exact commands

```sh
node experiments/visual-compiler/tracer/tracer.mjs
node experiments/visual-compiler/tracer/self-check.mjs
```

Override Chrome with `CHROME_PATH=/absolute/path/to/chrome`. `results.json` records browser provenance, all 36 content-addressed cells, diagnostics/failures, commands, and cold/mean timings. `self-check.mjs` independently validates coverage, authority, receipt and PNG hashes, and required facts.

## Determinism boundary

Run hashes are deterministic for the recorded browser, OS fonts, viewport, fixture bytes, and package/runtime inputs. Browser provenance is explicit because PNG and computed-style hashes are intentionally not claimed portable across Chrome/font versions. Re-running overwrites only this spike's artifacts and exposes drift as changed hashes.
