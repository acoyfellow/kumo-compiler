"use client";
import * as React from "react";

function Button(props: any) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={(event) => props.onClick()}
    >
      {props.children}
    </button>
  );
}

export default Button;
