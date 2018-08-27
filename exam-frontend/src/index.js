import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.scss';
import Router from './route/Router';
import axios from 'axios';
axios.defaults.withCredentials = true
// 基础服务器
const baseURL = 'http://ems.ngrok.elitemc.cn';
const AUTH_TOKEN = 'x4VtrWLhAQwH7qIp3QXMGcFxqfnF8SUaXSnxFZide1kj9M1Kil1z0YacMvHg8QK7';
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['X-CSRFToken'] = AUTH_TOKEN;
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <HashRouter>
    <Router />
  </HashRouter>,
  document.getElementById('root'));
// registerServiceWorker();
