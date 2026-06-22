import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runObservableBrowser} from '../../../../scripts/observable-browser-runner.mjs';
import {compareMarkup} from '../../../../scripts/observable-runner.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const ids=new Set(['disabled-click','loading-click','enabled-click','submit-form']);
const json=JSON.stringify;

export async function runSolidButtonBrowser({consumer,vectors,ssrRenders}){
  const specs=vectors.filter(vector=>vector.provenance.vector.startsWith('button/')&&ids.has(vector.provenance.vector.split('/')[1])).map(vector=>({...vector,component:'button',id:vector.provenance.vector.split('/')[1]}));
  if(specs.length!==4||ssrRenders.length!==4)throw new Error('Solid Button browser slice requires exactly four vectors');
  const results=[],diagnostics=[],telemetry=[];
  for(let index=0;index<specs.length;index++){
    const spec=specs[index],data={id:spec.id,props:spec.fixture.props,children:spec.fixture.children.map(node=>node.value??'').join('')};
    const source=`import{hydrate}from'solid-js/web';import{Button}from'@acoyfellow/kumo-solid/button';const S=${json(data)};document.body.dataset.events='[]';document.body.dataset.clicks='0';document.body.dataset.submits='0';function click(){document.body.dataset.clicks=String(Number(document.body.dataset.clicks)+1);let events=JSON.parse(document.body.dataset.events);events.push('click');document.body.dataset.events=JSON.stringify(events)}function submit(event){event.preventDefault();document.body.dataset.submits=String(Number(document.body.dataset.submits)+1);let events=JSON.parse(document.body.dataset.events);events.push('submit');document.body.dataset.events=JSON.stringify(events)}function App(){return S.id==='submit-form'?<section id="v0"><form onSubmit={submit}><Button {...S.props} onClick={click}>{S.children}</Button></form></section>:<section id="v0"><Button {...S.props} onClick={click}>{S.children}</Button></section>}hydrate(()=> <App/>,document.querySelector('#app'),{renderId:'kumo-'});document.body.dataset.events='[]';document.body.dataset.clicks='0';document.body.dataset.submits='0';queueMicrotask(()=>{globalThis.__ready=true});`;
    const run=await runObservableBrowser({name:`solid-packed-button-${spec.id}`,entrySource:source,entryFilename:'client.jsx',viteConfig:path.join(root,'proof/dx/conformance/shared/solid-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:consumer},cssPath:path.join(consumer,'node_modules/@acoyfellow/kumo-solid/package/styles.css'),html:ssrRenders[index].html,beforeAppHtml:ssrRenders[index].hydrationScript,vectors:[spec],runVector:async(api,current)=>{
      for(const action of current.actions)await api.action(0,{...action,selector:'button'});
      const got=await api.evaluate(`(()=>{const root=document.querySelector('#v0'),button=root.querySelector('button');return{html:button.outerHTML,clicks:Number(document.body.dataset.clicks||0),submits:Number(document.body.dataset.submits||0),events:JSON.parse(document.body.dataset.events||'[]'),focus:document.activeElement===button?'root':'none',svg:button.querySelectorAll('svg').length,hydrationKeyRemoved:!button.hasAttribute('data-hk')}})()`);
      compareMarkup(got.html,{root:current.expected.root,descendants:current.expected.descendants});
      for(const[key,value]of Object.entries(current.expected.state??{}))if(got[key]!==value)throw new Error(`${key} expected ${value}, got ${got[key]}`);
      if(JSON.stringify(got.events)!==JSON.stringify(current.expected.events??[]))throw new Error(`events expected ${json(current.expected.events??[])}, got ${json(got.events)}`);
      if(got.focus!==(current.expected.focus??'none'))throw new Error(`focus expected ${current.expected.focus??'none'}, got ${got.focus}`);
      if(!got.hydrationKeyRemoved)throw new Error('Solid hydration key was not consumed');
      if(current.id==='loading-click'&&got.svg!==1)throw new Error('loading svg missing');
      return{component:'button',id:current.id,passed:true,ssr:'passed',hydration:'passed',nodeIdentity:'preserved',observation:{clicks:got.clicks,submits:got.submits,events:got.events,focus:got.focus,loadingSvg:got.svg}};
    }});
    results.push(...run.results);diagnostics.push(...run.diagnostics);telemetry.push({id:spec.id,...run.telemetry});
  }
  return{results,browserCells:results.length,diagnostics,telemetry,capabilities:['trusted-cdp','native-focus','hydration','isolated-vector-batches']};
}
