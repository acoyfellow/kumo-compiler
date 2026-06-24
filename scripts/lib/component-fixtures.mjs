import {createHash} from 'node:crypto';

// Single framework-neutral product fixture authority for the component catalog.
// Framework builders may adapt these values to native children/slot APIs, but must
// not maintain independent fixture content.
export const selectedVectorIndex={
  'command-palette':1
};

export const children={
  badge:'PRO',
  breadcrumbs:'Home / Settings',
  button:'Save changes',
  checkbox:'',
  code:'const edge = true;',
  grid:'Responsive grid area',
  label:'Account email',
  link:'Read docs',
  switch:'',
  text:'Presentational text copy',
  toasty:'Save notification',
  surface:'Surface content',
  'layer-card':'Primary layer content',
  empty:'No matching records',
  'clipboard-text':'copy-this-value'
};

export const props={
  autocomplete:{placeholder:'Search fruit','aria-label':'Autocomplete',defaultOpen:true},
  checkbox:{'aria-label':'Audit checkbox',defaultChecked:true},
  combobox:{placeholder:'Fruit','aria-label':'Combobox',defaultOpen:true},
  field:{id:'field-control',label:'Name',description:'Help',required:false,value:'example',modelValue:'example'},
  input:{'aria-label':'Input',placeholder:'Input',value:'example',defaultValue:'example',disabled:false},
  'input-area':{'aria-label':'Input area',placeholder:'Input area',value:'Example notes',defaultValue:'Example notes'},
  'menu-bar':{options:[{id:'overview',icon:'Overview',tooltip:'Overview'},{id:'settings',icon:'Settings',tooltip:'Settings'}],optionIds:true,isActive:'overview'},
  meter:{label:'Storage',value:65},
  pagination:{page:2,perPage:10,totalCount:95},
  radio:{value:'standard',items:[{value:'standard',label:'Standard'},{value:'advanced',label:'Advanced'}]},
  select:{'aria-label':'Select',placeholder:'Region'},
  'sensitive-input':{label:'API token',placeholder:'API token',value:'secret-token',defaultValue:'secret-token'},
  switch:{'aria-label':'Audit switch',defaultChecked:true},
  tabs:{tabs:[{value:'overview',label:'Overview'},{value:'settings',label:'Settings'}],selectedValue:'overview',value:'overview'},
  table:{caption:'Request summary'},
  'cloudflare-logo':{'aria-label':'Cloudflare'}
};

export const omitContractFixture=new Set(['field','breadcrumbs']);

