import '@cloudflare/kumo/styles/standalone';
import './fixture.css';
import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {App} from './entry.jsx';
hydrateRoot(document.getElementById('root'),<App/>);
