import React from 'react';
import {MenuBar as CanonicalComponent} from '@cloudflare/kumo/components/menubar';
import {fixture} from './fixture.jsx';
export const packageExport="@cloudflare/kumo/components/menubar";
export function App(){return <main data-canonical-component="menu-bar"><CanonicalComponent options={[{id:'overview',tooltip:'Overview',icon:'Overview'},{id:'settings',tooltip:'Settings',icon:'Settings'}]} optionIds isActive="overview" /></main>}
