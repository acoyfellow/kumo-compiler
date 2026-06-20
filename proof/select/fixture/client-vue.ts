import{createSSRApp}from'vue';import{App}from'./vue.ts';(globalThis as any).__events=[];createSSRApp(App).mount('#app');(globalThis as any).__hydrated=true;
