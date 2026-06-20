import React from 'react';
import {Banner as CanonicalComponent} from '@cloudflare/kumo/components/banner';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/banner";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
