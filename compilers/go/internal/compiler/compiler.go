package compiler

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

const requestVersion = "kumo.compiler.request/v1"

type Diagnostic struct {
	Severity string `json:"severity"`
	Code     string `json:"code"`
	Message  string `json:"message"`
	Path     string `json:"path"`
}
type Request struct {
	SchemaVersion string          `json:"schemaVersion"`
	InputRoot     string          `json:"inputRoot"`
	OutputRoot    string          `json:"outputRoot"`
	Catalog       json.RawMessage `json:"catalog"`
	Frameworks    []string        `json:"frameworks"`
}
type component struct {
	SchemaVersion string          `json:"schemaVersion"`
	ID            string          `json:"id"`
	Root          json.RawMessage `json:"root"`
}
type catalog struct {
	SchemaVersion string      `json:"schemaVersion"`
	Components    []component `json:"components"`
}
type Plan struct {
	Component string `json:"component"`
	Framework string `json:"framework"`
}
type Output struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256"`
	Bytes  int    `json:"bytes"`
}
type Receipt struct {
	SchemaVersion string            `json:"schemaVersion"`
	Compiler      map[string]string `json:"compiler"`
	Roots         map[string]string `json:"roots"`
	Status        string            `json:"status"`
	Diagnostics   []Diagnostic      `json:"diagnostics"`
	Plan          []Plan            `json:"plan"`
	Outputs       []Output          `json:"outputs"`
}

func base(in, out string) Receipt {
	return Receipt{"kumo.compiler.receipt/v1", map[string]string{"name": "kumo-go-planner", "version": "1.0.0", "toolchain": runtime.Version() + "; protocol planner artifacts only, not framework source parity"}, map[string]string{"input": in, "output": out}, "ok", []Diagnostic{}, []Plan{}, []Output{}}
}
func fail(r Receipt, code, msg, path string) Receipt {
	r.Status = "error"
	r.Diagnostics = []Diagnostic{{"error", code, msg, path}}
	r.Plan = []Plan{}
	r.Outputs = []Output{}
	return r
}
func abs(s string) bool { return filepath.IsAbs(s) }
func safe(s string) bool {
	if s == "" || filepath.IsAbs(s) || strings.Contains(s, "\\") {
		return false
	}
	c := filepath.Clean(s)
	return c == s && !strings.HasPrefix(c, ".."+string(filepath.Separator)) && c != ".."
}
func strict(raw []byte, v any) error {
	d := json.NewDecoder(bytes.NewReader(raw))
	d.DisallowUnknownFields()
	if err := d.Decode(v); err != nil {
		return err
	}
	var x any
	if err := d.Decode(&x); !errors.Is(err, io.EOF) {
		return errors.New("trailing JSON")
	}
	return nil
}

