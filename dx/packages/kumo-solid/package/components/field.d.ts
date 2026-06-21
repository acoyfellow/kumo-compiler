import type { JSX } from 'solid-js';
export interface FieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'disabled' | 'required' | 'class' | 'children'> {
  id: string;
  label: JSX.Element;
  description?: JSX.Element;
  error?: JSX.Element;
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  class?: string;
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
}
export declare const Field: ((props: FieldProps) => JSX.Element) & { NativeInput: typeof FieldNativeInput };
export declare const modelDigest: "c8c1c62130c1f34d0061c3ea6adadfe4728a10920f9906960684ff48e50325c7";
export interface CompoundPartProps extends import('solid-js').JSX.HTMLAttributes<HTMLDivElement> { children?: import('solid-js').JSX.Element; }
export declare const FieldNativeInput: (props: CompoundPartProps) => import('solid-js').JSX.Element;
export default Field;
