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
    loading: false,
    /* unFillArr 保存的是 index + 1 */
    unFillArr: [],
    previewData: {},
  }

  componentDidMount() {
    // 获取试卷participant_id
    const id = window.location.href.split('/exam/')[1];


    /* 1. 考试中，请求成功
    const res = {
      "status": 0,
      "message": "",
      "data":{
        "participant_id": 1,
        "task_state": "", //考试状态
        "current_time": "2018-09-27 14:19:50",//当前时间
        "exam_task": {
            "id": 3,//考试任务ID
            "name": "运营管理第三次考试", //考试任务名称
            "exampaper_description": "运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3",//考试说明
            "creator": "edx",//发布人
            "period_start": "2018-09-26 18:00:00",//考试开始时间
            "period_end": "2018-09-27 14:20:00",//考试结束时间
            "exam_time_limit": 60,//考试时长
            "exampaper_passing_ratio": 60,//及格线
            "exampaper_total_problem_num": 6,//总问题数
            "exampaper_total_grade": "6.00"//试卷总分
        },
        "results": [
          {
            "id": 1,
            "answer": '', //用户答案 多选[0,1,2,3,4]
            "grade": "0.00", //用户得分
            "problem_grade": "1.00", //题目分数
            "sequence": "3", //序号
            "problem_type": "multiplechoiceresponse", //题目类型
            "content": {
              'title': '要坚持无进去、全服的方式打开了就分手了的看法吉林省乐山大佛记录卡士大夫娄底市解放路看到了里是否看电视剧',
              'descriptions': {},
              'options': ['1.22', '1.66', '2.34', '3.33', '4.44']
            },
          },
          {
            "id": 2,
            "answer": [0], //用户答案 多选[0,1,2,3,4]
            "grade": "0.00", //用户得分
            "problem_grade": "1.00", //题目分数
            "sequence": "3", //序号
            "problem_type": "choiceresponse", //题目类型
            "content": {
              'title': '要坚持无进去、全服的方式打开了就分手了的看法吉林省乐山大佛记录卡士大夫娄底市解放路看到了里是否看电视剧',
              'descriptions': {},
              'options': ['1.22', '1.66', '2.34', '3.33', '4.44']
            },
          },
          {
            "id": 3,
            "answer":"the correct answer",
            "problem_id":"yingli+ceshi005+2020+type@problem+block@7655160fbf8d43d09cfe447be3c08e13",
            "problem_grade":"1.00",
            "sequence":"0",
            "problem_type":"stringresponse",
            "content":{
              "descriptions":"You can add an optional tip or note related to the prompt like this. ",
              "title":"Add the question text, or prompt, here. This text is ."
            }
          }
        ]
      }
    }
    */
   axios.get('/api/my_exam/exam_task/exam_answers?participant_id=' + id)
    .then((response) => {
      const res = response.data;
      if (res.status === 0) {
        if (res.data.task_state === 'started'){

          // 1. 正在考试中
          const { participant_id, task_state, current_time, exam_task, results } = res.data;
          this.setState({
            mode: task_state,
            exam_task,
            results,
            timestamp_end: Date.parse(new Date(exam_task.period_end)),
            timestamp_now: Date.parse(new Date(current_time)),
            loading: false,
          }, () => {
            // 设置倒计时
            this.timer = setInterval(() => {
              const { timestamp_end, timestamp_now } = this.state;
              if (timestamp_now - timestamp_end > -1) {
                // 自动交卷，清除倒计时
                clearInterval(this.timer);
                this.setState({
                  mode: 'submit_success'
                })
                return false;
              }
              this.setState({
                timestamp_now: timestamp_now + 1000,
              });

              // 倒计时少于0秒，自动交卷
            }, 1000)
          });
          this.participant_id = participant_id;
        } else if (res.data.task_state === 'finised') {

          // 2. 结束考试
          this.setState({
            mode: res.data.task_state,
            previewData:res.data,
          })
        }

      } else {
        message.error('请求失败');
      }
    })
    .catch((error) => {
      message.error('请求失败')
    });




    // 考试结束，查看试卷
    const res = {
      "status": 0,
      "message": "",
      "data":{
        "participant_id": 1,
        "task_state": "finished",
        "current_time": "2018-09-26 11:17:25",
        "total_grade": 70, // 学生分数
        "participant_name": "小明",// 考生
        "exam_task": {
            "id": 3,//考试任务ID
            "name": "运营管理第三次考试", //考试任务名称
            "exampaper_description": "运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3运营管理3",//考试说明
            "creator": "edx",//发布人
            "period_start": "2018-09-26 18:00:00",//考试开始时间
            "period_end": "2018-10-10 18:00:00",//考试结束时间
            "exam_time_limit": 60,//考试时长
            "exampaper_passing_ratio": 60,//及格线
            "exampaper_total_problem_num": 6,//总问题数
            "exampaper_total_grade": "6.00",//试卷总分
            "show_answer": true,
        },
        "results": [
          {
            "id": 1,
            "answer": '', //用户答案 多选[0,1,2,3,4]
            "grade": "0.00", //用户得分
            "problem_grade": "1.00", //题目分数
            "sequence": "3", //序号
            "problem_type": "multiplechoiceresponse", //题目类型
            "content": {
              'title': '要坚持无进去、全服的方式打开了就分手了的看法吉林省乐山大佛记录卡士大夫娄底市解放路看到了里是否看电视剧',
              'descriptions': {},
              'options': ['1.22', '1.66', '2.34', '3.33', '4.44'],
              'solution':'solution',
              'answers': [3],
            },
          },
          {
            "id": 2,
            "answer": [0], //用户答案 多选[0,1,2,3,4]
            "grade": "1.00", //用户得分
            "problem_grade": "1.00", //题目分数
            "sequence": "3", //序号
            "problem_type": "choiceresponse", //题目类型
            "content": {
              'title': '要坚持无进去、全服的方式打开了就分手了的看法吉林省乐山大佛记录卡士大夫娄底市解放路看到了里是否看电视剧',
              'descriptions': {},
              'options': ['1.22', '1.66', '2.34', '3.33', '4.44'],
              'solution':'solution',
              'answers': [3],
            },
          },
          {
            "id": 3,
            "answer":"the correct answer",
            "problem_id":"yingli+ceshi005+2020+type@problem+block@7655160fbf8d43d09cfe447be3c08e13",
            "grade": '0.00',
            "problem_grade":"1.00",
            "sequence":"0",
            "problem_type":"stringresponse",
            "content":{
              "descriptions":"You can add an optional tip or note related to the prompt like this. ",
              "title":"Add the question text, or prompt, here. This text is .",
              "answers": ['正确答案1', '正确答案2']
            }
          }
        ],

      }
    }





  }

  componentWillUnmount(){
    clearInterval(this.timer)
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
    console.log('ajax submit');
    this.setState({
      mode: 'submit_success'
    })
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
                                                  return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
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
                        <Button type="primary">查看成绩</Button>
                      </div>
                    )
                  } else if (mode === 'finished') {
                    // 3. 考试结束，显示答卷
                    return <PreviewStudent data={this.state.previewData} />
                  } else if (mode === 'error') {
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