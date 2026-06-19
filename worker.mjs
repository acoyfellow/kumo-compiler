import { Hono } from 'hono';

const app = new Hono();
const pages = new Set(['/select/compare', '/select/compare/', '/select/react', '/select/react/', '/select/vue', '/select/vue/', '/select/svelte', '/select/svelte/', '/select/solid', '/select/solid/']);

app.get('*', (c) => {
  const url = new URL(c.req.url);
  if (pages.has(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/index.html`;
  }
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
});

export default app;
