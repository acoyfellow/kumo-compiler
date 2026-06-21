# Observable browser runner

`scripts/observable-browser-runner.mjs` owns browser-process lifecycle, Vite compilation, the UTF-8 one-tree SSR page, canonical standalone CSS, CDP retries and cleanup, trusted input actions, and fail-closed diagnostics.

Family adapters are intentionally small. They construct canonical React fixtures, wire callbacks and clipboard boundaries, and evaluate family-specific contract assertions. They must not start Chrome or implement CDP actions.

The runner accepts contract vectors and exposes trusted `scroll`, `click`, `key`, append/replace typing, `focus`, `blur`, `select`, outside-pointer, viewport and wait operations. Checkpoints use `evaluate` for callback, state, focus, DOM, ARIA/live-region, portal, and node-identity evidence. Synthetic DOM events, hydration suppression, diagnostic filters, component branches, and optimistic result normalization are prohibited.

Every result includes `telemetry.phases` and `telemetry.vectors` (milliseconds). Use these measurements to identify build/startup versus vector costs before changing loop concurrency or caching. Console warnings/errors, runtime exceptions, loading failures, and HTTP responses at or above 400 fail the run.
