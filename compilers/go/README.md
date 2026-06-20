# kumo-go planner

A Go standard-library implementation of the Kumo compiler protocol. Build reproducibly with:

```sh
go build -trimpath -o bin/kumo-go ./cmd/kumo-go
```

Invoke with exactly one positional request JSON path; the receipt is emitted on stdout. The generated deterministic files are **protocol planner artifacts derived from component IR**, not framework source implementations and do not claim framework source parity.
