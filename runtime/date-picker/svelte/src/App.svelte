<script>
let value=$state("2026-06-19"),query=$state(''),open=$state(false),message=$state('Ready'),page=$state(1);let range=['',''],start=$state(range[0]),end=$state(range[1]);const matches=x=>x.toLowerCase().includes(query.toLowerCase());function choose(x){value=x;query=x;open=false}function key(e){if(e.key==='Escape')open=false;else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open=true}}
</script>
<main class="family"><h1>DatePicker</h1><label for="date">Deploy date<input id="date" type="date" bind:value></label></main>
