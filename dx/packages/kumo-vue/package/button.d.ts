import type { DefineComponent, ButtonHTMLAttributes } from 'vue';

export interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
export declare const Button: DefineComponent<ButtonProps>;
