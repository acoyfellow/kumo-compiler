import React from 'react';
import {CommandPalette as CanonicalComponent} from '@cloudflare/kumo/components/command-palette';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/command-palette";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
