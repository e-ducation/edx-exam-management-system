import React from 'react';
import { Icon } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ChoosePaperType from '../../components/ChoosePaperType';
import './index.scss';
import $ from "jquery";
class HomeContainer extends React.Component {
  state={
    visible: false,
  }

  componentDidMount() {
  }

  showModal = () => {
    this.setState({
      visible: true,
    })
  }

  hideModal = () =>{
    this.setState({
      visible: false,
    })
  }

  render() {
    return (
      <div className="displayFlx">
        <Sidebar active="home" />
        <div className="text-right-left home">
          <p style={{ margin: '10px 0 20px'}}>叶文洁，欢迎来到【公司名】考试管理系统，您可以在这里管理您的试卷和发布考试任务。</p>
          <div className="home-create" onClick={this.showModal}>
            <Icon type="edit" className="home-icon" style={{color:'#37c591'}}/>
            <div>我要创建试卷</div>
          </div>
          <div className="home-create">
            <Icon type="edit" className="home-icon" style={{color:'#95cd5b'}}/>
            <div>我要创建考试任务</div>
          </div>
          <h1 className="home-header">流程指引</h1>
          <div>
            <div className="home-process"><span className="home-process-index">1</span>创建试卷<span className="home-process-sign">></span></div>
            <div className="home-process"><span className="home-process-index">2</span>创建考试任务<span className="home-process-sign">></span></div>
            <div className="home-process"><span className="home-process-index">3</span>发布考试任务<span className="home-process-sign">></span></div>
            <div className="home-process"><span className="home-process-index">4</span>查看考试数据</div>
          </div>
          <div style={{marginTop:'30px'}}>
            <div className="home-guide">
              <span>1</span>
              <h3>创建</h3>
              <p>· 选取题目或出题范围</p>
              <p>· 完善试卷信息</p>
              <p>· 创建试卷成功！</p>
            </div>
            <div className="home-guide">
              <span>2</span>
              <h3>创建</h3>
              <p>· 选择本场考试使用的试卷</p>
              <p>· 设置考试时间和参加人员</p>
              <p>· 发布考试任务</p>
            </div>
            <div className="home-guide">
              <span>3</span>
              <h3>发布考试任务</h3>
              <p>考生进入学习中心的【我的考试】板块查看考试任务，并在考试的有效期内完成考试。</p>
            </div>
            <div className="home-guide">
              <span>4</span>
              <h3>查看考试数据</h3>
              <p>福克斯的弗兰克的酸辣粉</p>
            </div>
          </div>
          <ChoosePaperType visible={this.state.visible} hideModal={this.hideModal} />
        </div>
      </div>
    );
  }


}


export default class Home extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    showShadow: false,
  }

  componentDidMount(){
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

    $(document.body).scroll(() => {
      this.setState({
        showShadow: ($(window).height() !== $(document).height()) && $(document.body).scrollTop() > 0
      })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px'}
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <HomeContainer />
        </div>
        <Footer />
      </div>
    );
  }
}
/*
ReactDOM.render(
  <LocaleProvider locale={locales.zh_CN}><App /></LocaleProvider>, document.getElementById('home')
)
*/



