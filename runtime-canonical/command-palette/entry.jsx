import React from 'react';
import {CommandPalette as CanonicalComponent} from '@cloudflare/kumo/components/command-palette';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/command-palette";
export function App(){return <main data-canonical-component="command-palette"><CanonicalComponent.Root open items={['Workers','Pages']} itemToStringValue={x=>x}><CanonicalComponent.Input placeholder="Search commands" /><CanonicalComponent.List><CanonicalComponent.Item value="Workers">Workers</CanonicalComponent.Item><CanonicalComponent.Item value="Pages">Pages</CanonicalComponent.Item></CanonicalComponent.List></CanonicalComponent.Root></main>}
