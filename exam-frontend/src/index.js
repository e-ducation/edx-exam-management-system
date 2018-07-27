import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.scss';
import Router from './route/Router';
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <HashRouter>
    <Router />
  </HashRouter>,
  document.getElementById('root'));
// registerServiceWorker();
