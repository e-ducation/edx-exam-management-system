import React, { Component } from 'react';
export default class Sidebar extends Component {
  render() {
    return (
      <div className="text-left">
        <ul className="tags-box">
          <li className={this.props.active === 'home' ? 'tag-current' : ''}>首页</li>
          <li className={this.props.active === 'manage' ? 'tag-current' : ''}>试卷管理</li>
          <li>考试任务</li>
        </ul>
      </div>
    );
  }
}