func Compile(raw []byte) Receipt {
	var q Request
	if err := strict(raw, &q); err != nil {
		return fail(base("unknown", "unknown"), "malformed-request", err.Error(), "$")
	}
	in, out := q.InputRoot, q.OutputRoot
	r := base(in, out)
	if q.SchemaVersion != requestVersion {
		return fail(r, "unsupported-protocol", "expected "+requestVersion, "$.schemaVersion")
	}
	if !abs(in) || !abs(out) {
		return fail(r, "absolute-root-required", "roots must be absolute", "$.inputRoot")
	}
	if len(q.Frameworks) == 0 {
		return fail(r, "invalid-request", "frameworks must be non-empty", "$.frameworks")
	}
	allowed := map[string]bool{"react": true, "vue": true, "svelte": true, "solid": true}
	seenF := map[string]bool{}
	for i, f := range q.Frameworks {
		if !allowed[f] || seenF[f] {
			return fail(r, "invalid-framework", fmt.Sprintf("invalid or duplicate framework %q", f), fmt.Sprintf("$.frameworks[%d]", i))
		}
		seenF[f] = true
	}
	var craw []byte
	var catPath string
	if len(q.Catalog) > 0 && q.Catalog[0] == '"' {
		if err := json.Unmarshal(q.Catalog, &catPath); err != nil {
			return fail(r, "invalid-catalog", err.Error(), "$.catalog")
		}
		if !safe(catPath) {
			return fail(r, "path-escape", "catalog escapes input root", "$.catalog")
		}
		p := filepath.Join(in, catPath)
		rel, e := filepath.Rel(in, p)
		if e != nil || !safe(rel) {
			return fail(r, "path-escape", "catalog escapes input root", "$.catalog")
		}
		var e2 error
		craw, e2 = os.ReadFile(p)
		if e2 != nil {
			return fail(r, "invalid-catalog", e2.Error(), "$.catalog")
		}
	} else {
		craw = q.Catalog
	}
	var c catalog
	if err := json.Unmarshal(craw, &c); err != nil {
		return fail(r, "invalid-catalog", err.Error(), "$.catalog")
	}
	if c.SchemaVersion != "kumo.ir/v1" || c.Components == nil {
		return fail(r, "invalid-catalog", "expected kumo.ir/v1 catalog", "$.catalog")
	}
	ids := map[string]bool{}
	raws := map[string]json.RawMessage{}
	for i, x := range c.Components {
		p := fmt.Sprintf("$.catalog.components[%d]", i)
		if x.SchemaVersion != "kumo.ir/v1" || x.ID == "" || len(x.Root) == 0 || string(x.Root) == "null" {
			return fail(r, "invalid-component", "invalid component record", p)
		}
		if !safe(x.ID) || strings.Contains(x.ID, "/") {
			return fail(r, "unsafe-component-id", "component id is not a safe path segment", p+".id")
		}
		if ids[x.ID] {
			return fail(r, "duplicate-component", "duplicate component id", p+".id")
		}
		ids[x.ID] = true
		raws[x.ID] = x.Root
	}
	if len(c.Components) != 41 {
		return fail(r, "invalid-catalog", "expected exactly 41 components", "$.catalog.components")
	}
	for id := range ids {
		for f := range seenF {
			r.Plan = append(r.Plan, Plan{id, f})
		}
	}
	sort.Slice(r.Plan, func(i, j int) bool {
		if r.Plan[i].Component == r.Plan[j].Component {
			return r.Plan[i].Framework < r.Plan[j].Framework
		}
		return r.Plan[i].Component < r.Plan[j].Component
	})
	stage, err := os.MkdirTemp(filepath.Dir(out), ".kumo-go-stage-")
	if err != nil {
		return fail(r, "compiler-failure", err.Error(), "$.outputRoot")
	}
	defer os.RemoveAll(stage)
	for _, p := range r.Plan {
		rel := "plans/" + p.Component + "/" + p.Framework + ".json"
		body := struct {
			SchemaVersion, Component, Framework, Limitation string
			Root                                            json.RawMessage `json:"root"`
		}{"kumo.compiler.plan/v1", p.Component, p.Framework, "protocol planner artifact; not framework source parity", raws[p.Component]}
		b, _ := json.MarshalIndent(body, "", "  ")
		b = append(b, '\n')
		dest := filepath.Join(stage, filepath.FromSlash(rel))
		if err = os.MkdirAll(filepath.Dir(dest), 0755); err == nil {
			err = os.WriteFile(dest, b, 0644)
		}
		if err != nil {
			return fail(r, "compiler-failure", err.Error(), "$.outputRoot")
		}
		sum := sha256.Sum256(b)
		r.Outputs = append(r.Outputs, Output{rel, hex.EncodeToString(sum[:]), len(b)})
	}
	sort.Slice(r.Outputs, func(i, j int) bool { return r.Outputs[i].Path < r.Outputs[j].Path })
	if err = os.RemoveAll(out); err == nil {
		err = os.Rename(stage, out)
	}
	if err != nil {
		return fail(r, "compiler-failure", err.Error(), "$.outputRoot")
	}
	return r
}
