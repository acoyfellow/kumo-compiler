<script>
let current=$state("Overview");
</script>
<main class="nav-shell"><h1>Sidebar</h1><nav class="sidebar" aria-label="Workspace"><a href="#overview" aria-current={current==="Overview"?"page":undefined} onclick={()=>current="Overview"}>Overview</a><a href="#members" aria-current={current==="Members"?"page":undefined} onclick={()=>current="Members"}>Members</a><a href="#settings" aria-current={current==="Settings"?"page":undefined} onclick={()=>current="Settings"}>Settings</a></nav></main>
