"use client";
import * as React from "react";

function Dialog(props: any) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={props.title}
      hidden={!props.open}
    >
      {props.children}
      <button onClick={(event) => props.onClose()}>Close</button>
    </div>
  );
}

export default Dialog;
