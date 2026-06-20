import React from 'react';
import {Loader as CanonicalComponent} from '@cloudflare/kumo/components/loader';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/loader";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
