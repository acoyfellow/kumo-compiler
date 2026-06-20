<script>
let value=$state("Free"),query=$state(''),open=$state(false),message=$state('Ready'),page=$state(1);let range=['',''],start=$state(range[0]),end=$state(range[1]);const matches=x=>x.toLowerCase().includes(query.toLowerCase());function choose(x){value=x;query=x;open=false}function key(e){if(e.key==='Escape')open=false;else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open=true}}
</script>
<main class="family"><h1>Radio</h1><fieldset><legend>Plan</legend><label><input type="radio" name="plan" value="Free" checked bind:group={value}> Free</label><label><input type="radio" name="plan" value="Pro" bind:group={value}> Pro</label></fieldset></main>
