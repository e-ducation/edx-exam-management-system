import React,{ Component } from 'react';
import { Modal, Icon } from 'antd';
import './index.scss';
export default class choosePaperType extends Component {
  state = {
  }

  createFixPaper = () => {
    console.log('createfixpaper')
    window.location.href = "/#/new/fix"
  }

  createRandomPaper = () => {
    console.log('createrandompaper')
    window.location.href = "/#/new/random"
  }

  render() {
    return (
      <Modal
        title="选择出题方式"
        visible={this.props.visible}
        destroyOnClose={true}
        onCancel={this.props.hideModal}
        footer={null}
        width="600px"
      >
        <div className="block-fix" onClick={this.createFixPaper}>
          <div>
            <i className="iconfont icon" style={{ fontSize: '40px'}}>&#xe641;</i>
          </div>
          <h3>固定试题</h3>
          <p>所有考生的试题相同，试题的顺序可以固定，也可以打乱。</p>
        </div>
        <div className="block-random" onClick={this.createRandomPaper}>
          <div>
            <i className="iconfont icon">&#xe632;</i>
          </div>
          <h3>随机试题</h3>
          <p>设置试题抽取规则，随机生成试卷，每个考生的试卷都不同。</p>
        </div>
      </Modal>
    );
  }
}