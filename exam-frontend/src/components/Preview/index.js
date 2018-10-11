import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message, Spin, } from 'antd';
import axios from 'axios';
import $ from "jquery";

export default class PreviewContainer extends React.Component {

  //字段备注
  //isStatistics:true/false  是否从统计页面进入
  //isEdit:true/false  是否从编辑页面进入
  //answerShow:true/false  是否展示答案以及按钮
  //isRandom:true/false 是否是随机试题
  state = {
    name: '',
    total_problem_num: null,
    total_grade: null,
    passing_grade: null,
    description: '',
    problems: [],
    multiplechoiceresponse_count: 0,
    choiceresponse_count: 0,
    stringresponse_count: 0,
    passing_ratio: 60,
    userGrade: 0,
    result: 0,
    username: '',
    loading: true,
    isStatistics: false,
    isEdit: false,
    answerShow: false,
    pass: true,
    isStudent: false,
    isRandom: false,
  }

  componentDidMount() {
    // 监听打印机事件
    var beforePrint = function () {
    };

    var afterPrint = function () {
      that.setPrinting(false)
    };

    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function (mql) {
        if (mql.matches) {
          beforePrint();
        } else {
          afterPrint();
        }
      });
    }

    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;

    // 获取试卷id
    // 获取编辑的试卷信息及题目ids

    const id = window.location.href.split('/preview/')[1];

    const that = this;

    console.log(typeof id);
    if (id === 'storage') {
      const { description, name, passing_grade, problems, total_grade, total_problem_num } = JSON.parse(localStorage.getItem('paper'));
      this.setState({
        description,
        name,
        passing_grade,
        problems,
        total_grade,
        total_problem_num,
        loading: false,
      })
      return false;
    }
    // 1. 统计页面
    if (id.split('/')[0] === "statistics") {

      //获取数据
      axios.get('/api/my_exam/exam_task/exam_answers/' + id.split('/')[1] + '/')
        .then((res) => {
          let response = res.data.data;

          this.setState({
            isStatistics: true,
            name: response.exam_task.name,
            description: response.exam_task.exampaper_description,
            total_problem_num: response.exam_task.exampaper_total_problem_num,
            total_grade: response.exam_task.exampaper_total_grade,
            userGrade: response.total_grade,
            username: response.user_name,
            result: response.exam_result,
          })
        })
        .catch((error) => {
        })

      return false;
    }

    // 2. 编辑时候
    if (id.split('/')[0] === "edit") {

      //获取数据
      axios.get('/api/examtasks/' + id.split('/')[1] + '/preview/')
        .then((res) => {
          let response = res.data.data;
          console.log(response);

          if (response.exampaper_create_type === "fixed") {
            this.setState({
              name: response.name,
              passing_grade: (response.exampaper_passing_ratio * parseInt(response.exampaper_total_grade, 10)) * 0.01,
              problems: response.problems,
              total_grade: response.exampaper_total_grade,
              total_problem_num: response.exampaper_total_problem_num,
              description: response.exampaper_description,
              loading: false,
              isEdit: true,
              answerShow: true,
              isRandom: false
            })
          }
          else {


            let sectionID = [];
            // eslint-disable-next-line
            response.subject.map(item => {
              sectionID.push(item.id);
            })

            axios.post('/api/sections/problems/count/', {
              section_ids: sectionID
            })
              .then(res => {

                let response2 = [];
                // eslint-disable-next-line
                response.subject.map((item, index) => {

                  response2.push(Object.assign({}, item,
                    {
                      choiceresponse: res.data.data[index].choiceresponse,
                      multiplechoiceresponse: res.data.data[index].multiplechoiceresponse,
                      stringresponse: res.data.data[index].stringresponse
                    }))
                })


                this.setState({
                  name: response.name,
                  passing_grade: (response.exampaper_passing_ratio * parseInt(response.exampaper_total_grade, 10)) * 0.01,
                  problems: response2,
                  total_grade: response.exampaper_total_grade,
                  total_problem_num: response.exampaper_total_problem_num,
                  description: response.exampaper_description,
                  multiplechoiceresponse_count: response.problem_statistic.multiplechoiceresponse_count,
                  choiceresponse_count: response.problem_statistic.choiceresponse_count,
                  stringresponse_count: response.problem_statistic.stringresponse_count,
                  passing_ratio: response.exampaper_passing_ratio,
                  loading: false,
                  isRandom: true,
                })

              })
              .catch(error => {

              })



          }

        })
        .catch((error) => {
        })
      return false;
    }

    axios.get('/api/exampapers/' + id + '/')
      .then(function (response) {
        const res = response.data;
        const { name, passing_grade, problems, total_grade, total_problem_num, description, create_type } = res.data;
        if (res.status === 0) {
          if (create_type === 'random') {
            message.error('随机试卷不可预览')
            return false;
          }

          that.setState({
            name,
            passing_grade,
            problems,
            total_grade,
            total_problem_num,
            description,
            loading: false,
          })
        } else {
          message.error('请求失败');
        }

      })
      .catch(function (error) {
        message.error('请求失败')
      });
  }


  setPrinting = (printing) => {
    if (printing) {
      $('.header').hide();
      $('.footer').hide();
      $('.print-btn').hide();
      window.print();
    } else {
      $('.header').show();
      $('.footer').show();
      $('.print-btn').show();
    }

  }

  backToTop() {
    $("html,body").animate({ scrollTop: 0 }, 500)
  }


  //显示答案
  answerShow = (e) => {

    this.setState({
      answerShow: !e
    })

  }


  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题

    const { name, passing_grade, problems, total_grade, total_problem_num, description, loading } = this.state;

    const border = {
      border: this.state.answerShow ? '1px solid #95cd5b' : '1px solid #E6E9ED'
    }

    // const color = {
    //   color: this.state.pass ? '#95cd5b' : '#f5222d'
    // }

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
                  (
                    () => {
                      if (this.state.isStatistics === false && this.state.isEdit === true) {

                        return (
                          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            {
                              this.state.answerShow ?
                                <Button onClick={this.answerShow.bind(this, this.state.answerShow)} style={{ marginRight: '10px' }}>隐藏答案</Button>
                                :
                                <Button onClick={this.answerShow.bind(this, this.state.answerShow)} style={{ marginRight: '10px' }}>显示答案</Button>
                            }
                            <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
                          </div>
                        )
                      }

                      if (this.state.isStatistics === true && this.state.isEdit === false) {
                        return null
                      }

                      if (this.state.isStatistics === false && this.state.isEdit === false) {

                        if (this.state.isStudent) {
                          return null;
                        }
                        else if (this.state.isRandom) {
                          return null;
                        }
                        else {

                          return (
                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                              <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
                            </div>
                          )
                        }
                      }
                    }
                  )()
                }




                {
                  this.props.showBackToTop ?
                    <div className="back-to-top" onClick={this.backToTop}>
                      {/* <Icon type="arrow-up" /> */}
                      <i className="iconfont" style={{ fontSize: '18px' }}>&#xe630;</i>
                    </div>
                    :
                    null
                }
              </div>

              {
                this.state.isStatistics ?
                  <div className="base-message">
                    <p className="student-name">考生： {this.state.username}</p>
                    {
                      this.state.result === "pass" ?
                        <p className="paper-message" style={{ color: '#95cd5b' }}>该考生及格了</p>
                        :
                        <p className="paper-message" style={{ color: '#f5222d' }}>该考生未及格</p>
                    }

                  </div>
                  :
                  null
              }

              {
                this.state.isStudent ?
                  <div className="base-message">

                    {
                      this.state.pass ?
                        <p className="paper-message" style={{ color: '#95cd5b' }}>恭喜你，及格了</p>
                        :
                        <p className="paper-message" style={{ color: '#f5222d' }}>不及格，你还需要继续努力</p>
                    }

                  </div>
                  :
                  null
              }




              <div className="preview-block" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '16px' }}>{name}</h1>
                <h2 style={{ margin: '20px 0' }}>
                  共{total_problem_num}题目
                <span style={{ margin: '0 10px' }}>试题总分: {total_grade}分</span>及格分: {passing_grade}分
                {/* 统计页面 */}
                  {
                    (
                      () => {
                        if (this.state.isStatistics) {
                          if (this.state.result === "pass") {
                            return (
                              <span style={{ margin: '0 10px' }}>您的得分：
                                <span style={{ color: '#95cd5b' }}>{this.state.userGrade}</span>
                              </span>)
                          }
                          else {
                            return (
                              <span style={{ margin: '0 10px' }}>您的得分：
                                <span style={{ color: '#f5222d' }}>{this.state.userGrade}</span>
                              </span>
                            )
                          }
                        }
                        else {
                          return null;
                        }
                      }
                    )()
                  }

                  {/* 查看页面 */}

                  {
                    (
                      () => {
                        if (this.state.isStudent) {
                          if (this.state.pass) {
                            return (
                              <span style={{ margin: '0 10px' }}>您的得分：
                                <span style={{ color: '#95cd5b' }}>88</span>
                              </span>)
                          }
                          else {
                            return (
                              <span style={{ margin: '0 10px' }}>您的得分：
                                <span style={{ color: '#f5222d' }}>59</span>
                              </span>
                            )
                          }
                        }
                        else {
                          return null;
                        }
                      }
                    )()
                  }

                </h2>
                <p style={{ textAlign: 'left' }}>{description}</p>
              </div>

              {
                this.state.isRandom ?
                  <div>
                    <p style={{ marginTop: '18px', marginBottom: '10px' }}>抽题规则</p>

                    <div>
                      {
                        this.state.problems.map((item, index) => {
                          return (
                            <div className="random-exam" style={{ marginBottom: '10px' }} key={item.id}>
                              <div className="courseName">
                                <span className="examtype-name">{item.name}</span>
                              </div>
                              <ul className="question-type">
                                <li className="type">单选题</li>
                                <li className="question-addnumber">共<a>{item.multiplechoiceresponse}</a>题</li>
                                <li className="question-number">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>抽题数目<a>{item.multiplechoiceresponseNumber}</a></span>


                                  </div>
                                </li>
                                <li className="question-score">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>单题分数<a>{item.multiplechoiceresponseGrade}</a></span>
                                  </div>
                                </li>
                              </ul>
                              <ul className="question-type">
                                <li className="type">多选题</li>
                                <li className="question-addnumber">共<a>{item.choiceresponse}</a>题</li>
                                <li className="question-number">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>抽题数目<a>{item.choiceresponseNumber}</a></span>



                                  </div>
                                </li>
                                <li className="question-score">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>单题分数<a>{item.choiceresponseGrade}</a></span>
                                  </div>
                                </li>
                              </ul>
                              <ul className="question-type">
                                <li className="type">填空题</li>
                                <li className="question-addnumber">共<a>{item.stringresponse}</a>题</li>
                                <li className="question-number">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>抽题数目<a>{item.stringresponseNumber}</a></span>


                                  </div>
                                </li>
                                <li className="question-score">
                                  <div>
                                    <span style={{ marginRight: '30px' }}>单题分数<a>{item.stringresponseGrade}</a></span>

                                  </div>
                                </li>
                              </ul>
                            </div>)
                        })
                      }
                    </div>
                    {/* 题型统计 */}
                    <div>
                      <div className="total">
                        <div className="total-block total-top">
                          <span className="first-span">题型</span>
                          <span>单选题</span>
                          <span>多选题</span>
                          <span>填空题</span>
                        </div>
                        <div className="total-block">
                          <span className="first-span">已选数量</span>
                          <span className="number">{this.state.multiplechoiceresponse_count}</span>
                          <span className="number">{this.state.choiceresponse_count}</span>
                          <span className="number">{this.state.stringresponse_count}</span>
                        </div>
                        <div className="pass-per">
                          <div>
                            <span>总题数：<a style={{ cursor: 'not-allowed' }}>{this.state.total_problem_num}</a></span>
                            <span>总分：<a style={{ cursor: 'not-allowed' }}>{this.state.total_grade}</a></span>
                            <span>
                              <span style={{ marginRight: '6px' }}>及格线*</span>
                              {this.state.passing_ratio}
                              <span style={{ marginLeft: '6px' }}>%</span>

                            </span>
                            {/* <span>（及格分{(this.props.sum * this.state.paperpass * 0.01).toFixed('2')}=总分{this.props.sum}分*及格线{this.state.paperpass}%）</span> */}
                            <span>(及格分{this.state.passing_grade}=总分{this.state.total_grade}分*及格线{this.state.passing_ratio}%)</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  :
                  <div>
                    {
                      // eslint-disable-next-line
                      problems.map((item, index) => {
                        //统计页面
                        if (this.state.isStatistics === true && this.state.isEdit === false && this.state.isStudent === false) {

                          const pass = {
                            border: item.pass ? '1px solid #95cd5b' : '1px solid #f5222d'
                          }

                          return (
                            <div className="preview-subject" key={index} style={pass}>
                              {
                                item.pass ?
                                  <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#95cd5b", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                                    <Icon type="check" theme="outlined" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                                  </div>
                                  :
                                  <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#f5222d", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                                    <Icon type="close" theme="outlined" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                                  </div>
                              }

                              <div style={{ padding: '20px 25px' }}>
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
                                          return <Radio.Group style={{ display: 'block' }} value={item.content.answers[0]}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                              })
                                            }
                                          </Radio.Group>;

                                        case 'choiceresponse':
                                          return <Checkbox.Group value={item.content.answers}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Checkbox style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Checkbox>
                                              })
                                            }
                                          </Checkbox.Group>;

                                        case 'stringresponse':
                                          return <div>
                                            {
                                              /*
                                              item.input.map((answer, index) => {
                                                return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                                                  <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                                  <Input.TextArea
                                                    autosize={{ minRows: 1, maxRows: 6 }}
                                                    style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                                                  />
                                                </div>
                                              })
                                              */
                                            }
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
                        }
                        //编辑查看页面
                        if (this.state.isStatistics === false && this.state.isEdit === true && this.state.isStudent === false) {
                          return (
                            <div className="preview-subject" key={index} style={border}>
                              <div style={{ padding: '20px 25px' }}>
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
                                          return <Radio.Group style={{ display: 'block' }} value={this.state.answerShow ? item.content.answers[0] : null}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                              })
                                            }
                                          </Radio.Group>;

                                        case 'choiceresponse':
                                          return <Checkbox.Group value={this.state.answerShow ? item.content.answers : null}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Checkbox style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Checkbox>
                                              })
                                            }
                                          </Checkbox.Group>;

                                        case 'stringresponse':
                                          return <div>
                                            {
                                              /*
                                              item.input.map((answer, index) => {
                                                return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                                                  <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                                  <Input.TextArea
                                                    autosize={{ minRows: 1, maxRows: 6 }}
                                                    style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                                                  />
                                                </div>
                                              })
                                              */
                                            }
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

                              {
                                this.state.answerShow ?
                                  <div className="answerShow">
                                    <p>正确答案：
                                    {
                                        item.content.answers.map(item => {
                                          return (<span style={{ marginRight: '4px' }}>{String.fromCharCode(65 + parseInt(item, 10))}</span>)
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
                        }
                        //嘉琪的查看成绩页面
                        if (this.state.isStatistics === false && this.state.isEdit === false && this.state.isStudent === true) {

                          const pass = {
                            border: item.pass ? '1px solid #95cd5b' : '1px solid #f5222d'
                          }

                          return (
                            <div className="preview-subject" key={index} style={pass}>
                              {
                                item.pass ?
                                  <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#95cd5b", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                                    <Icon type="check" theme="outlined" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                                  </div>
                                  :
                                  <div style={{ position: 'absolute', width: '40px', height: '40px', background: "#f5222d", right: '0', top: '0', borderRadius: '0 4px 0 12px', textAlign: 'center' }}>
                                    <Icon type="close" theme="outlined" style={{ lineHeight: '40px', color: '#fff', fontSize: '26px' }} />
                                  </div>
                              }
                              <div style={{ padding: '20px 25px' }}>
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
                                          return <Radio.Group style={{ display: 'block' }} value={item.content.answers[0]}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                              })
                                            }
                                          </Radio.Group>;

                                        case 'choiceresponse':
                                          return <Checkbox.Group value={item.content.answers}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Checkbox style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Checkbox>
                                              })
                                            }
                                          </Checkbox.Group>;

                                        case 'stringresponse':
                                          return <div>
                                            {
                                              /*
                                              item.input.map((answer, index) => {
                                                return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                                                  <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                                  <Input.TextArea
                                                    autosize={{ minRows: 1, maxRows: 6 }}
                                                    style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                                                  />
                                                </div>
                                              })
                                              */
                                            }
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

                              {
                                this.state.answerShow ?
                                  <div className="answerShow">
                                    <p>正确答案：
                                    {
                                        item.content.answers.map(item => {
                                          return (<span style={{ marginRight: '4px' }}>{String.fromCharCode(65 + parseInt(item, 10))}</span>)
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
                        }

                        if (this.state.isStatistics === false && this.state.isEdit === false && this.state.isStudent === false) {
                          return (
                            <div className="preview-subject" key={index} style={border}>
                              <div style={{ padding: '20px 25px' }}>
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
                                          return <Radio.Group style={{ display: 'block' }} value={this.state.answerShow ? item.content.answers[0] : null}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Radio style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Radio>
                                              })
                                            }
                                          </Radio.Group>;

                                        case 'choiceresponse':
                                          return <Checkbox.Group value={this.state.answerShow ? item.content.answers : null}>
                                            {
                                              item.content.options.map((item, index) => {
                                                return <Checkbox style={{ display: 'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }} key={index} value={index}>{item}</Checkbox>
                                              })
                                            }
                                          </Checkbox.Group>;

                                        case 'stringresponse':
                                          return <div>
                                            {
                                              /*
                                              item.input.map((answer, index) => {
                                                return <div style={(index !== item.input.length - 1) ? { marginBottom: '20px'} : {} }>
                                                  <span style={{ position: 'relative', top: '4px' }}>请填写答案</span>
                                                  <Input.TextArea
                                                    autosize={{ minRows: 1, maxRows: 6 }}
                                                    style={{ width: '400px', display:'inline-block', marginLeft: '15px', verticalAlign: 'text-top'}}
                                                  />
                                                </div>
                                              })
                                              */
                                            }
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

                              {
                                this.state.answerShow ?
                                  <div className="answerShow">
                                    <p>正确答案：
                                    {
                                        item.content.answers.map(item => {
                                          return (<span style={{ marginRight: '4px' }}>{String.fromCharCode(65 + parseInt(item, 10))}</span>)
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
                        }


                      })
                    }
                  </div>
              }


            </div>
        }
      </div>
    )
  }
}

