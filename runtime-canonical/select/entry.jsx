import React from 'react';
import {Select as CanonicalComponent} from '@cloudflare/kumo/components/select';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/select";
export function App(){return <main data-canonical-component="select"><CanonicalComponent label="Region" defaultValue="iad"><option value="iad">IAD</option><option value="sfo">SFO</option></CanonicalComponent></main>}
