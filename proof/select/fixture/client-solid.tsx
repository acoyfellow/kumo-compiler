import{hydrate}from'solid-js/web';import{App}from'./solid.tsx';(globalThis as any).__events=[];hydrate(()=><App/>,document.getElementById('app')!);(globalThis as any).__hydrated=true;
