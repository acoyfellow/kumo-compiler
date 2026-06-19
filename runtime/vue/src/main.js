import { createApp, h } from 'vue';
import Select from './Select.vue';
import '../../../public/styles.css';

createApp({
  render: () => h('main', { class: 'shell' }, [
    h('h1', { class: 'title' }, 'Select'),
    h(Select, { label: 'Fruit', placeholder: 'Choose fruit', description: 'Choose the closest region.' }),
    h(Select, { label: 'Error', placeholder: 'Select an option', error: 'Selection required' }),
  ]),
}).mount('#app');
