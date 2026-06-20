import {For,createSignal} from 'solid-js';
const links=["Overview","Members","Settings"] as const;
export default function Sidebar(){const [current,setCurrent]=createSignal(0);return <main class="nav-shell"><h1>Sidebar</h1><nav class="sidebar" aria-label="Workspace"><For each={links}>{(label,index)=><a href={'#'+label.toLowerCase().replaceAll(' ','-')} aria-current={current()===index()?'page':undefined} onClick={()=>setCurrent(index())}>{label}</a>}</For></nav></main>}
