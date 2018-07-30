import React, { Component } from 'react';
import $ from 'jquery';
export default class Header extends React.Component {
  render() {
    const { share } = this.props;
    const width = $(document).width() + 6 + 'px';
    return (
      <div className="header">
        <div className="header-wrap" style={this.props.showShadow ? {boxShadow: '0px -1px 7px 0px rgba(0,0,0,.5)', width, borderBottom: 'none'} : {width}}>
          <div className="header-content">
            <a href="/netdisk" style={{color:'rgba(0, 0, 0, 0.65)'}}>
              <div className="header-logo">
                <i className="iconfont" style={{ color: '#fff', lineHeight: '20px', fontSize:'22px' }}>&#xe601;</i>
              </div>
              <span className="logo-text">考试管理系统</span>
            </a>
            {
              !share &&
              <div className="link-menu">
                <a className="text-link" href="/">
                  课程管理<i className="iconfont" style={{verticalAlign:'middle', fontSize:'14px',marginLeft: '10px' }}>&#xe62a;</i>
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}