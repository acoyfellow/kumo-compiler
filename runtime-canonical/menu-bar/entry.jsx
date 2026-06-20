import React from 'react';
import {MenuBar as CanonicalComponent} from '@cloudflare/kumo/components/menubar';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/menubar";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
