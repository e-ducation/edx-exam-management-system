import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.scss';
import Router from './route/Router';
import axios from 'axios';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './model/reducers';
import { Popover } from 'antd';
import Cookies from 'js-cookie';
let store = createStore(reducer)
axios.defaults.withCredentials = true
// 基础服务器
let baseURL = '';
let AUTH_TOKEN = '';
// 判断环境变量如果是开发模式设置
if (process.env.NODE_ENV == 'development') {
  baseURL = 'http://dev.ems.ngrok.elitemc.cn:8000/';
  AUTH_TOKEN = 'azm8BNcdJWYvtNzqLKJNSpeX8xSNhvgA4zQhaKOWiO2X4yUnelVm8wXj3DHzWAgA';
} else {
  AUTH_TOKEN = Cookies.get('csrftoken');
}
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
