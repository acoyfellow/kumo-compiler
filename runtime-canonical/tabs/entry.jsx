import React from 'react';
import {Tabs as CanonicalComponent} from '@cloudflare/kumo/components/tabs';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/tabs";
export function App(){return <main data-canonical-component="tabs"><CanonicalComponent tabs={[{value:'overview',label:'Overview'},{value:'settings',label:'Settings'}]} value="overview" /></main>}
