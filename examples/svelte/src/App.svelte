<script>
  import { Button, Field } from '@cloudflare/kumo-svelte';
  let clicks = $state(0);
  let project = $state('Workers');
</script>

<main>
  <h1>Kumo Svelte example</h1>
  <section><Button onclick={() => clicks += 1}>Clicked {clicks}</Button> <Button disabled>Disabled</Button></section>
  <section><Field id="project" label="Project" description="Rendered by Kumo" required bind:value={project} /><p>Model: {project}</p></section>
</main>

<style>:global(body){margin:0;font:16px system-ui;background:#f5f6f8;color:#111827}main{display:grid;gap:20px;max-width:720px;margin:auto;padding:40px 20px}section{padding:20px;border:1px solid #d8dde5;border-radius:10px;background:#fff}</style>
