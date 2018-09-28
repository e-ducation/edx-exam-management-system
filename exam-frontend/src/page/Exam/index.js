import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message, Spin, Breadcrumb, Modal} from 'antd';
import Footer from '../../components/Footer';
import HeaderStudent from '../../components/HeaderStudent';
import PreviewStudent from '../../components/PreviewStudent';
import axios from 'axios';
import './index.scss';
import $ from "jquery";


class ExamContainer extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.participant_id = null;
  }

  state = {
    /* mode = started 考试中 / finished 考试结束 / submit_success 显示试卷提交成功 / error 显示错误信息 */
    mode: 'started',
    exam_task: {},
    results: [],
    timestamp_end: null,
    timestamp_now: null,
    loading: true,
    /* unFillArr 保存的是 index + 1 */
    unFillArr: [],
    previewData: {},
    errorMsg: '',
  }

  componentDidMount() {
    this.getExam();
  }


  componentWillUnmount(){
    clearInterval(this.timer)
  }

  getExam = () => {
    // 获取试卷participant_id
    const id = window.location.href.split('/exam/')[1];

    // 正常请求
    this.setState({
      loading: true,
    }, () => {
      axios.get('/api/my_exam/exam_task/exam_answers?participant_id=' + id)
        .then((response) => {
          const res = response.data;
          if (res.status === 0 && res.data.task_state === 'started') {

              const { participant_id, task_state, current_time, participant_time, exam_task, results } = res.data;
              this.setState({
                mode: task_state,
                exam_task,
                results,
                timestamp_end: Date.parse(new Date(participant_time)) + exam_task.exam_time_limit * 60 * 1000,
                timestamp_now: Date.parse(new Date(current_time)),
                loading: false,
              }, () => {
                // 设置倒计时
                this.timer = setInterval(() => {
                  const { timestamp_end, timestamp_now } = this.state;
                  if (timestamp_now - timestamp_end > -1) {
                    // 自动交卷，清除倒计时
                    clearInterval(this.timer);
                    this.submit();
                    return false;
                  }
                  this.setState({
                    timestamp_now: timestamp_now + 1000,
                  });

                  // 倒计时少于0秒，自动交卷
                }, 1000)
              });
              this.participant_id = participant_id;
          } else if (res.status === 0 && res.data.task_state === 'finished'){
            // 2. 考试已结束
            this.setState({
              mode: res.data.task_state,
              previewData:res.data,
            })
          } else if (res.status === -1 && res.message){
            this.setState({
              mode: 'error',
              errorMsg: res.message,
            })
          } else {
            message.error('请求失败');
          }

          this.setState({
            loading: false,
          })
        })
        .catch((error) => {
          // message.error('请求失败')
        });
    })
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

  // 更改单选题答案
  onChangeRadioAnswer = (index, e) => {
    this.setAnswer(index, e.target.value);
  }

  // 更改多选题答案
  onChangeCheckboxAnswer = (index, values) => {
    this.setAnswer(index, values);
  }

  // 更改选择题答案
  onChangeInputAnswer = (index, e) => {
    this.setAnswer(index, e.target.value);
  }

  setAnswer = (index, val) => {
    let { results, unFillArr } = this.state;
    results[index].answer = val;

    // PUT/PATCH 提交单个题目
    axios.put('/api/my_exam/exam_task/exam_answers/' + this.state.results[index].id + '/', { answer: '' + this.state.results[index].answer})
      .then((response) => {
        const res = response.data;
        if (res.status === 0) {

        } else {
          message.error('请求失败')
        }
      })
      .catch((error) => {
        message.error('请求失败')
      });


    // 如果题目边框红色，去掉颜色, unFillArr存储的是
    const a = unFillArr.indexOf(index);
    if (a > -1){
      unFillArr.splice(a, 1)
    }

    this.setState({
      results,
      unFillArr,
    });
  }


  // 点击交卷
  onClickSubmit = () => {
    // 检查选项是否为空
    const { results } = this.state;
    let unFillArr = [];
    for (let i = 0; i < results.length; i++){
      if (!results[i].answer || results[i].answer.length === 0){
        unFillArr.push(i);
      }
    }

    if (unFillArr.length > 0){
      // 有选项非空
      this.setState({
        unFillArr,
      })

      const strArr = unFillArr.map((item) => { return item + 1});
      Modal.confirm({
        iconType: 'exclamation-circle',
        title: '提示',
        content: '第【' + strArr.join(', ') + '】题未答题，交卷后将无法修改答案，确定交卷？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.submit();
        }
      });
      return false;
    } else {
      // 选项都填上了
      // 二次确认进项交卷
      Modal.confirm({
        iconType: 'exclamation-circle',
        title: '提示',
        content: '交卷后将无法修改答案，确定交卷？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.submit();
        }
      });
    }

  }

  // 交卷
  submit = () => {
    // 交卷请求
    // 构造交卷参数
    let arr = [];
    const { results } = this.state;
    for (let i = 0; i < results.length; i++){
      arr.push({id: results[i].id, answer: results[i].answer})
    }

    console.log(arr);
    console.log(this.participant_id);

    axios.post('/api/my_exam/exam_task/exam_answers/', {problems:arr, participant_id:this.participant_id})
      .then((response) => {
        const res = response.data;
        if (res.status === 0) {
          this.setState({
            mode: 'submit_success'
          })
        } else {
          message.error('请求失败')
        }
      })
      .catch(function (error) {
        message.error('请求失败')
      });


  }

  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题
    const { mode, exam_task, results, timestamp_end, timestamp_now, loading, unFillArr } = this.state;
    const leftTime = timestamp_end - timestamp_now;
    const hours = this.checkTime(parseInt(leftTime / 1000 / 60 / 60 % 24, 10)); //计算剩余的小时
    const minutes = this.checkTime(parseInt(leftTime / 1000 / 60 % 60, 10));//计算剩余的分钟
    const seconds = this.checkTime(parseInt(leftTime / 1000 % 60, 10));//计算剩余的秒数
    const timeStyle = leftTime < 1000 * 60 * 10 ? { color: '#f5222d' } : null;


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
                  if (mode === 'started') {
                    // 1. 正在考试
                    return (
                      <div>
                        <div className="preview-block" style={{ textAlign: 'center' }}>
                          <h1 style={{ fontSize: '16px' }}>{exam_task.name}</h1>
                          <h2 style={{ margin: '20px 0' }}>共{exam_task.exampapaer_total_problem_num}题目<span style={{ margin: '0 10px' }}>试题总分: {exam_task.exampaper_total_grade}分</span>及格分: {exam_task.exampaper_passing_ratio}分</h2>
                          <p style={{ textAlign: 'left' }}>{exam_task.exampaper_description}</p>
                        </div>
                        {
                          results.map((item, index) => {
                            return (
                              <div className="preview-block" key={item.id} style={unFillArr.indexOf(index) > -1 ? {border:'1px solid red'} : null }>
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
                                    （{item.problem_grade}分）
                                </p>
                                  <div style={{ marginLeft: '18px' }}>
                                    {
                                      (() => {
                                        switch (item.problem_type) {
                                          case 'multiplechoiceresponse':
                                            return <Radio.Group style={{ display: 'block' }} value={item.answer} onChange={this.onChangeRadioAnswer.bind(this, index)}>
                                              {
                                                item.content.options.map((item, index) => {
                                                  return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={'' + index}>{item}</Radio>
                                                })
                                              }
                                            </Radio.Group>;

                                          case 'choiceresponse':
                                            return <Checkbox.Group defaultValue={null} value={item.answer} onChange={this.onChangeCheckboxAnswer.bind(this, index)}>
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
                                                onChange={this.onChangeInputAnswer.bind(this, index)}
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
                            <span className="exam-count-time" style={timeStyle}>{hours}</span>
                            <span className="exam-count-time" style={timeStyle}>{minutes}</span>
                            <span className="exam-count-time" style={timeStyle}>{seconds}</span>
                          </div>
                          <div>
                            <span className="exam-count-text">时</span>
                            <span className="exam-count-text">分</span>
                            <span className="exam-count-text">秒</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                          <Button type="primary" onClick={this.onClickSubmit}>交卷</Button>
                        </div>
                      </div>
                    )
                  } else if (mode === 'submit_success') {
                    // 2. 考试结束，提交成功
                    return (
                      <div className="exam-msg-block">
                        <p style={{ marginBottom: '35px' }}>
                          <Icon type="check-circle" style={{ color: '#52c41a', marginRight: '15px' }} />试卷提交成功！
                        </p>
                        <Button type="primary" style={{ marginRight: '10px' }} onClick={this.goToStudentManage}>其他考试任务</Button>
                        <Button type="primary" onClick={this.getExam}>查看成绩</Button>
                      </div>
                    )
                  } else if (mode === 'finished') {
                    // 3. 考试结束，显示答卷
                    return <PreviewStudent data={this.state.previewData} />
                  } else if (mode === 'error') {
                    // 4. 错误信息提示框
                    return (
                      <div className="exam-msg-block">
                        <i className="iconfont" style={{ fontSize: '120px', color:'#ccd1d9' }}>&#xe636;</i>
                        <p style={{ marginTop: '30px' }}>{ this.state.errorMsg }</p>
                      </div>
                    )
                  }
                })()
              }
            </div>
        }
      </div>
    )
  }
}



export default class Exam extends React.Component {
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
          <ExamContainer showBackToTop={this.state.showBackToTop} />
        </div>
        <Footer />
      </div>
    );
  }
}