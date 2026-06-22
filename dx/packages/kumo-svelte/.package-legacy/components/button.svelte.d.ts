import type { Component, Snippet } from 'svelte';
import type { ButtonHTMLAttributes } from 'svelte/elements';
export type ButtonProps = ButtonHTMLAttributes & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children?: Snippet;
};
declare const Button: Component<ButtonProps>;
export default Button;
