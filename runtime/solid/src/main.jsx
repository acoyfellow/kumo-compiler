import { render } from 'solid-js/web'; import Select from './Select'; import '../../../public/styles.css';
render(()=> <main class="shell"><h1 class="title">Select</h1><Select label="Fruit" placeholder="Choose fruit" description="Choose the closest region."/><Select label="Error" placeholder="Select an option" error="Selection required"/></main>, document.getElementById('app'));
