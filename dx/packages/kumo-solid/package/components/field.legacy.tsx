import { splitProps } from 'solid-js';

export function Field(props: Record<string, any>) {
  const [local, native] = splitProps(props, ['id', 'label', 'description', 'error', 'required', 'disabled', 'value', 'onInput', 'class']);
  const descriptionId = () => local.description ? `${local.id}-description` : undefined;
  const errorId = () => local.error ? `${local.id}-error` : undefined;
  const describedBy = () => [descriptionId(), errorId()].filter(Boolean).join(' ') || undefined;
  return <div class={['kumo-field', local.class].filter(Boolean).join(' ')}>
    <label class="kumo-field__label" for={local.id}>{local.label}{local.required ? <span aria-hidden="true"> *</span> : null}</label>
    {local.description ? <div class="kumo-field__description" id={descriptionId()}>{local.description}</div> : null}
    <input {...native} class="kumo-field__input" id={local.id} value={local.value ?? ''} required={local.required} disabled={local.disabled} aria-invalid={local.error ? 'true' : undefined} aria-describedby={describedBy()} onInput={local.onInput}/>
    {local.error ? <div class="kumo-field__error" id={errorId()} role="alert">{local.error}</div> : null}
  </div>;
}

export const modelDigest = "c8c1c62130c1f34d0061c3ea6adadfe4728a10920f9906960684ff48e50325c7";
export function FieldNativeInput(props: Record<string, any>) {
  const [local, native] = splitProps(props, ['children']);
  return <div {...native} data-kumo-part="NativeInput">{local.children}</div>;
}
Object.defineProperty(Field, 'NativeInput', { value: FieldNativeInput, enumerable: true });
export default Field;
