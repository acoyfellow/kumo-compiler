import React from 'react';
import {Table as CanonicalComponent} from '@cloudflare/kumo/components/table';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/table";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
