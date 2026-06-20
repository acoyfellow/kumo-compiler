export interface ButtonContract {
  id?: string;
  label: string;
  disabled?: boolean;
  onPress?: () => void;
}

export const buttonTokens = {
  className: 'kumo-button',
  disabledAttribute: 'disabled',
} as const;

// Select state, effects, ARIA and vectors are shared rather than regenerated.
export * from '../../shared-core/src/select/index.js';
