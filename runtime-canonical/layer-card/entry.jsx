import React from 'react';
import {LayerCard as CanonicalComponent} from '@cloudflare/kumo/components/layer-card';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/layer-card";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
