import type { JSX } from "solid-js";
export interface InputGroupProps {
  "observable"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const InputGroupAddon: (props: CompoundPartProps) => JSX.Element;
export declare const InputGroupButton: (props: CompoundPartProps) => JSX.Element;
export declare const InputGroupInput: (props: CompoundPartProps) => JSX.Element;
export declare const InputGroupSuffix: (props: CompoundPartProps) => JSX.Element;
export declare const InputGroup: ((props: InputGroupProps) => JSX.Element) & { "Addon": typeof InputGroupAddon; "Button": typeof InputGroupButton; "Input": typeof InputGroupInput; "Suffix": typeof InputGroupSuffix };
export default InputGroup;
