<script>
let value=$state("Ready to save"),query=$state(''),open=$state(false),message=$state("Ready to save"),page=$state(1);let range=['',''],start=$state(range[0]),end=$state(range[1]);const matches=x=>x.toLowerCase().includes(query.toLowerCase());function choose(x){value=x;query=x;open=false}function chooseKey(e,x){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(x)}}function key(e){if(e.key==='Escape')open=false;else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open=true}}
</script>
<main class="family"><h1>Toasty</h1><section><button class="toast-button" onclick={()=>message="Changes saved"}>Save changes</button><output class="toast" aria-live="polite">{message}</output></section></main>
