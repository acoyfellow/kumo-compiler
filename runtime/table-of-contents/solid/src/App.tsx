import {For,createSignal} from 'solid-js';
const links=["Overview","Keyboard","Accessibility"] as const;
export default function TableOfContents(){const [current,setCurrent]=createSignal(0);return <main class="nav-shell"><h1>TableOfContents</h1><nav class="toc" aria-label="On this page"><For each={links}>{(label,index)=><a href={'#'+label.toLowerCase().replaceAll(' ','-')} aria-current={current()===index()?'location':undefined} onClick={()=>setCurrent(index())}>{label}</a>}</For></nav></main>}
