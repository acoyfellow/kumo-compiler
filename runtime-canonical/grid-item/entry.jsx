import React from 'react';
import {GridItem as CanonicalComponent} from '@cloudflare/kumo/components/grid';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/grid";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
