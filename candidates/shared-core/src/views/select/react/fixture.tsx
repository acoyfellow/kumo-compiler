import React from 'react';
import {Select,SelectDescription,SelectLabel,SelectListbox,SelectOption,SelectTrigger,SelectValue} from './index.js';

/** Compile/SSR/hydration fixture: deterministic id keeps server and client markup aligned. */
export const SelectReactFixture=()=> <Select id="fruit" defaultValue="pear">
  <SelectLabel>Fruit</SelectLabel>
  <SelectTrigger><SelectValue placeholder="Choose fruit" /></SelectTrigger>
  <SelectDescription>Pick one fruit</SelectDescription>
  <SelectListbox>
    <SelectOption id="apple" value="apple" label="Apple" />
    <SelectOption id="pear" value="pear" label="Pear" />
  </SelectListbox>
</Select>;
