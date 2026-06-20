import{hydrate}from'svelte';import App from'./SvelteApp.svelte';(globalThis as any).__events=[];hydrate(App,{target:document.getElementById('app')!});(globalThis as any).__hydrated=true;
