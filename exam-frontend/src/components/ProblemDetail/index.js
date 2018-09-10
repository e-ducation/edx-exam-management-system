import React,{ Component } from 'react';
import { Modal, Radio, Checkbox, Spin, Button } from 'antd';
import './index.scss';
export default class ProblemDetail extends Component {
  state = {
    visible: false,
    item: null,
  }

  showModal = (item) => {
    if (item){
      this.setState({
        item,
        visible: true,
      })
    }
  }

  hideModal = () => {
    this.setState({
      visible: false,
    })
  }

  render() {
    const { item } = this.state;
    const loading = !Boolean(item);
    return (
      <Modal
        title="查看题目"
        visible={this.state.visible}
        destroyOnClose={true}
        width="600px"
        footer={[<Button key="cancel" type="primary" onClick={this.hideModal}>确定</Button>]}
      >
        {
          loading ?
            <Spin />
          :
            <div className="preview-block" style={{ margin: 0, padding: 0, border:'none'}}>
              <p className="preview-title">
                <span className="preview-type">
                  {
                    (() => {
                      switch (item.problem_type) {
                        case 'multiplechoiceresponse':
                          return '[单选题]';
                        case 'choiceresponse':
                          return '[多选题]';
                        case 'stringresponse':
                          return '[填空题]';
                        default:
                          return null;
                      }
                    })()
                  }
                </span>
                {item.content.title}
              </p>
              <div>
                {
                  (() => {
                    switch (item.problem_type) {
                      case 'multiplechoiceresponse':
                        return <Radio.Group style={{display:'block', marginLeft: '18px'}} value={item.content.answers[0]}>
                            {
                              item.content.options.map((item, index) => {
                                return <Radio style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Radio>
                              })
                            }
                          </Radio.Group>;

                      case 'choiceresponse':
                        return <Checkbox.Group value={item.content.answers} style={{marginLeft:'18px'}}>
                          {
                            item.content.options.map((item, index) => {
                              return <Checkbox style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Checkbox>
                            })
                          }
                        </Checkbox.Group>;

                      case 'stringresponse':
                        return <div>
                          {
                            item.content.answers ?
                              <div style={{color:'#2E313C', marginBottom:'10px'}}>备选答案1 :{item.content.answers}</div>
                            :
                              null
                          }
                          {
                            item.content.additional_answer ?
                              <div style={{color:'#2E313C', marginBottom:'10px'}}>备选答案2 :{item.content.additional_answer}</div>
                            :
                              null
                          }
                        </div>

                      default:
                          return null;
                    }
                  })()
                }
              </div>
              {
                item.content.solution ?
                  <p className="preview-title" style={{margin:'30px 0 0 0'}}>
                    <span className="preview-type">[答案解析]</span>
                    {item.content.solution}
                  </p>
                :
                  null
              }

            </div>
        }
      </Modal>
    );
  }
}