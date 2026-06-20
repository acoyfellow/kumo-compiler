import React from 'react';
import {Toasty as CanonicalComponent} from '@cloudflare/kumo/components/toast';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/toast";
export function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}