// React is the canonical package adapter for the same fixture plan. Compound
// APIs require native JSX composition, but all visible content/values below are
// sourced from this module rather than a second runtime fixture family.
export const reactComposition={
  badge:`<CanonicalComponent>PRO</CanonicalComponent>`,
  banner:`<CanonicalComponent title="Notice" description="Details" />`,
  button:`<CanonicalComponent>Save changes</CanonicalComponent>`,
  breadcrumbs:`<CanonicalComponent><CanonicalComponent.Link href="/">Home</CanonicalComponent.Link><CanonicalComponent.Separator /><CanonicalComponent.Current>Settings</CanonicalComponent.Current></CanonicalComponent>`,
  select:`<CanonicalComponent label="Region" defaultValue="iad"><option value="iad">IAD</option><option value="sfo">SFO</option></CanonicalComponent>`,
  dialog:`<CanonicalComponent.Root><CanonicalComponent.Trigger>Open settings</CanonicalComponent.Trigger><CanonicalComponent><CanonicalComponent.Title>Settings</CanonicalComponent.Title><CanonicalComponent.Description>Update account settings</CanonicalComponent.Description></CanonicalComponent></CanonicalComponent.Root>`,
  checkbox:`<CanonicalComponent defaultChecked aria-label="Audit checkbox" />`,
  switch:`<CanonicalComponent defaultChecked aria-label="Audit switch" />`,
  input:`<CanonicalComponent aria-label="Input" defaultValue="example" />`,
  'input-area':`<CanonicalComponent aria-label="Input area" defaultValue="Example notes" />`,
  'sensitive-input':`<CanonicalComponent label="API token" defaultValue="secret-token" />`,
  'clipboard-text':`<CanonicalComponent text="copy-this-value" />`,
  tabs:`<CanonicalComponent tabs={[{value:'overview',label:'Overview'},{value:'settings',label:'Settings'}]} value="overview" />`,
  'menu-bar':`<CanonicalComponent options={[{id:'overview',tooltip:'Overview',icon:'Overview'},{id:'settings',tooltip:'Settings',icon:'Settings'}]} optionIds isActive="overview" />`,
  sidebar:`<CanonicalComponent.Provider mobileBreakpoint={1}><CanonicalComponent><CanonicalComponent.Header>Product</CanonicalComponent.Header><CanonicalComponent.Content><CanonicalComponent.Group><CanonicalComponent.GroupLabel>Build</CanonicalComponent.GroupLabel><CanonicalComponent.Menu><CanonicalComponent.MenuItem><CanonicalComponent.MenuButton>Home</CanonicalComponent.MenuButton></CanonicalComponent.MenuItem><CanonicalComponent.MenuItem><CanonicalComponent.MenuButton>Domains</CanonicalComponent.MenuButton></CanonicalComponent.MenuItem></CanonicalComponent.Menu></CanonicalComponent.Group></CanonicalComponent.Content></CanonicalComponent></CanonicalComponent.Provider>`,
  loader:`<CanonicalComponent aria-label="Loading" />`,
  meter:`<CanonicalComponent label="Storage" value={65} />`,
  empty:`<CanonicalComponent title="No results" />`,
  link:`<CanonicalComponent href="/docs">Read docs</CanonicalComponent>`,
  text:`<CanonicalComponent>Presentational text copy</CanonicalComponent>`,
  table:`<CanonicalComponent><CanonicalComponent.Header><CanonicalComponent.Row><CanonicalComponent.Head>Name</CanonicalComponent.Head></CanonicalComponent.Row></CanonicalComponent.Header><CanonicalComponent.Body><CanonicalComponent.Row><CanonicalComponent.Cell>Kumo</CanonicalComponent.Cell></CanonicalComponent.Row></CanonicalComponent.Body></CanonicalComponent>`,
  'cloudflare-logo':`<CanonicalComponent aria-label="Cloudflare" />`,
  code:`<CanonicalComponent code="const edge = true;" lang="ts" />`,
  'command-palette':`<CanonicalComponent.Root open items={['Workers','Pages']} itemToStringValue={x=>x}><CanonicalComponent.Input placeholder="Search commands" /><CanonicalComponent.List><CanonicalComponent.Item value="Workers">Workers</CanonicalComponent.Item><CanonicalComponent.Item value="Pages">Pages</CanonicalComponent.Item></CanonicalComponent.List></CanonicalComponent.Root>`,
  'date-picker':`<CanonicalComponent mode="single" defaultMonth={new Date(2026,5,1)} />`,
  'date-range-picker':`<CanonicalComponent onStartDateChange={()=>{}} onEndDateChange={()=>{}} />`,
  field:`<CanonicalComponent id="field-control" label="Name" description="Help" defaultValue="example" />`,
  grid:`<CanonicalComponent>Responsive grid area</CanonicalComponent>`,
  'grid-item':`<CanonicalComponent>Grid item</CanonicalComponent>`,
  label:`<CanonicalComponent>Account email</CanonicalComponent>`,
  'layer-card':`<CanonicalComponent>Primary layer content</CanonicalComponent>`,
  surface:`<CanonicalComponent>Surface content</CanonicalComponent>`,
  radio:`<CanonicalComponent aria-label="Plan" defaultValue="free"><CanonicalComponent.Item value="free">Free</CanonicalComponent.Item><CanonicalComponent.Item value="pro">Pro</CanonicalComponent.Item></CanonicalComponent>`,
  pagination:`<CanonicalComponent page={2} perPage={10} totalCount={95} />`
};

export function fixtureFor(name, contract, symbol){
  const vector=contract.vectors?.[selectedVectorIndex[name]??0];
  const value={...(vector?.fixture?.props||vector?.props||{})};
  for(const key of Object.keys(value))if(key.startsWith('on')||!/^[$A-Z_a-z][$\w]*$/.test(key))delete value[key];
  Object.assign(value,props[name]||{});
  if(['checkbox','switch'].includes(name))delete value.checked;
  if(name==='select'){delete value.open;delete value.value}
  if(name==='date-picker'||name==='date-range-picker')value['aria-label']=symbol;
  if(name==='input'||name==='input-area'||name==='sensitive-input'){
    value['aria-label']=value['aria-label']||symbol;
    value.placeholder=value.placeholder||symbol;
  }
  if(name==='select'||name==='autocomplete'||name==='combobox')value['aria-label']=value['aria-label']||symbol;
  if(vector?.fixture&&!omitContractFixture.has(name))value.fixture=vector.fixture;
  const childValue=Object.prototype.hasOwnProperty.call(children,name)?children[name]:symbol.replace(/([a-z])([A-Z])/g,'$1 $2');
  const authority={component:name,vectorId:vector?.id??null,props:value,children:childValue,reactAdapter:reactComposition[name]??null};
  return {vector,props:value,children:childValue,digest:createHash('sha256').update(JSON.stringify(authority)).digest('hex')};
}
