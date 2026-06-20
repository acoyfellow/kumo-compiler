<script>
let open=$state(false),value=$state('');function choose(x){value=x;open=false}function key(e){if(e.key==='Escape')open=false;else if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();open=true}}
</script>
<main class="form-shell"><h1>Select</h1><section class="matrix"><button role="combobox" aria-controls="select-options" aria-expanded={open} onclick={()=>open=!open} onkeydown={key}>Choose fruit</button>{#if open}<ul id="select-options" role="listbox"><li role="option" aria-selected={value==="Apple"} onclick={()=>choose("Apple")}>Apple</li><li role="option" aria-selected={value==="Banana"} onclick={()=>choose("Banana")}>Banana</li><li role="option" aria-selected={value==="Cherry"} onclick={()=>choose("Cherry")}>Cherry</li></ul>{/if}</section></main>
