import type { DefineComponent, InputHTMLAttributes } from 'vue';

export interface FieldProps extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'id' | 'disabled' | 'required' | 'value'> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  modelValue?: string | number;
}
export declare const Field: DefineComponent<FieldProps>;
export default Field;
