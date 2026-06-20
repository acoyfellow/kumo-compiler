package compiler

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func req(root, out string, cat any) []byte {
	b, _ := json.Marshal(map[string]any{"schemaVersion": "kumo.compiler.request/v1", "inputRoot": root, "outputRoot": out, "catalog": cat, "frameworks": []string{"vue", "react"}})
	return b
}
func TestValidationDoesNotWrite(t *testing.T) {
	d := t.TempDir()
	out := filepath.Join(d, "out")
	r := Compile(req(d, out, map[string]any{"schemaVersion": "bad", "components": []any{}}))
	if r.Status != "error" {
		t.Fatal(r)
	}
	if _, e := os.Stat(out); !os.IsNotExist(e) {
		t.Fatal("wrote output")
	}
}
func TestPathEscape(t *testing.T) {
	d := t.TempDir()
	r := Compile(req(d, filepath.Join(d, "out"), "../x"))
	if r.Diagnostics[0].Code != "path-escape" {
		t.Fatal(r)
	}
}
func TestMalformed(t *testing.T) {
	r := Compile([]byte("{"))
	if r.Diagnostics[0].Path != "$" {
		t.Fatal(r)
	}
}
