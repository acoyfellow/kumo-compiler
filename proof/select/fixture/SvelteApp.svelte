<script lang="ts">
 import {SelectRoot,SelectOption} from '../../../candidates/shared-core/src/views/select/svelte/index.ts';
 let value:string|null=$state(null),open=$state(false); const options=[['alpha','Alpha',false],['blocked','Blocked',true],['charlie','Charlie',false],['delta','Delta',false],['echo','Éclair',false]] as const;
 const log=(x:string)=>(globalThis as any).__events.push(x);
</script>
<main data-fixture-import="src/views/select/svelte/index.ts"><section id="uncontrolled"><SelectRoot idSeed="svelte-u" label="Choice" description="Pick one" defaultValue="alpha" onValueChange={(v)=>log('u:value:'+v)} onOpenChange={(v)=>log('u:open:'+v)}>{#each options as o,i}<SelectOption id={o[0]} value={o[0]} label={o[1]} disabled={o[2]} order={i}/>{/each}</SelectRoot></section><section id="controlled"><SelectRoot idSeed="svelte-c" label="Controlled" description="Pick controlled" {value} {open} onValueChange={(v)=>{log('c:value:'+v);value=v}} onOpenChange={(v)=>{log('c:open:'+v);open=v}}>{#each options as o,i}<SelectOption id={'c-'+o[0]} value={o[0]} label={o[1]} disabled={o[2]} order={i}/>{/each}</SelectRoot></section></main>
