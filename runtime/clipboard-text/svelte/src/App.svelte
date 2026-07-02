<script>
let status='';async function copyText(){await navigator.clipboard.writeText('npm i kumo');status="Copied npm i kumo"}
</script>
<main class="form-shell"><h1>ClipboardText</h1><section class="form-grid"><article class="form-card" data-member="clipboard-text"><div class="field"><label for="copy-value">Install command</label><span class="row"><input class="control" id="copy-value" readonly value="npm i kumo"><button class="action copy" type="button" onclick={copyText}>Copy</button></span><p class="status" role="status">{status}</p></div></article></section></main>
