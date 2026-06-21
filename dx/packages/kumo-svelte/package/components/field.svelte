<script lang="ts">
  import type { InputHTMLAttributes } from 'svelte/elements';

  type Props = Omit<InputHTMLAttributes, 'id' | 'value' | 'required' | 'disabled'> & {
    id: string;
    label: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    value?: string | number;
  };

  let {
    id,
    label,
    description,
    error,
    required = false,
    disabled = false,
    value = $bindable(''),
    class: className = '',
    ...attributes
  }: Props = $props();
  const descriptionId = $derived(description ? `${id}-description` : undefined);
  const errorId = $derived(error ? `${id}-error` : undefined);
  const describedBy = $derived([descriptionId, errorId].filter(Boolean).join(' ') || undefined);
</script>

<div class={`kumo-field ${className}`.trim()}>
  <label class="kumo-field__label" for={id}>{label}{#if required}<span aria-hidden="true"> *</span>{/if}</label>
  {#if description}<div class="kumo-field__description" id={descriptionId}>{description}</div>{/if}
  <input
    {...attributes}
    class="kumo-field__input"
    {id}
    bind:value
    {required}
    {disabled}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
  />
  {#if error}<div class="kumo-field__error" id={errorId} role="alert">{error}</div>{/if}
</div>
