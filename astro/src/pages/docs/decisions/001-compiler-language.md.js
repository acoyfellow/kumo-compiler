import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function GET() {
  const source = resolve(process.cwd(), '..', 'docs', 'decisions', '001-compiler-language.md');
  return new Response(await readFile(source), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
