import React from 'react';
import { Input,Button,Table,Breadcrumb,Tooltip,Icon} from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import './index.scss';
import $ from "jquery";


const { TextArea } = Input;


class RandomExamContainer extends React.Component {
  state={
    paperName:"这是试卷名称",
    paperIns:"这是试卷说明",
    paper:[],
    paperpass:60
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  //修改试卷名称
  onChangePaperName=(e)=>{
    this.setState({
      paperName:e.target.value
    })

  }
  //修改试卷说明
  onChangePaperIns=(e)=>{
    this.setState({
      paperIns:e.target.value
    })
  }
  //修改及格线数值
  onChangePass=(e)=>{
    this.setState({
      paperpass:e.target.value || 1
    })
  }
  //keyup事件
  inputNumberPass=(e)=>{
    let value = e.target.value;
    value=value.replace("^(\\d|[1-9]\\d|100)$");
    value =  value >= 100 ? 100 : value;
    this.setState({
      paperpass:value
    })
  }
  //增加及格线数值
  paperpassAdd=(value)=>{
    value>=100 ? value=100 :
    this.setState({
      paperpass:value+=1
    })
  }
  //减少及格线数值
  paperpassReduce=(value)=>{
    if(this.state.paperpass<=1){
      this.setState({
        paperpass:1
      })
    }
    else{
      this.setState({
        paperpass:value-=1
      })
    }
  }



  render() {
    const inputStyle={
      width:'468px'
    }

    return (
      <div className="displayFlx">
        <Sidebar/>
        <div className="text-right-left">

          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="folder-open" style={{marginRight: '5px'}} />
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="folder-open" style={{marginRight: '5px'}} />
              <span>试卷管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="edit" style={{marginRight: '5px'}} />
              <span>编辑试卷</span>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="edit-paper">编辑试卷</div>

          <div className="edit-box">
            <div className="label-box">
              <div>试卷说明</div>
              <div>
                <Input placeholder="请输入1-50个字符的名称"
                onChange={this.onChangePaperName}
                value={this.state.paperName}
                style={inputStyle}/>
              </div>
            </div>
            <div className="label-box">
              <div style={{lineHeight:'14px'}}>试卷名称*</div>
              <div>
                <TextArea placeholder="请输入试卷说明"
                autosize={{ minRows: 4, maxRows: 6 }}
                onChange={this.onChangePaperIns}
                style={inputStyle}/>
              </div>
            </div>
            <div className="label-box">
              <div style={{lineHeight:'32px'}}>试题列表</div>
              <div>



                <div class="random-exam">
                  <div className="courseName">
                    <span class="examtype-name">母婴产品进阶课程</span>
                    <Tooltip title="删除" className="delete-right">
                      <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} />
                    </Tooltip>
                  </div>
                  <ul className="question-type">
                    <li className="type">选择题</li>
                    <li className="question-addnumber">2</li>
                    <li className="question-number">3</li>
                    <li className="question-score">4</li>
                  </ul>
                </div>











                <div>
                  <div className="total">
                    <div className="total-block total-top">
                        <span className="first-span">题型</span>
                        <span>单选题</span>
                        <span>多选题</span>
                        <span>判断题</span>
                        <span>填空题</span>
                    </div>
                    <div className="total-block">
                        <span className="first-span">已选数量</span>
                        <span className="number">25</span>
                        <span className="number">30</span>
                        <span className="number">40</span>
                        <span className="number">44</span>
                    </div>
                    <div className="pass-per">
                      <div>
                        <span>总题型：{this.state.paper.length}</span>
                        <span>总分：{this.state.paper.length}</span>
                        <span>及格线*：
                          <span style={{float: 'right'}}>%</span>
                          <div className="inputBox">
                            <div className="inputLeft">

                              <Input value={this.state.paperpass} type="text" onKeyUp={this.inputNumberPass} onChange={this.onChangePass}/>
                            </div>
                            <div className="inputRight">
                              <div onClick={this.paperpassAdd.bind(this,this.state.paperpass)}><Icon type="up" /></div>
                              <div onClick={this.paperpassReduce.bind(this,this.state.paperpass)}><Icon type="down" /></div>
                            </div>
                          </div>
                        </span>

                        <span>（及格分60=总分100分*及格线60%）</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="editbtn">
                  <Button>预览试卷</Button>
                  <Button type="primary">保存</Button>
                </div>


              </div>








            </div>
          </div>

        </div>
      </div>
    );
  }



}


export default class RandomExam extends React.Component {
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

    $(document).scroll(() => {
      this.setState({
        showShadow: ($(window).height() !== $(document).height()) && $(document).scrollTop() > 0
      })
    })
  }

  render() {
    const containerHeight = { minHeight: this.state.height - 180 + 'px'}
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <RandomExamContainer />
        </div>
        <Footer />
      </div>
    );
  }
}