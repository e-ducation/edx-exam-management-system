import React from 'react';
import { Icon, Radio, Checkbox, Input, Button, message } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import axios from 'axios';
import './index.scss';
import $ from "jquery";


class PreviewContainer extends React.Component{
  state = {
    name: '',
    total_problem_num: null,
    total_grade: null,
    passing_grade: null,
    description: '',
    problems: [],
    loading: true,
  }

  componentDidMount() {
    // 监听打印机事件
    var beforePrint = function() {
    };

    var afterPrint = function() {
      that.setPrinting(false)
    };

    if (window.matchMedia) {
      var mediaQueryList = window.matchMedia('print');
      mediaQueryList.addListener(function(mql) {
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
    if (id === 'storage'){
      const { description, name, passing_grade, problems, total_grade, total_problem_num} = JSON.parse(localStorage.getItem('paper'));

      this.setState({
        description,
        name,
        passing_grade,
        problems,
        total_grade,
        total_problem_num
      })
      return false;
    }


    axios.get('/api/exampapers/' + id)
      .then(function (response) {
        const res = response.data;
        const {name, passing_grade, problems, total_grade, total_problem_num, description } = res.data;
        if (res.status === 0){
          that.setState({
            name,
            passing_grade,
            problems,
            total_grade,
            total_problem_num,
            description,
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
    $("html,body").animate({scrollTop:0},500)
  }

  render() {
    // multiplechoiceresponse 单选题
    // choiceresponse         多选题
    // stringresponse         填空题
    const {name, passing_grade, problems, total_grade, total_problem_num, description } = this.state;

    return (
      <div style={{width:'100%', wordBreak:'break-word'}}>
        <div className="print-btn">
          <div style={{ textAlign: 'right', marginBottom: '20px'}}>
            <Button onClick={this.setPrinting.bind(this, true)}>打印试卷</Button>
          </div>
          {
            this.props.showBackToTop ?
              <div className="back-to-top" onClick={this.backToTop}>
                <Icon type="arrow-up" />
              </div>
            :
              null
          }
        </div>
        <div className="preview-block" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '16px'}}>{ name }</h1>
          <h2 style={{ margin: '20px 0'}}>共{ total_problem_num }题目<span style={{ margin: '0 10px'}}>试题总分: {total_grade}分</span>及格分: {passing_grade}分</h2>
          <p>{description}</p>
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
                  <div style={{ marginLeft: '18px'}}>
                    {
                      (() => {
                        switch (item.problem_type) {
                          case 'multiplechoiceresponse':
                            return <Radio.Group style={{display:'block'}} defaultValue={null}>
                                {
                                  item.content.options.map((item, index) => {
                                    return <Radio style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Radio>
                                  })
                                }
                              </Radio.Group>;

                          case 'choiceresponse':
                            return <Checkbox.Group defaultValue={null}>
                              {
                                item.content.options.map((item, index) => {
                                  return <Checkbox style={{display:'block', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 10px 0'}} key={index} value={index}>{item}</Checkbox>
                                })
                              }
                            </Checkbox.Group>;

                          case 'fill':
                            return <div>
                              {
                                item.input.map((answer, index) => {
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
      </div>
    )
  }
}



export default class Preview extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  }

  componentDidMount(){
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px', minWidth: '649px'}
    return (
      <div>
        <Header />
        <div className="container" style={containerHeight}>
          <PreviewContainer showBackToTop={this.state.showShadow} />
        </div>
        <Footer />
      </div>
    );
  }
}