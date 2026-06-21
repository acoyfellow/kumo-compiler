import { splitProps } from 'solid-js';

export function Button(props) {
  const [local, native] = splitProps(props, ['variant', 'size', 'disabled', 'loading', 'children', 'class']);
  return <button {...native}
    class={['kumo-button', `kumo-button--${local.variant ?? 'primary'}`, `kumo-button--${local.size ?? 'medium'}`, local.class].filter(Boolean).join(' ')}
    disabled={Boolean(local.disabled || local.loading)}
    aria-busy={local.loading ? 'true' : undefined}
  >{local.loading ? 'Loading…' : local.children}</button>;
}
