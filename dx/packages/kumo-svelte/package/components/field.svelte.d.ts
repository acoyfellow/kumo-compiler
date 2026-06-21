import type { Component } from 'svelte';
import type { InputHTMLAttributes } from 'svelte/elements';
export interface FieldProps extends Omit<InputHTMLAttributes, 'id' | 'value' | 'required' | 'disabled'> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
}
declare const Field: Component<FieldProps>;
export default Field;
