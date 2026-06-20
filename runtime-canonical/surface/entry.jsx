import React from 'react';
import {Surface as CanonicalComponent} from '@cloudflare/kumo/components/surface';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/surface";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
