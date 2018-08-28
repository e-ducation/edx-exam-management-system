import React from 'react';
import { Input,Button,Breadcrumb,Icon,InputNumber,Modal} from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import './index.scss';
import $ from "jquery";
import axios from 'axios';

import SelectQuestion from '../SelectQuestion'

import MoveTable from './moveTable'



// const RadioGroup = Radio.Group;
const { TextArea } = Input;



class EditContainer extends React.Component {
  state={
    paperName:"",
    paperIns:"",
    paper:[],
    paperpass:60,
    paperInsLength:0,
    saveVisible:false,
    selectQuestionList: [],
    paperType: '',
    selectSectionList: []
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
      paperIns:e.target.value,
      paperInsLength:e.target.value.length
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

  //保存固定试题
  saveFixExam=()=>{

    let {paperName,paperIns} = this.state

    if(paperName===""){
      this.warning();
    }
    else{

      //设置按钮不可点击
      this.setState({
        saveVisible:true
      })

      axios.post('/api/exampapers/fixed/',{
        problems: [
          {
            grade: 5,
            problem_id: "hello+hello+20180101+type@problem+block@915e0a76b7aa457f8cf616284bbfba32",
            sequence: 5
          }
        ],
        name: paperName,
        description:paperIns
      })
      .then(res=>{
        console.log(res);

        //按钮可点击
        this.setState({
          saveVisible:true
        })

        //跳转页面

      })
      .catch(error=>{
         //按钮可点击
         this.setState({
          saveVisible:true
        })
        //提示错误
      })
    }
  }

  //承海部分
  setQuestionList = (selectQuestionList) => {
    this.setState({
        selectQuestionList,
    })
  }
  setSectionList = (selectSectionList) => {
    this.setState({
        selectSectionList,
    })
  }

  warning=()=>{
    Modal.warning({
      title: '提示',
      content: '试卷名称不能为空！',
    });
  }

  isShow = (isShow) => {

    this.props.isShow(isShow)

  }

  render() {
    const inputStyle={
      width:'468px'
    }

    const Length = (
      <span style={{position:'absolute',right:'8px',bottom:'8px',fontSize:'12px',color:'#ccc'}}>{this.state.paperInsLength}/500</span>
    )

    return (
      <div style={this.props.style} className="displayFlx">
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
              <div>试卷名称*</div>
              <div>
                <Input placeholder="请输入1-50个字符的名称"
                onChange={this.onChangePaperName}
                value={this.state.paperName}
                style={inputStyle}
                maxLength="50"
                />
              </div>
            </div>
            <div className="label-box">
              <div style={{lineHeight:'14px'}}>试卷说明</div>
              <div>
                <div style={{position:"relative",width:'468px'}}>
                  <TextArea placeholder="请输入试卷说明"
                  autosize={{ minRows: 3, maxRows: 6 }}
                  onChange={this.onChangePaperIns}
                  style={{ width:'468px',paddingBottom:'20px'}}
                  maxLength="500"/>
                  { Length }
                </div>
              </div>
            </div>
            <div className="label-box">
              <div style={{lineHeight:'32px'}}>试题列表</div>
              <div>

                <MoveTable setShow={this.props.setShow}/>

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
                        <span>
                          <span style={{marginRight:'6px'}}>及格线*</span>
                          <InputNumber min={0} max={10} step={1} onChange={this.onChange} />
                          <span style={{marginLeft:'6px'}}>%</span>

                        </span>
                        <span>（及格分60=总分100分*及格线60%）</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="editbtn">
                  <Button>预览试卷</Button>
                  <Button type="primary" disabled={this.state.saveVisible} onClick={this.saveFixExam}>保存</Button>
                </div>


              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}


export default class Edit extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    showShadow: false,
    isShow:false,
  }

  setShow=(isShow)=>{
    console.log(123);
    this.setState({
      isShow,
    })

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
    const containerHeight = { minHeight: this.state.height - 186 + 'px'}
    const {isShow} = this.state;

    const display = {
      display:isShow ? 'none':'flex'
    }

    const selectdispaly = {
      display:isShow ? 'block':'none',
      width:'100%',
    }
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>

          <EditContainer style={display} setShow={this.setShow} isShow={isShow}/>

          <SelectQuestion
            selectQuestionList={this.state.selectQuestionList}
            setShow={this.setShow}
            setFixedList={this.setFixedList}
            paperType="fixed" // random || fixed
            style={selectdispaly}
          />

        </div>
        <Footer />
      </div>
    );
  }
}