import React,{ Component } from 'react';
import { Modal, message, Radio, Checkbox } from 'antd';
import './index.scss';
import axios from 'axios';
export default class ProblemDetail extends Component {
  state = {
    visible: false,
    type: "multiplechoiceresponse",
    id: "hello+hello+20180101+type@problem+block@e08c4d4357db4f52a9aa32de51f7a70d",
    options: [],
    title: '123',
  }

  componentDidMount() {

  }

  showModal = (id) => {
    const that = this;
    axios.post('/api/problems/detail/', {
      problem: [id]
      })
      .then(function (response) {
        const res = response.data;
        if (res.status === 200){
          that.getList();
        } else {
          message.error('请求失败');
        }

      })
      .catch(function (error) {
        message.error('请求失败')
      });
    this.setState({
      visible: true,
    })

    // 解析xml
    const markdown = "<problem>\n  <p>沃尔玛通过分析飓风来临前的销售数据发现啤酒是销路最好的商品，因此在恶劣气象发生前会对受影响地区的连锁商店增加啤酒的配送量。以下哪种说法是对这种决策的正确描述？</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"沃尔玛通过分析飓风来临前的销售数据发现啤酒是销路最好的商品，因此在恶劣气象发生前会对受影响地区的连锁商店增加啤酒的配送量。以下哪种说法是对这种决策的正确描述？\" type=\"MultipleChoice\">\n      <choice correct=\"false\">根据直觉和经验作出决策</choice>\n      <choice correct=\"false\">利用客户关系管理增加销售</choice>\n      <choice correct=\"true\">数据驱动决策的应用</choice>\n      <choice correct=\"false\">利用价格调节需求</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>沃尔玛通过分析历史数据对需求进行预测，以达到增加销售的目的。因此数据驱动决策选项正确。</p>\n    </div>\n  </solution>\n  <p>对于课程中美国运通（Amex）的案例，可以推测“顾客流失预测”模型的目标变量是</p>\n  <multiplechoiceresponse>\n    <choicegroup label=\"对于课程中美国运通（Amex）的案例，可以推测“顾客流失预测”模型的目标变量是\" type=\"MultipleChoice\">\n      <choice correct=\"true\">顾客是否流失</choice>\n      <choice correct=\"false\">顾客是否搬家</choice>\n      <choice correct=\"false\">顾客是否不再继续缴纳会员费用</choice>\n      <choice correct=\"false\">购物频率明显降低的顾客的特点</choice>\n    </choicegroup>\n  </multiplechoiceresponse>\n  <solution>\n    <div class=\"detailed-solution\">\n      <p>【解析】</p>\n      <p>在课程案例中，“顾客流失预测”模型用来预测顾客流失的可能性，从而有充分的时间采取措施，挽留客户。所以目标变量是“顾客是否流失”。</p>\n    </div>\n  </solution>\n</problem>\n";

  }

  hideModal = () => {
    this.setState({
      visible: false,
    })
  }

  render() {
    const { type, title, options } = this.state;
    return (
      <Modal
        title="查看题目"
        visible={this.state.visible}
        destroyOnClose={true}
        onCancel={this.hideModal}
        width="600px"
      >
        <div>
          <p className="preview-title">
            <span className="preview-type">
              {
                (() => {
                  switch (type) {
                    case 'multiplechoiceresponse':
                      return '[单选题]';
                    case 'choiceresponse':
                      return '[多选题]';
                    case 'fill':
                      return '[填空题]';
                    case 'judge':
                      return '[判断题]';
                    default:
                      return null;
                  }
                })()
              }
            </span>
            {title}
          </p>
          <div style={{ marginLeft: '18px'}}>
            {
              (() => {
                switch (type) {
                  case 'multiplechoiceresponse':
                    return <Radio.Group style={{display:'block'}} defaultValue={null}>
                        {
                          options.map((item, index) => {
                            return <Radio style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Radio>
                          })
                        }
                      </Radio.Group>;

                  case 'choiceresponse':
                    return <Checkbox.Group defaultValue={null}>
                      {
                        options.map((item, index) => {
                          return <Checkbox style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Checkbox>
                        })
                      }
                    </Checkbox.Group>;

                  /*
                  case 'fill':
                    return <div>
                      {
                        input.map((answer, index) => {
                          return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                            <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                            <Input.TextArea
                              autosize={{ minRows: 1, maxRows: 6 }}
                              style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                            />
                          </div>
                        })
                      }
                    </div>
                  */

                  case 'judge':
                    return <Radio.Group style={{display:'block'}} defaultValue={null}>
                      <Radio style={{display:'block', height: '30px', lineHeight: '30px'}} value={true}>正确</Radio>
                      <Radio style={{display:'block', height: '30px', lineHeight: '30px'}} value={false}>错误</Radio>
                    </Radio.Group>;

                  default:
                      return null;
                }
              })()
            }
          </div>
        </div>
      </Modal>
    );
  }
}