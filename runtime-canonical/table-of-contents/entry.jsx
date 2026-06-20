import React from 'react';
import {TableOfContents as CanonicalComponent} from '@cloudflare/kumo/components/table-of-contents';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/table-of-contents";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
