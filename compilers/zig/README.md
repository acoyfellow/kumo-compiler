# Kumo Zig compiler

Pinned toolchain: **Zig 0.16.0**. The implementation uses only Zig's standard library.

```sh
cd compilers/zig
zig build -Doptimize=ReleaseSmall
zig build test
./zig-out/bin/kumo-zig /absolute/path/request.json
```

The CLI accepts exactly one positional request-file path and emits one protocol receipt on stdout. Input/output roots must be absolute. Catalog file references are constrained to `inputRoot`; component IDs are restricted to safe filename characters. All 164 artifacts are generated in a sibling staging directory and then committed by rename, so generation errors do not expose a partial tree. Artifact content includes the component IR root and requested framework; paths, content, hashes, and plans are deterministic.

Build constraints: no libc or package dependencies; native release build; staging and output must reside on a filesystem supporting directory rename. The shared runner invokes binaries through Node, so `benchmarks/compilers/zig-adapter.mjs` is a minimal process wrapper. ReleaseSmall binary size on the benchmark host: **275624 bytes**.
