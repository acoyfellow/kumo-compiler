"use client";
import * as React from "react";

function Select(props: any) {
  return (
    <label>
      {props.label}
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {props.options?.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default Select;
