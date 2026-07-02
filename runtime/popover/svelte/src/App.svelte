<script>
let open=$state(true);
</script>
<main class="form-shell"><h1>Popover</h1><section class="popover-matrix"><button aria-haspopup="dialog" aria-expanded={open} onclick={()=>open=!open}>Toggle</button>{#if open}<div role="dialog">Popover content</div>{/if}</section></main>
