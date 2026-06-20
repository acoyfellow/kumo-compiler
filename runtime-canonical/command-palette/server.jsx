import React from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './entry.jsx';
export const render=()=>renderToString(<App/>);
