import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import { Button, Field } from '@acoyfellow/kumo-solid';
import '@acoyfellow/kumo-solid/styles.css';
import './style.css';

function App() {
  const [clicks, setClicks] = createSignal(0);
  const [project, setProject] = createSignal('Workers');
  return <main><h1>Kumo Solid example</h1><section><Button onClick={() => setClicks(value => value + 1)}>Clicked {clicks()}</Button> <Button disabled>Disabled</Button></section><section><Field id="project" label="Project" description="Rendered by Kumo" required value={project()} onInput={event => setProject(event.currentTarget.value)} /><p>Model: {project()}</p></section></main>;
}
render(() => <App />, document.getElementById('app'));
