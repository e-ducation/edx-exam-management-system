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
let baseURL = '';
// 判断环境变量如果是开发模式设置
if(process.env.NODE_ENV == 'development'){
    baseURL = 'http://ems.ngrok.elitemc.cn';
}
const AUTH_TOKEN = 'x4VtrWLhAQwH7qIp3QXMGcFxqfnF8SUaXSnxFZide1kj9M1Kil1z0YacMvHg8QK7';
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['X-CSRFToken'] = AUTH_TOKEN;
ReactDOM.render(
  <HashRouter>
    <Provider store={store}>
      <Router />
    </Provider>
  </HashRouter>,
  document.getElementById('root'));
// registerServiceWorker();
