<script>
let value=$state(["2026-06-19","2026-06-26"]),query=$state(''),open=$state(false),message=$state('Ready'),page=$state(1);let range=["2026-06-19","2026-06-26"],start=$state(range[0]),end=$state(range[1]);const matches=x=>x.toLowerCase().includes(query.toLowerCase());function choose(x){value=x;query=x;open=false}function chooseKey(e,x){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(x)}}function key(e){if(e.key==='Escape')open=false;else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open=true}}
</script>
<main class="family"><h1>DateRangePicker</h1><section><label>Start <input class="start" type="date" bind:value={start}></label><label>End <input class="end" type="date" bind:value={end}></label></section></main>
