import React from 'react';
import {Sidebar as CanonicalComponent} from '@cloudflare/kumo/components/sidebar';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/sidebar";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
