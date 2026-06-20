import {load} from './app.tsx';
export async function ssr(){return (await load()).ssr()}
