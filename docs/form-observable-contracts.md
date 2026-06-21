# Form observable contracts

Six Kumo 2.5.2 contracts cover `Input`, `InputArea`, `Field`, `SensitiveInput`, `ClipboardText`, and `InputGroup`: 16 vectors total (6 action-free canonical SSR vectors and 10 trusted Chrome/CDP interaction vectors). They bind preserved type/runtime SHA-256 provenance.

The generic fixture/action/assertion language now supports native `type` and `focus` actions and simple attribute selectors, while rejecting unknown actions, missing typed text, and compound selectors. Chrome exercises native focus/label activation, edits and value callbacks, masked/reveal/Escape behavior, copy callbacks and live status, deterministic `navigator.clipboard.writeText` payloads, and InputGroup compositions/focus. Hydrated root identity, console/network diagnostics, and deliberately wrong assertions are checked.

Exact inherited/vendor unknowns are Base UI callback detail objects, browser autofill and password-manager behavior, IME/composition and selection-range edge cases, RTL, clipboard rejection, and platform accessibility-tree differences. These are recorded in every contract rather than inferred.
