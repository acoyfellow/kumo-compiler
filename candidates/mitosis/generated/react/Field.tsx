"use client";
import * as React from "react";

function Field(props: any) {
  return (
    <label>
      {props.label}
      <input
        value={props.value}
        onInput={(event) => props.onInput(event.target.value)}
      />
    </label>
  );
}

export default Field;
