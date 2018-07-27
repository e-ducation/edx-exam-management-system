import React, { Component } from 'react';
export default class Header extends Component {
    render() {
      return (
        <div className="header">
          <div className="header-wrap">
            <div className="header-content">
              <a href="" style={{color:'rgba(0, 0, 0, 0.65)'}}>
                <div className="header-logo"></div>
                <span className="logo-text">考试管理系统</span>
              </a>
              <div className="link-menu">
                  <a className="text-link" href="/">
                       课程管理<i className="iconfont" style={{verticalAlign:'middle', fontSize:'14px',marginLeft: '10px' }}>&#xe62a;</i>
                  </a>
                </div>
            </div>
          </div>
        </div>
      );
    }
  }