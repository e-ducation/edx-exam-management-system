import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.scss';
import Router from './route/Router';
import axios from 'axios';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import  reducer from './model/reducers';
import { Popover } from 'antd';
let store = createStore(reducer)
axios.defaults.withCredentials = true
// 基础服务器
const baseURL = 'http://ems.ngrok.elitemc.cn';
const AUTH_TOKEN = 'yNxRv0ELSxcDN0ZDSBNW3K0ajdpIjZQA3xXbCzSBS0XIQlo1Is7wCSWkwu78eBdn';
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['X-CSRFToken'] = AUTH_TOKEN;
// import registerServiceWorker from './registerServiceWorker';
console.log(store.getState())

console.log(Router)
ReactDOM.render(
  <HashRouter>
    <Provider store={store}>
      <Router />
    </Provider>
  </HashRouter>,
  document.getElementById('root'));
// registerServiceWorker();
