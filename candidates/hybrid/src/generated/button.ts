import type { ButtonContract } from '../contract.js';

/** Generator-neutral scaffold projected into each framework by the shootout adapter. */
export const buttonProjection = (props: ButtonContract) => ({
  element: 'button' as const,
  attributes: { id: props.id, disabled: props.disabled ?? false, class: 'kumo-button' },
  text: props.label,
  press: () => { if (!props.disabled) props.onPress?.(); },
});
