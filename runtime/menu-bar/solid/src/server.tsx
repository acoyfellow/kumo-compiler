import {generateHydrationScript,renderToString} from 'solid-js/web';
import App from './App';
export const render=()=>({html:renderToString(()=> <App/>),hydration:generateHydrationScript()});
