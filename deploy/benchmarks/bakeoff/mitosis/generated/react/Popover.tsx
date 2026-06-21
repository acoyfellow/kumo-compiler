"use client";
import * as React from "react";
import { useState } from "react";

function Popover(props: any) {
  const [open, setOpen] = useState(() => false);

  return (
    <div>
      <button aria-expanded={open} onClick={(event) => setOpen(!open)}>
        {props.label}
      </button>
      <div hidden={!open}>{props.children}</div>
    </div>
  );
}

export default Popover;
