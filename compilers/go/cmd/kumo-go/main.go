package main

import (
	"encoding/json"
	"fmt"
	"kumo-go/internal/compiler"
	"os"
)

func main() {
	var raw []byte
	var err error
	if len(os.Args) != 2 {
		raw = []byte("null")
		err = fmt.Errorf("expected exactly one request file positional argument")
	} else {
		raw, err = os.ReadFile(os.Args[1])
	}
	var r compiler.Receipt
	if err != nil {
		r = compiler.Compile([]byte("{"))
	} else {
		r = compiler.Compile(raw)
	}
	json.NewEncoder(os.Stdout).Encode(r)
	if r.Status != "ok" {
		os.Exit(1)
	}
}
