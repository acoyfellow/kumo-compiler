import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const frameworks = { react: 'tsx', vue: 'vue', svelte: 'svelte', solid: 'tsx' };
const components = ['Button', 'Field', 'Tabs', 'Select', 'Dialog', 'Popover', 'DatePicker'];

export function getStaticPaths() {
  return Object.entries(frameworks).flatMap(([framework, extension]) =>
    components.map(component => ({
      params: { framework, file: `${component}.${extension}` },
      props: { framework, file: `${component}.${extension}` },
    })),
  );
}

export async function GET({ props }) {
  const source = resolve(process.cwd(), '..', 'candidates', 'mitosis', 'generated', props.framework, props.file);
  return new Response(await readFile(source), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
