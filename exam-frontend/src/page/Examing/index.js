import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message, Spin, Breadcrumb } from 'antd';
import Footer from '../../components/Footer';
import HeaderStudent from '../../components/HeaderStudent';
import axios from 'axios';
import './index.scss';
import $ from "jquery";


class ExamingContainer extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
  }

  state = {
    name: '',
    total_problem_num: null,
    total_grade: null,
    passing_grade: null,
    description: '',
    problems: [],
    loading: true,
    timestamp_end: null,
    timestamp_now: null,
    showExaming: false,
    showSubmit: true,
    showPreview: false,
    showError: false,
  }

  componentDidMount() {
    // 获取试卷id
    // 获取试卷内容
    const id = window.location.href.split('/examing/')[1];
    const that = this;

    axios.get('/api/my_exam/exam_task/exam_answers?participant_id=' + id)
      .then((response) => {
        const res = response.data;

        // 可以进行考试
        if (res.status === 0) {
          const { name, passing_grade, problems, total_grade, total_problem_num, description, create_type } = res.data;
          this.setState({
            name,
            passing_grade,
            problems,
            total_grade,
            total_problem_num,
            description,
            loading: false,
            timestamp_end: Date.parse(new Date('2018/09/20'))
          })
          // 设置倒计时
          that.timer = setInterval(() => {
            const { timestamp_end, timestamp_now } = that.state;
            if (timestamp_now > timestamp_end) {
              clearInterval(this.timer);
              return false;
            }
            that.setState({
              timestamp_now: timestamp_now + 1000,
            });
          }, 1000)

        } else {
          message.error('请求失败');
        }
      })
      .catch(function (error) {
        message.error('请求失败')
      });

  }

  backToTop() {
    $("html,body").animate({ scrollTop: 0 }, 500)
  }

  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  goToStudentManage = () => {
    window.location.href = "/#/student_manage?tab=1"
  }


  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题
    const { name, passing_grade, problems, total_grade, total_problem_num, description, loading, showExaming, showSubmit, showPreview, showError } = this.state;
    const leftTime = this.state.timestamp_end - this.state.timestamp_now;
    const hours = this.checkTime(parseInt(leftTime / 1000 / 60 / 60 % 24, 10)); //计算剩余的小时
    const minutes = this.checkTime(parseInt(leftTime / 1000 / 60 % 60, 10));//计算剩余的分钟
    const seconds = this.checkTime(parseInt(leftTime / 1000 % 60, 10));//计算剩余的秒数

    return (
      <div style={{ width: '100%', wordBreak: 'break-word' }}>
        {
          loading ?
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Spin size="large" />
            </div>
            :
            <div>
              {
                this.props.showBackToTop ?
                  <div className="back-to-top" onClick={this.backToTop}>
                    <i className="iconfont" style={{ fontSize: '18px' }}>&#xe630;</i>
                  </div>
                  :
                  null
              }
              <Breadcrumb>
                <Breadcrumb.Item href="/#/student">
                  <Icon type="home" theme="outlined" style={{ fontSize: '14px', marginRight: '2px' }} />
                  <span>首页</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/#/student_manage">
                  <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe62e;</i>
                  <span>我的考试</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe67b;</i>
                  <span>考试作答</span>
                </Breadcrumb.Item>
              </Breadcrumb>
              {
                (() => {
                  // 1. 正在考试
                  // 2. 考试结束，提交成功
                  // 3. 考试结束，显示答卷
                  // 4. 错误信息提示框 : 未开始考试 / 找不到试卷
                  if (showExaming) {
                    // 1. 正在考试
                    return (
                      <div>
                        <div className="preview-block" style={{ textAlign: 'center' }}>
                          <h1 style={{ fontSize: '16px' }}>{name}</h1>
                          <h2 style={{ margin: '20px 0' }}>共{total_problem_num}题目<span style={{ margin: '0 10px' }}>试题总分: {total_grade}分</span>及格分: {passing_grade}分</h2>
                          <p style={{ textAlign: 'left' }}>{description}</p>
                        </div>
                        {
                          problems.map((item, index) => {
                            return (
                              <div className="preview-block" key={index}>
                                <div>
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
                                    （{item.grade}分）
                                </p>
                                  <div style={{ marginLeft: '18px' }}>
                                    {
                                      (() => {
                                        switch (item.problem_type) {
                                          case 'multiplechoiceresponse':
                                            return <Radio.Group style={{ display: 'block' }} defaultValue={null}>
                                              {
                                                item.content.options.map((item, index) => {
                                                  return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                                })
                                              }
                                            </Radio.Group>;

                                          case 'choiceresponse':
                                            return <Checkbox.Group defaultValue={null}>
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
                                              />
                                            </div>

                                          default:
                                            return null;
                                        }
                                      })()
                                    }
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        }
                        <div className="exam-count">
                          <p style={{ marginTop: '14px' }}>距离考试结束还有</p>
                          <div>
                            <span className="exam-count-time">{hours}</span>
                            <span className="exam-count-time">{minutes}</span>
                            <span className="exam-count-time">{seconds}</span>
                          </div>
                          <div>
                            <span className="exam-count-text">时</span>
                            <span className="exam-count-text">分</span>
                            <span className="exam-count-text">秒</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                          <Button type="primary">交卷</Button>
                        </div>
                      </div>
                    )
                  } else if (showSubmit) {
                    // 2. 考试结束，提交成功
                    return (
                      <div className="exam-msg-block">
                        <p style={{ marginBottom: '35px' }}>
                          <Icon type="check-circle" style={{ color: '#52c41a', marginRight: '15px' }} />试卷提交成功！
                        </p>
                        <Button type="primary" style={{ marginRight: '10px' }} onClick={this.goToStudentManage}>其他考试任务</Button>
                        <Button type="primary">查看成绩</Button>
                      </div>
                    )
                  } else if (showPreview) {
                    // 3. 考试结束，显示答卷
                  } else if (showError) {
                    // 4. 错误信息提示框

                  }
                })()
              }
            </div>
        }
      </div>
    )
  }
}



export default class Examing extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeigh,
    showBackToTop: false,
  }

  componentDidMount() {
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })


  }

  onChangeUpBtn = (val) => {
    this.setState({
      showBackToTop: val,
    })
  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px', minWidth: '649px' }
    return (
      <div>
        <HeaderStudent changeUpBtn={this.onChangeUpBtn} />
        <div className="container container-examing" style={containerHeight}>
          <ExamingContainer showBackToTop={this.state.showBackToTop} />
        </div>
        <Footer />
      </div>
    );
  }
}