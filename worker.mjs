import { Hono } from 'hono';
import { class2RuntimeRoute } from './runtime-routes.mjs';

const app = new Hono();
const pages = new Set(['/select/compare', '/select/compare/', '/select/react', '/select/react/', '/select/vue', '/select/vue/', '/select/svelte', '/select/svelte/', '/select/solid', '/select/solid/', '/button/compare', '/button/compare/', '/button/react', '/button/react/', '/button/vue', '/button/vue/', '/button/svelte', '/button/svelte/', '/button/solid', '/button/solid/', '/benchmarks', '/benchmarks/', '/benchmarks/components/select', '/benchmarks/components/select/']);
for (const page of ['compare', 'react', 'vue', 'svelte', 'solid']) {
  for (const kind of ['checkbox', 'switch']) {
    pages.add(`/${kind}/${page}`);
    pages.add(`/${kind}/${page}/`);
  }
  pages.add(`/dialog/${page}`);
  pages.add(`/dialog/${page}/`);
  pages.add(`/popover/${page}`);
  pages.add(`/popover/${page}/`);
}
const embed = /^\/benchmarks\/embed\/select\/(react|vue|svelte|solid)\/kitchen-sink\/?$/;

app.get('*', (c) => {
  const url = new URL(c.req.url);
  const match = url.pathname.match(embed);
  const class2Route = class2RuntimeRoute(url.pathname);
  if (class2Route?.needsSlash) return c.redirect(`${url.pathname}/${url.search}`, 308);
  if (class2Route) url.pathname = `/${class2Route.component}/react/index.html`;
  else if (match) url.pathname = `/select/${match[1]}/index.html`;
  else if (pages.has(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/$/, '') || '/benchmarks'}/index.html`;
  }
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
});

export default app;
