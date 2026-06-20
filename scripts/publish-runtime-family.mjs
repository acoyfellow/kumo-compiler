import { cp } from 'node:fs/promises';

const family = process.argv[2];
if (!['dialog', 'popover'].includes(family)) throw new Error(`unsupported runtime family: ${family}`);
for (const framework of ['react', 'vue', 'svelte', 'solid']) {
  await cp(`runtime/${family}/${framework}/public-runtime`, `deploy/${family}/${framework}`, {
    recursive: true,
  });
}
