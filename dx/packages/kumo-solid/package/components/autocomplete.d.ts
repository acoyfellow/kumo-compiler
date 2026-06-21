import type { JSX } from "solid-js";
export interface AutocompleteProps {
  "compound"?: unknown;
  "Content"?: unknown;
  "InputGroup"?: unknown;
  "root"?: unknown;
  "Content"?: JSX.Element;
  "InputGroup"?: JSX.Element;
  "compound"?: JSX.Element;
  "root"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Autocomplete: (props: AutocompleteProps) => JSX.Element;
export default Autocomplete;
