import { splitProps } from 'solid-js';

export function Button(props) {
  const [local, native] = splitProps(props, ['variant', 'size', 'disabled', 'loading', 'children', 'class']);
  return <button {...native}
    class={['kumo-button', `kumo-button--${local.variant ?? 'primary'}`, `kumo-button--${local.size ?? 'medium'}`, local.class].filter(Boolean).join(' ')}
    disabled={Boolean(local.disabled || local.loading)}
    aria-busy={local.loading ? 'true' : undefined}
  >{local.loading ? 'Loading…' : local.children}</button>;
}

export const modelDigest = "48798c8ab5bf8d756056311749cd7d344b6c82b50134d057656d5f6e4cad48aa";
export default Button;
