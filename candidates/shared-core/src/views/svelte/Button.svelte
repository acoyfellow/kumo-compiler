<script lang="ts">import {buttonView,type ButtonProps} from '../native.js';let p:ButtonProps=$props();let v=$derived(buttonView(p));</script>
<button {...v.attrs} onclick={v.events?.click}>{p.label}</button>
