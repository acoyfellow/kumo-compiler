import '@cloudflare/kumo/styles/standalone';
import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {App} from './entry.jsx';
hydrateRoot(document.getElementById('root'),<App/>);
