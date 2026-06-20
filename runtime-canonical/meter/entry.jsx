import React from 'react';
import {Meter as CanonicalComponent} from '@cloudflare/kumo/components/meter';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/meter";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
