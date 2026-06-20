<script setup lang="ts">
import {reactive} from 'vue';
const checked=reactive<Record<string,boolean>>({"accept":false,"updates":true,"disabled":false,"required":false});
function setChecked(id:string,event:Event){checked[id]=(event.currentTarget as HTMLInputElement).checked}
</script>
<template>
<main class="native-shell"><h1>Checkbox</h1><section class="native-matrix"><label class="native-control checkbox"><input id="accept" type="checkbox" :checked="checked['accept']" @change="setChecked('accept', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Accept terms</span></label><label class="native-control checkbox"><input id="updates" type="checkbox" checked :checked="checked['updates']" @change="setChecked('updates', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Email updates</span></label><label class="native-control checkbox"><input id="disabled" type="checkbox" disabled :checked="checked['disabled']" @change="setChecked('disabled', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Disabled</span></label><label class="native-control checkbox"><input id="required" type="checkbox" required :checked="checked['required']" @change="setChecked('required', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Required</span></label></section></main>
</template>
