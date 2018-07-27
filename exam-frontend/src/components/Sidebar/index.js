import React, { Component } from 'react';
export default class Sidebar extends Component {
  render() {
    return (
      <div className="text-left">
        <ul className="tags-box">
          <li className={this.props.active === 'home' ? 'tag-current' : ''}><a href="/#/">首页</a></li>
          <li className={this.props.active === 'manage' ? 'tag-current' : ''}><a href="/#/manage">试卷管理</a></li>
          <li><a>考试任务</a></li>
        </ul>
      </div>
    );
  }
}