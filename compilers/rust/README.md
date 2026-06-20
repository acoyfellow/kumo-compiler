# Kumo Rust planner

A protocol-v1 compiler candidate pinned to `rustc 1.94.1`. It validates a request and `kumo.ir/v1` catalog, produces an exact sorted target plan, and atomically promotes deterministic, content-addressed plan artifacts.

```sh
cd compilers/rust
cargo build --release --offline
./target/release/kumo-rust-planner /absolute/path/request.json
```

The executable writes only its receipt JSON to stdout. Exit codes are `0` success, `2` request/CLI decoding, `3` protocol/catalog validation, and `4` output/promotion failure.

## Verification and measurements

On Apple M4 Pro arm64 / macOS 25.4.0, a clean offline release build took **4.48 s** wall time and produced a **630,272-byte** binary. `cargo test --offline` covers malformed JSON, traversal, duplicate IDs/no partial writes, and determinism. Shared conformance passes 41 components / 164 targets twice.

## Limitations

This is intentionally a planner protocol implementation, not full React/Vue/Svelte/Solid emitter parity. Each artifact safely embeds the validated component IR and selected framework; it does not generate runnable framework source. Build and binary measurements are machine-specific. Benchmark process startup is included in wall time, while portable startup and RSS telemetry remain unavailable (`null`).
