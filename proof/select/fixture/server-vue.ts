import{createSSRApp}from'vue';import{renderToString}from'@vue/server-renderer';import{App}from'./vue.ts';export const render=()=>renderToString(createSSRApp(App));
