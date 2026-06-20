import React from 'react';
import {CommandPalette as CanonicalComponent} from '@cloudflare/kumo/components/command-palette';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/command-palette";
export function App(){return <main data-canonical-component="command-palette"><><button type="button">Open command palette</button><CanonicalComponent.Root open={false} onOpenChange={()=>{}} items={['Audit']} itemToStringValue={x=>x}><CanonicalComponent.Input placeholder="Search" /><CanonicalComponent.List><CanonicalComponent.Item value="Audit">Audit</CanonicalComponent.Item></CanonicalComponent.List></CanonicalComponent.Root></></main>}
