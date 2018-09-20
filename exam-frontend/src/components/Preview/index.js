import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message, Spin } from 'antd';
import axios from 'axios';
import $ from "jquery";


export default class PreviewContainer extends React.Component {

  //字段备注
  //isStatistics:true/false  是否从统计页面进入
  //isEdit:true/false  是否从编辑页面进入
  //answerShow:true/false  是否展示答案以及按钮

  state = {
    name: '',
    total_problem_num: null,
    total_grade: null,
    passing_grade: null,
    description: '',
    problems: [],
    loading: true,
    isStatistics: false,
    isEdit: true,
    answerShow: true,
    pass: true
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
    //统计页面
    if (id.split('/')[0] === "statistics") {

      //获取数据
      axios.get('/api/' + id + '/')
        .then((res) => {


          this.setState({
            isStatistics: true,
          })
        })
        .catch((error) => {

        })

    }
    //编辑时候
    if (id.split('/')[0] === "edit") {

      //获取数据
      axios.get('/api/' + id + '/')
        .then((res) => {


          this.setState({
            isStatistics: true,
          })
        })
        .catch((error) => {

        })

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

  answerShow = () => {

    this.setState({
      answerShow: true
    })
    console.log(this.state.answerShow)
  }

  answerNoShow = () => {
    this.setState({
      answerShow: false
    })
    console.log(this.state.answerShow)
  }

  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题
    const { name, passing_grade, problems, total_grade, total_problem_num, description, loading } = this.state;

    const border = {
      border: this.state.answerShow ? '1px solid #95cd5b' : '1px solid #E6E9ED'
    }

    const color = {
      color: this.state.pass ? '#95cd5b' : '#f5222d'
    }

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
                                <Button onClick={this.answerNoShow} style={{ marginRight: '10px' }}>隐藏答案</Button>
                                :
                                <Button onClick={this.answerShow} style={{ marginRight: '10px' }}>查看答案</Button>
                            }
                            <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
                          </div>
                        )
                      }
                      else if (this.state.isStatistics === true && this.state.isEdit === false) {
                        return null
                      }
                      else {
                        return (
                          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
                          </div>
                        )
                      }
                    }
                  )()
                }




                {
                  this.props.showBackToTop ?
                    <div className="back-to-top" onClick={this.backToTop}>
                      <Icon type="arrow-up" />
                    </div>
                    :
                    null
                }
              </div>

              <div className="base-message">
                <p className="student-name">考生： 王铭业</p>
                <p className="paper-message" style={color}>改考生及格了</p>
              </div>


              <div className="preview-block" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '16px' }}>{name}</h1>
                <h2 style={{ margin: '20px 0' }}>
                共{total_problem_num}题目
                <span style={{ margin: '0 10px' }}>试题总分: {total_grade}分</span>及格分: {passing_grade}分

                
                { 
                  this.state.isStatistics ?
                  <span style={{ margin: '0 10px' }}>您的得分：
                    <span style={color}>88</span>
                  </span>
                  :
                  <span style={{ margin: '0 10px' }}>您的得分：
                    <span style={color}>59</span>
                  </span>
                }
               
                
                </h2>
                <p style={{ textAlign: 'left' }}>{description}</p>       
              </div>
              {
                problems.map((item, index) => {
                  
                  if(this.state.isStatistics === true){  
                    const pass = {  
                      border: item.pass ? '1px solid #95cd5b':'1px solid #f5222d'
                    }

                    return (
                      <div className="preview-subject" key={index} style={pass}>
                        { 
                          item.pass ?
                          <div style={{position:'absolute',width:'40px',height:'40px',background:"#95cd5b",right:'0',top:'0',borderRadius:'0 4px 0 12px',textAlign:'center'}}>
                            <Icon type="check" theme="outlined" style={{lineHeight:'40px',color:'#fff',fontSize:'26px'}} />
                          </div>
                          :
                          <div style={{position:'absolute',width:'40px',height:'40px',background:"#f5222d",right:'0',top:'0',borderRadius:'0 4px 0 12px',textAlign:'center'}}>
                            <Icon type="close" theme="outlined" style={{lineHeight:'40px',color:'#fff',fontSize:'26px'}} />
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
                  }
                  else{ 
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
                  }




                  
                })
              }
            </div>
        }
      </div>
    )
  }
}

