/**
 * Ownership pointer only: framework-native views live in shared-core.
 * No HTML copying, innerHTML, null roots, or post-mount reconstruction is allowed.
 */
export const nativeSelectOwnership = {
  react: '../../shared-core/src/views/select/react/index.tsx',
  solid: '../../shared-core/src/views/select/solid/index.tsx',
  svelte: '../../shared-core/src/views/select/svelte/SelectRoot.svelte',
  vue: '../../shared-core/src/views/select/vue/index.ts',
} as const;
