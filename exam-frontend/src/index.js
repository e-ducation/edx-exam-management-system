import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.scss';
import Router from './route/Router';
import axios from 'axios';
axios.defaults.withCredentials = true
// 基础服务器
const baseURL = 'http://ems.ngrok.elitemc.cn';
const AUTH_TOKEN = 'yNxRv0ELSxcDN0ZDSBNW3K0ajdpIjZQA3xXbCzSBS0XIQlo1Is7wCSWkwu78eBdn';
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['X-CSRFToken'] = AUTH_TOKEN;
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <HashRouter>
    <Router />
  </HashRouter>,
  document.getElementById('root'));
// registerServiceWorker();
