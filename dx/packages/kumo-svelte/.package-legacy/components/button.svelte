<script lang="ts">
  import type { ButtonHTMLAttributes } from 'svelte/elements';

  type Props = ButtonHTMLAttributes & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
  };

  let {
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    children,
    ...attributes
  }: Props = $props();
</script>

<button
  {...attributes}
  {type}
  class={`kumo-button kumo-button--${variant} kumo-button--${size} ${className}`.trim()}
  disabled={disabled || loading}
  aria-busy={loading || undefined}
>
  {#if loading}Loading…{:else}{@render children?.()}{/if}
</button>
