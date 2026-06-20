"use client";
import * as React from "react";
import { useState } from "react";

function Tabs(props: any) {
  const [active, setActive] = useState(() => 0);

  return (
    <div>
      <div role="tablist">
        {props.labels?.map((label, index) => (
          <button
            role="tab"
            aria-selected={active === index}
            onClick={(event) => setActive(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{props.labels[active]}</div>
    </div>
  );
}

export default Tabs;
