import { createApp, h } from 'vue';
import Select from './Select.vue';
import '../../../public/styles.css';

createApp({
  render: () => h('main', [
    h('h1', 'Select'),
    h(Select, { label: 'Fruit', placeholder: 'Choose fruit', description: 'Choose the closest region.' }),
    h(Select, { label: 'Error', error: 'Selection required' }),
  ]),
}).mount('#app');
