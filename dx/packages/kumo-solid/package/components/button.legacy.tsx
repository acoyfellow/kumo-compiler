import { splitProps } from 'solid-js';

export function Button(props: Record<string, any>) {
  const [local, native] = splitProps(props, ['variant', 'size', 'disabled', 'loading', 'children', 'class']);
  return <button {...native}
    class={['kumo-button', `kumo-button--${local.variant ?? 'primary'}`, `kumo-button--${local.size ?? 'medium'}`, local.class].filter(Boolean).join(' ')}
    disabled={Boolean(local.disabled || local.loading)}
    aria-busy={local.loading ? 'true' : undefined}
  >{local.loading ? 'Loading…' : local.children}</button>;
}

export const modelDigest = "fb89a6c7da3d24b06ce460e02d60941a1dc33621cc70df51098d707e9255e776";
export default Button;
