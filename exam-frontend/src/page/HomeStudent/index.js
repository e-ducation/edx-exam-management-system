import React from 'react';
import { message, Icon } from 'antd';
import Footer from '../../components/Footer';
import HeaderStudent from '../../components/HeaderStudent';
import axios from 'axios';
import './index.scss';
import $ from "jquery";
class HomeStudentContainer extends React.Component {
  state = {
    username: '',
  }

  componentDidMount() {
    // 获取用户信息
    this.setState({
      username: '王小明',
    })
  }

  goToManage = (tab) => {
    window.location.href = '/#/student_manage?tab=' + tab;
  }


  render() {
    return (
      <div className="student-home">
        <p style={{ marginBottom: '20px' }}>{this.state.username}，欢迎进入考试中心。</p>
        <div>
          <div className="block block-underway" onClick={this.goToManage.bind(this, 1)}>
            <i className="iconfont icon-underway">&#xe673;</i>
            <p>你有1个考试正在进行中</p>
            <p className="a">点击查看</p>
          </div>
          <div className="block block-nobegin" style={{ margin: '0 2%' }} onClick={this.goToManage.bind(this, 2)}>
            <i className="iconfont icon-nobegin">&#xe66e;</i>
            <p>你有1个考试即将开始</p>
            <p className="a">点击查看</p>
          </div>
          <div className="block block-score" onClick={this.goToManage.bind(this, 3)}>
            <i className="iconfont icon-score">&#xe66f;</i>
            <p>我的考试成绩</p>
            <p className="a">点击查看</p>
          </div>
        </div>
      </div>
    );
  }
}


export default class HomeStudent extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  }

  componentDidMount() {
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px' }
    return (
      <div>
        <HeaderStudent />
        <div className="container" style={containerHeight}>
          <HomeStudentContainer />
        </div>
        <Footer />
      </div>
    );
  }
}


