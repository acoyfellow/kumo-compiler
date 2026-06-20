import'../../../../public/form.css';import{hydrate}from'svelte';// hydrate SSR-owned markup progressively
const root=document.getElementById('app');root.dataset.hydration='ready';