import{render}from'svelte/server';import App from'./SvelteApp.svelte';export const renderApp=()=>render(App).body;export{renderApp as render};
