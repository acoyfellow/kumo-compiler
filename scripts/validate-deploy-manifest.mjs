import { readFile } from 'node:fs/promises';

const EXPECTED_FRAMEWORKS = ['react', 'solid', 'svelte', 'vue'];

function difference(left, right) {
  const expected = new Set(right);
  return left.filter((value) => !expected.has(value));
}

export async function validateDeployManifest(manifest, {
  catalogUrl = new URL('../generated/catalog.ir.json', import.meta.url),
  libraryManifestUrl = new URL('../library-artifacts/manifest.json', import.meta.url)
} = {}) {
  const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
  const route = manifest.routes?.find(({ id }) => id === 'component-runtime');
  if (!route) throw new Error('deploy manifest is missing component-runtime route');

  const actualComponents = [...new Set(route.components || [])].sort();
  const catalogComponents = [...new Set(catalog.components?.map(({ id }) => id) || [])].sort();
  const missing = difference(catalogComponents, actualComponents);
  const extra = difference(actualComponents, catalogComponents);
  if (missing.length || extra.length) throw new Error(`deploy manifest component inventory drift (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'})`);

  const actualFrameworks = [...new Set(route.frameworks || [])].sort();
  const missingFrameworks = difference(EXPECTED_FRAMEWORKS, actualFrameworks);
  const extraFrameworks = difference(actualFrameworks, EXPECTED_FRAMEWORKS);
  if (missingFrameworks.length || extraFrameworks.length) throw new Error(`deploy manifest framework inventory drift (missing: ${missingFrameworks.join(', ') || 'none'}; extra: ${extraFrameworks.join(', ') || 'none'})`);

  const packageRoute = manifest.routes?.find(({ id }) => id === 'library-packages');
  if (!packageRoute) throw new Error('deploy manifest is missing library-packages route');
  const libraryManifest = JSON.parse(await readFile(libraryManifestUrl, 'utf8'));
  const expectedArtifacts = ['manifest.json', ...libraryManifest.packages.flatMap(({ friendlyName, artifact }) => [friendlyName, artifact])];
  const actualArtifacts = packageRoute.artifacts || [];
  if (actualArtifacts.length !== expectedArtifacts.length || expectedArtifacts.some((artifact) => !actualArtifacts.includes(artifact))) {
    throw new Error(`deploy manifest library package artifacts drift (expected: ${expectedArtifacts.join(', ')}; actual: ${actualArtifacts.join(', ')})`);
  }
  return { components: actualComponents, frameworks: actualFrameworks, artifacts: actualArtifacts };
}
