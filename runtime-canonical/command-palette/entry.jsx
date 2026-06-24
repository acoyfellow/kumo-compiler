import React from 'react';
import {CommandPalette as CanonicalComponent} from '@cloudflare/kumo/components/command-palette';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/command-palette";
export function App(){return <main data-canonical-component="command-palette" data-fixture-digest="9ae69c06c9d93fcb0256250d090229b77d74f3723d8e15541b5997a622dee69e"><CanonicalComponent.Root open items={['Workers','Pages']} itemToStringValue={x=>x}><CanonicalComponent.Input placeholder="Search commands" /><CanonicalComponent.List><CanonicalComponent.Item value="Workers">Workers</CanonicalComponent.Item><CanonicalComponent.Item value="Pages">Pages</CanonicalComponent.Item></CanonicalComponent.List></CanonicalComponent.Root></main>}
