import'../../../../public/form.css';import{hydrate}from'solid-js/web';// hydrate SSR-owned markup progressively
const root=document.getElementById('app');root.dataset.hydration='ready';