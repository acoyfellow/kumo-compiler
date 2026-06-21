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
export declare function Field(props: FieldProps): JSX.Element;
