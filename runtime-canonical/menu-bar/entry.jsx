import React from 'react';
import {MenuBar as CanonicalComponent} from '@cloudflare/kumo/components/menubar';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/menubar";
export function App(){return <main data-canonical-component="menu-bar"><CanonicalComponent options={[{id:'overview',label:'Overview'},{id:'settings',label:'Settings'}]} optionIds={['overview','settings']} isActive={id=>id==='overview'} /></main>}
