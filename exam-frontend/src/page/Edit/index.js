import React from 'react';
import { connect } from 'react-redux'
import { Input,Button,Breadcrumb,Icon,InputNumber,Modal,message} from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import RandomExam from '../RandomExam';
import './index.scss';
import $ from "jquery";
import axios from 'axios';
import SelectQuestion from '../SelectQuestion'
import MoveTable from './moveTable'
import { setFixedTable } from '../../model/action'

const { TextArea } = Input;
const confirm = Modal.confirm;


class EditContainerReducer extends React.Component {
  state={
    paperName:"",
    paperInsLength:0,
    paperIns:"",
    paper:[],
    paperpass:60,
    saveVisible:false,
    selectQuestionList: [],
    paperType: '',
    selectSectionList: []
  }

  componentWillMount(){
    this.props.setFixedTable({})
  }
  componentDidMount() {
    this.getExamPaper();

    console.log(window.location.pathname);
  }

  //整数
  formatterInteger=(value, max, min)=> {
    value = value.toString().replace(/\$\s?|([^\d]*)/g, '');
    if (parseInt(value) > max || parseInt(value) < min) {
      value = value.substring(0, value.length-1);
    }
    return value;
  }

  //修改试卷名称
  onChangePaperName=(e)=>{
    this.setState({
      paperName:e.target.value.replace(/(^\s*)|(\s*$)/g, "")
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
    if(e==""){
      e=1
    }
    this.setState({
      paperpass:this.formatterInteger(e,100,1)
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
  //保存固定试题
  saveFixExam=()=>{

    let {paperName,paperIns} = this.state;

    let fixPaper = this.props.fixHasNumArr;

    //是否有分值
    fixPaper.map(item=>{
      if(item.grade === undefined){
        this.warningGrade();
        return false;
      }
    })
    //试卷名称是否填写
    if(paperName===""){
      this.warning();
    }
    else{
      //设置按钮不可点击
      this.setState({
        saveVisible:true
      })

      if(this.props.id===undefined){
        axios.post('/api/exampapers/fixed/',{
          passing_ratio:this.state.paperpass,
          problems:fixPaper,
          name:paperName,
          description:paperIns
        })
        .then(res=>{
          //按钮可点击
          this.setState({
            saveVisible:true
          })
          //跳转页面
          window.location.href="/#/manage";
        })
        .catch(error=>{
           //按钮可点击
           this.setState({
            saveVisible:true
          })
          //提示错误
          message.warning('服务器忙，请重试');
        })
      }
      else{
        axios.put('/api/exampapers/fixed/'+this.props.id+'/',{
          passing_ratio:this.state.paperpass,
          problems:fixPaper,
          name:paperName,
          description:paperIns
        })
        .then(res=>{
          //按钮可点击
          this.setState({
            saveVisible:true
          })
          //跳转页面

          window.location.href="/#/manage";

        })
        .catch(error=>{
          //按钮可点击
          this.setState({
            saveVisible:true
          })
          //提示错误
          message.warning('This is message of warning');
       })
      }

    }
  }

  warning=()=>{
    Modal.warning({
      title: '提示',
      content: '试卷名称不能为空！',
    });
  }

  warningGrade=()=>{
    Modal.warning({
      title: '提示',
      content: '分值不能为空！',
    });
  }

  isShow = (isShow) => {

    this.props.isShow(isShow)

  }

  //编辑试卷，获取信息

  getExamPaper=()=>{


    let id = this.props.id


    if(id===undefined){

    }
    else{

      axios.get('/api/exampapers/fixed/'+id+'/')
      .then(res=>{
        let data = res.data.data

        const fetchData = {}

        data.problems.map((item,index) => {
          const { problem_id, problem_type , content } = item;
          fetchData[problem_id] = {
            grade: 1,
            title: item.content.title,
            problem_type: problem_type,
            problem_id: problem_id,
            content,
          }
        })

        this.props.setFixedTable(fetchData);
        // 初始化结构
        this.setState({
          paperName:data.name,
          paperIns:data.description,
          paperpass:data.passing_ratio
        })

      })
      .catch(error=>{
        message.error('请求失败')
      })
    }

  }

  //预览试卷
  seeExamPaper=()=>{

    var data={
      passing_grade:(this.state.paperpass*this.props.sum)*0.01,
      name:this.state.paperName,
      description:this.state.paperIns,
      problems:this.props.fixHasNumArr,
      total_grade:this.props.sum,
      total_problem_num:this.props.fixHasNumArr.length
    }

    localStorage.clear();

    localStorage.setItem("paper",JSON.stringify(data))

    window.open("/#/preview/storage")
  }

  confirmData=(type)=>{
    confirm({
      title: '提示',
      content: '您的数据还未保存，确定离开此页面',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk:()=>{

        this.setState({
          paperName:"",
          paperIns:"",
        })
        for(var key in this.props.fixedTable){
          delete this.props.fixedTable[key];
        }
        if(type==="首页"){
          window.location.href="/#/";
        }
        else{
          window.location.href="/#/manage";
        }

      },
      onCancel:()=>{

      },
    });
  }
  //点击返回
  checkData=(type)=>{
    console.log(this.props.fixedTable);
    if(type==="首页"){
      if(this.state.paperName==""&&this.state.paperIns==""&&JSON.stringify(this.props.fixedTable) == "{}"){
        window.location.href="/#/";
      }
      else{
        this.confirmData("首页");
      }
    }

    else{
      if(this.state.paperName==""&&this.state.paperIns==""&&JSON.stringify(this.props.fixedTable) == "{}"){
        window.location.href="/#/manage";
      }
      else{
        this.confirmData("试卷管理");
      }
    }

  }

  render() {


    const inputStyle={
      width:'468px'
    }

    const Length = (
      <span style={{position:'absolute',right:'8px',bottom:'8px',fontSize:'12px',color:'#ccc'}}>{this.state.paperInsLength}/500</span>
    )

    let subLength = this.props.fixHasNumArr.length;

    return (
      <div style={this.props.style} className="displayFlx">
        <Sidebar/>
        <div className="text-right-left">

          <Breadcrumb>
            <Breadcrumb.Item onClick={this.checkData.bind(this,"首页")}>
              <Icon type="home" theme="outlined" style={{fontSize:'14px',marginRight: '2px'}}/>
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item onClick={this.checkData.bind(this,"试卷管理")}>
              <i className="iconfont" style={{fontSize:'12px',marginRight: '5px'}}>&#xe62e;</i>
              <span>试卷管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="edit" style={{marginRight: '5px'}} />
              <span>编辑固定试卷</span>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="edit-paper">编辑固定试卷</div>

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
                  maxLength="500"
                  value={this.state.paperIns}/>
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
                        <span>填空题</span>
                    </div>
                    <div className="total-block">
                        <span className="first-span">已选数量</span>
                        <span className="number">{this.props.singleChioceNum}</span>
                        <span className="number">{this.props.mulChioceNum}</span>
                        <span className="number">{this.props.exericeChioceNum}</span>
                    </div>
                    <div className="pass-per">
                      <div>
                        <span>总题数：{subLength}</span>
                        <span>总分：{this.props.sum}</span>
                        <span>
                          <span style={{marginRight:'6px'}}>及格线*</span>
                          <InputNumber className="input-padding" min={1} max={100} step={1} value={this.state.paperpass} onChange={(event)=>{this.onChangePass(event)}} />
                          <span style={{marginLeft:'6px'}}>%</span>

                        </span>
                        <span>（及格分{(this.props.sum*this.state.paperpass*0.01).toFixed('2')}=总分{this.props.sum}分*{this.state.paperpass}及格线%）</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 是否可以预览以及保存，保存提交方法saveFixExam */}
                {
                  this.state.paperName=="" ?
                  <div className="editbtn">
                    <Button disabled>预览试卷</Button>
                    <Button type="primary" disabled>保存</Button>
                  </div>
                  :
                  <div className="editbtn">
                    <Button onClick={this.seeExamPaper}>预览试卷</Button>
                    <Button type="primary" disabled={this.state.saveVisible} onClick={this.saveFixExam}>保存</Button>
                  </div>
                }

              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  const { fixedTable } = state;

  const selectQuestionList = Object.keys(fixedTable);
  const fixArr = Object.keys(fixedTable).map(key=>fixedTable[key]);

  const fixHasNumArr=[]

  fixArr.forEach((item,index)=>{

    item = {
      ...item,
      sequence: index,
      // number: index+1<10 ? 0+index:index
      // sequence:index+1<10 ? '0'+(index+1):index+1
    }
    fixHasNumArr.push(item)
  })

  let sum =0;


  fixHasNumArr.map(item=>{

    sum+=parseFloat(item.grade);

  });

  if(sum.toString().length>6){
    sum=sum.toFixed('2');
  }



  let singleChioceNum=0;
  let mulChioceNum=0;
  let exericeChioceNum=0;


  fixHasNumArr.forEach(item=>{
    if(item.problem_type==="choiceresponse"){
      mulChioceNum++
    }
    else if(item.problem_type==="multiplechoiceresponse"){
      singleChioceNum++
    }
    else{
      exericeChioceNum++
    }
  })

  return {
    selectQuestionList,
    fixedTable,
    fixHasNumArr,
    sum,
    mulChioceNum,
    singleChioceNum,
    exericeChioceNum,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setFixedTable: (data) => {
      dispatch(setFixedTable(data))
    }
  }
}

const EditContainer = connect(mapStateToProps,mapDispatchToProps)(EditContainerReducer)








export default class Edit extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    showShadow: false,
    isShow:false,
    type:"fixed"
  }

  setShow=(isShow)=>{

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

    let id = this.props.match.params.id;
    if(id===undefined){

    }
    else{
      axios.get('/api/exampapers/fixed/'+id+'/')
      .then(res=>{

        this.setState({
          type:res.data.data.create_type
        })

      })
      .catch(res=>{

      })
    }

  }


  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px'}
    const {isShow} = this.state;

    const display = {
      display:isShow ? 'none':'flex'
    }

    const selectdispaly = {
      display:isShow ? 'block':'none',
      width: '100%',
    }

    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>


          {
            this.state.type==="fixed" ?
            <div style={{display: 'flex',width: '100%',maxWidth: '1180px',minWidth: '992px'}}>
              <EditContainer style={display} id={this.props.match.params.id} setShow={this.setShow} isShow={isShow}/>

              <SelectQuestion
                selectQuestionList={this.state.selectQuestionList}
                setShow={this.setShow}
                setFixedList={this.setFixedList}
                paperType="fixed" // random || fixed
                style={selectdispaly}
              />
            </div>
            :
            <RandomExam id={this.props.match.params.id}/>
          }
        </div>
        <Footer />
      </div>
    );
  }
}