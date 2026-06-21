import type { JSX } from 'solid-js';
export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
export declare const modelDigest: "48798c8ab5bf8d756056311749cd7d344b6c82b50134d057656d5f6e4cad48aa";
export default Button;
