import { render } from 'solid-js/web'; import Select from './Select'; import '../../../public/styles.css';
render(()=> <main><h1>Select</h1><Select label="Fruit" placeholder="Choose fruit" description="Choose the closest region."/><Select label="Error" error="Selection required"/></main>, document.getElementById('app'));
