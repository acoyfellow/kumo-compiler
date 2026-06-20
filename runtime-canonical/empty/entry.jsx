import React from 'react';
import {Empty as CanonicalComponent} from '@cloudflare/kumo/components/empty';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/empty";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
