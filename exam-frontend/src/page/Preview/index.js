import React, { Component } from 'react';
import { Icon, Radio, Checkbox, Input, Button } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import $ from "jquery";
class PreviewContainer extends Component{

  state = {
    title: '商务知识管理',
    count: 20,
    total_grade: 100,
    pass_grade: 60,
    description: '试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明',
    question: [
      {
        type: 'radio',
        title: '要坚持看电视来减肥开始的法律是开发商的垃圾分类是的借款发生了地方看电视了______上课了的分解落实到焚枯食淡',
        grade: 5,
        options: ['时空裂缝但是', '是否考虑的时刻', '上刊登了丰盛的', '放得开酸辣粉']
      },
      {
        type: 'multiple',
        title: '深刻的法律都是开放开始代理费吉林省',
        grade: 10,
        options: ['富士康的法律', '速度快发了啥地方都是', '考生的发了多少']
      },
      {
        type: 'fill',
        title: '都是咖啡连锁店分离式打卡_______斯柯达发牢骚',
        input: 2,
        grade: 12,
      },{
        type: 'radio',
        title: '要坚持看电视来减肥开始的法律是开发商的垃圾分类是的借款发生了地方看电视了______上课了的分解落实到焚枯食淡',
        grade: 5,
        options: ['时空裂缝但是', '是否考虑的时刻', '上刊登了丰盛的', '放得开酸辣粉']
      }
    ]
  }

  componentDidMount() {
    // 获取试卷id
    // 获取编辑的试卷信息及题目ids

    // 监听打印机事件
    const that = this;
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
    // $("html,body").animate({scrollTop:0},500)
  }

  render() {
    return (
      <div style={{width:'100%'}}>
        <div className="print-btn">
          <div style={{ textAlign: 'right'}}>
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
          <h1 style={{ fontSize: '16px'}}>{ this.state.title }</h1>
          <h2 style={{ margin: '20px 0'}}>共{ this.state.count }题目<span style={{ margin: '0 10px'}}>试题总分: {this.state.total_grade}分</span>及格分: {this.state.pass_grade}分</h2>
          <p>{this.state.description}</p>
        </div>
        {
          this.state.question.map((item, index) => {
            return (
              <div className="preview-block" key={index}>
                <div>
                  <p className="preview-title">
                    {index + 1}.
                    <span className="preview-type">
                      {
                        (() => {
                          switch (item.type) {
                            case 'radio':
                              return '[单选题]';
                            case 'multiple':
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
                    {item.title}
                    （{item.grade}分）
                  </p>
                  <div style={{ marginLeft: '18px'}}>
                    {
                      (() => {
                        switch (item.type) {
                          case 'radio':
                            return <Radio.Group style={{display:'block'}} defaultValue={null}>
                                {
                                  item.options.map((item, index) => {
                                    return <Radio style={{display:'block', height: '30px', lineHeight: '30px'}} key={index} value={index}>{item}</Radio>
                                  })
                                }
                              </Radio.Group>;

                          case 'multiple':
                            return <Checkbox.Group defaultValue={null}>
                              {
                                item.options.map((item, index) => {
                                  return <Checkbox style={{display:'block', height: '30px', lineHeight: '30px', marginLeft: '0'}} key={index} value={index}>{item}</Checkbox>
                                })
                              }
                            </Checkbox.Group>;

                          case 'fill':
                            return <div>
                              <span>请填写答案</span>
                              <Input.TextArea
                                placeholder="答案"
                                autosize={{ minRows: 1, maxRows: 6 }}
                                style={{ width: '400px', display:'inline-block', verticalAlign: 'middle', marginLeft: '15px'}}
                              />
                            </div>;

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
    showShadow: false,
  }

  componentDidMount(){
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

    $(window).scroll(() => {
      this.setState({
        showShadow: ($(window).height() !== $(document).height()) && $(document).scrollTop() > 0
      })
    })
  }

  render() {
    const containerHeight = { minHeight: this.state.height - 180 + 'px', minWidth: '649px'}
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <PreviewContainer showBackToTop={this.state.showShadow} />
        </div>
        <Footer />
      </div>
    );
  }
}
/*
ReactDOM.render(
  <LocaleProvider locale={locales.zh_CN}><App /></LocaleProvider>, document.getElementById('home')
)
*/