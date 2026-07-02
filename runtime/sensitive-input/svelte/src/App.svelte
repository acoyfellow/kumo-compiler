<script>
let revealed=false;
</script>
<main class="form-shell"><h1>SensitiveInput</h1><section class="form-grid"><article class="form-card" data-member="sensitive-input"><label class="field" for="secret"><span>API token</span><span class="row"><input class="control" id="secret" value="secret-123" type={revealed?"text":"password"}><button class="action reveal" type="button" aria-pressed={revealed} onclick={()=>revealed=!revealed}>{revealed?"Hide":"Show"}</button></span></label></article></section></main>
