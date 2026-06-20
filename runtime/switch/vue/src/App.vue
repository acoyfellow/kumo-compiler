<script setup lang="ts">
import {reactive} from 'vue';
const checked=reactive<Record<string,boolean>>({"airplane":false,"notifications":true,"switch-disabled":false,"compact":false});
function setChecked(id:string,event:Event){checked[id]=(event.currentTarget as HTMLInputElement).checked}
</script>
<template>
<main class="native-shell"><h1>Switch</h1><section class="native-matrix"><label class="native-control switch"><input id="airplane" type="checkbox" role="switch" :checked="checked['airplane']" @change="setChecked('airplane', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Airplane mode</span></label><label class="native-control switch"><input id="notifications" type="checkbox" role="switch" checked :checked="checked['notifications']" @change="setChecked('notifications', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Notifications</span></label><label class="native-control switch"><input id="switch-disabled" type="checkbox" role="switch" disabled :checked="checked['switch-disabled']" @change="setChecked('switch-disabled', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Disabled</span></label><label class="native-control switch compact"><input id="compact" type="checkbox" role="switch" :checked="checked['compact']" @change="setChecked('compact', $event)"></input><span class="indicator" aria-hidden="true"></span><span>Compact</span></label></section></main>
</template>
