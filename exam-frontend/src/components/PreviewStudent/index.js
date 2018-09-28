import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message, Spin } from 'antd';
import './index.scss';
import $ from "jquery";


export default class PreviewStudentContainer extends React.Component {
  state = {
    loading: false,
  }

  componentDidMount() {
    // 获取试卷id
    // 获取编辑的试卷信息及题目ids
    const id = window.location.href.split('/exam/')[1];
  }

  backToTop() {
    $("html,body").animate({ scrollTop: 0 }, 500)
  }

  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题
    const { loading } = this.state;
    const { exam_task, results, total_grade, participant_name } = this.props.data;

    return (
      <div style={{ width: '100%', wordBreak: 'break-word' }}>
        {
          loading ?
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Spin size="large" />
            </div>
            :
            <div>
              <div className="print-btn">
                {
                  this.props.showBackToTop ?
                    <div className="back-to-top" onClick={this.backToTop}>
                      <Icon type="arrow-up" />
                    </div>
                    :
                    null
                }
              </div>
              {
                /* 及格或不及格 */
                exam_task.exampaper_passing_ratio > total_grade ?
                  <p style={{ color: '#f5222d', fontSize: '18px', margin: '20px 0', textAlign: 'center'}}>不合格，您还需继续努力</p>
                :
                  <p style={{ color: '#95cd5b', fontSize: '18px', margin: '20px 0', textAlign: 'center'}}>恭喜你，及格了</p>
              }
              <div className="preview-block" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '16px' }}>{exam_task.name}</h1>
                <h2 style={{ margin: '20px 0' }}>共{exam_task.exampaper_total_problem_num}题目<span style={{ margin: '0 10px' }}>试题总分: {exam_task.exampaper_total_grade}分</span>及格分: {exam_task.exampaper_passing_ratio}分</h2>
                <p style={{ textAlign: 'left' }}>{exam_task.exampaper_description}</p>
              </div>
              {
                results.map((item, index) => {
                  return (
                    <div className="preview-block" key={index} style={item.grade === item.problem_grade ? {border:'1px solid #95cd5b', padding:0,} : {border:'1px solid #f5222d', padding: 0}}>
                      {
                        item.grade === item.problem_grade ?
                          <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#95cd5b", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                            <Icon type="check" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                          </div>
                          :
                          <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#f5222d", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                            <Icon type="close" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                          </div>
                      }
                      <div style={{ padding: '20px 50px 20px 25px' }}>
                        <p className="preview-title">
                          {index + 1}.
                        <span className="preview-type">
                            {
                              (() => {
                                switch (item.problem_type) {
                                  case 'multiplechoiceresponse':
                                    return '[单选题]';
                                  case 'choiceresponse':
                                    return '[多选题]';
                                  case 'fill':
                                    return '[填空题]';
                                  default:
                                    return null;
                                }
                              })()
                            }
                          </span>
                          {item.content.title}
                          （{item.problem_grade}分）
                      </p>
                        <div style={{ marginLeft: '18px' }}>
                          {
                            (() => {
                              switch (item.problem_type) {
                                case 'multiplechoiceresponse':
                                  return <Radio.Group style={{ display: 'block' }} value={item.answer}>
                                    {
                                      item.content.options.map((item, index) => {
                                        return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                      })
                                    }
                                  </Radio.Group>;

                                case 'choiceresponse':
                                  return <Checkbox.Group value={item.answer}>
                                    {
                                      item.content.options.map((item, index) => {
                                        return <Checkbox style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Checkbox>
                                      })
                                    }
                                  </Checkbox.Group>;

                                case 'stringresponse':
                                  return <div>
                                    <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                    <Input.TextArea
                                      autosize={{ minRows: 1, maxRows: 6 }}
                                      style={{ width: '385px', display: 'inline-block', marginLeft: '15px', verticalAlign: 'text-top' }}
                                      maxLength="2000"
                                      value={item.answer}
                                    />
                                  </div>

                                default:
                                  return null;
                              }
                            })()
                          }
                        </div>
                      </div>
                      {
                        exam_task.show_answer ?
                          <div className={ item.grade === item.problem_grade ? 'answerShow' : 'answerShowRed'}>
                            <p>正确答案：
                            {
                              item.content.answers.map(item => {
                                return (<span style={{ marginRight: '4px' }}>{String.fromCharCode(65 + parseInt(item))}</span>)
                              })
                            }
                            </p>
                            <p>{item.content.solution}</p>
                          </div>
                          :
                          null
                      }
                    </div>
                  )
                })
              }
            </div>
        }
      </div>
    )
  }
}