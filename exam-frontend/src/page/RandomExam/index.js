import React from 'react';
import { connect } from 'react-redux'
import { Input,Button,Breadcrumb,Tooltip,Icon,Modal,Radio,InputNumber,message} from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import SelectQuestion from '../SelectQuestion'
import { setFixedTable,setRandomTable } from '../../model/action'
import './index.scss';
import $ from "jquery";
import axios from 'axios';
import none from "../../assets/images/none.png";
const RadioGroup = Radio.Group;


const { TextArea } = Input;

const confirm = Modal.confirm;


class RandomExamContainerReducer extends React.Component {
  state={
    loading:true,
    paperName:"",
    paperIns:"",
    paper:[],
    paperInsLength:0,
    paperpass:60,
    settingScoreVisible: false,
    value: 1,
    saveVisible:true,
    randomPaper:[],
    allGrade:1,
    multiplechoiceresponseGrade:1,
    choiceresponseGrade:1,
    stringresponseGrade:1,
  }

  constructor(props) {
    super(props);
  }

  componentWillUnmount(){
    this.props.randomTable.length=0;
    this.props.setRandomTable(this.props.randomTable);
  }
  componentDidMount() {
    let id = this.props.id;

    if(id===undefined){

    }
    else{
      axios.get('/api/exampapers/random/'+id+'/')
      .then(res=>{

        let data= res.data.data;
        this.setState({
          paperName:data.name,
          paperIns:data.description,
          paperpass:data.passing_ratio,
        })

        let sectionID=[];

        data.subject.map(item=>{
          sectionID.push(item.id);
        })


        axios.post('/api/sections/problems/count/',{
          section_ids:sectionID
        })
        .then(res=>{
          console.log(res.data.data);

          data.subject.map((item,index)=>{
            item["choiceresponse"]=res.data.data[index].choiceresponse;
            item["multiplechoiceresponse"]=res.data.data[index].multiplechoiceresponse;
            item["stringresponse"]=res.data.data[index].stringresponse;
          })

          console.log(data.subject);

          this.props.setRandomTable(data.subject);
        })
        .catch(error=>{

        })


        this.props.setRandomTable(data.subject);

      })

      .catch(error=>{

      })
    }
  }



  //修改试卷名称
  onChangePaperName=(e)=>{
    this.setState({
      paperName:e.target.value,
    })

  }
  //修改试卷说明
  onChangePaperIns=(e)=>{
    this.setState({
      paperIns:e.target.value,
      paperInsLength:e.target.value.length,
    })
  }
  //修改及格线数值
  onChangePass=(e)=>{
    if(e==""){
      e=1;
    }
    this.setState({
      paperpass:parseInt(this.formatterInteger(e,100,0))
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

  //设置分数
  showModal = () => {
    this.setState({
      settingScoreVisible: true,
    });
  }

  //整数
  formatterInteger=(value, max, min)=> {
    value = value.toString().replace(/\$\s?|([^\d]*)/g, '');
    if (parseInt(value) > max || parseInt(value) < min) {
      value = value.substring(0, value.length-1);
    }
    return value;
  }

  //抽取数量
  onChangeNumber=(e,id,type,max)=>{
    if(e==""){
      e=0;
    }
    this.props.randomTable.map(item=>{
      if(item.id===id&&type==='multiplechoiceresponse'){
        item.multiplechoiceresponseNumber=parseInt(this.formatterInteger(e,max,0));
      }
      if(item.id===id&&type==='choiceresponse'){
        item.choiceresponseNumber=parseInt(this.formatterInteger(e,max,0));
      }
      if(item.id===id&&type==='stringresponse'){
        item.stringresponseNumber=parseInt(this.formatterInteger(e,max,0));
      }
    })

    this.props.setRandomTable(this.props.randomTable);

  }

  //抽取分数
  onChangeGrade=(e,id,type)=>{

    this.props.randomTable.map(item=>{
      if(item.id===id&&type==='multiplechoiceresponse'){
        item.multiplechoiceresponseGrade=e
      }
      if(item.id===id&&type==='choiceresponse'){
        item.choiceresponseGrade=e
      }
      if(item.id===id&&type==='stringresponse'){
        item.stringresponseGrade=e
      }
    })

    this.props.setRandomTable(this.props.randomTable);



  }

  onBlurGrade=(e,id,type)=>{
    this.props.randomTable.map(item=>{
      if(item.id===id&&type==='multiplechoiceresponse'){
        if(item.multiplechoiceresponseGrade===undefined){
          item.multiplechoiceresponseGrade=0.01
        }
      }
      if(item.id===id&&type==='choiceresponse'){
        if(item.choiceresponseGrade==undefined){
          item.choiceresponseGrade=0.01
        }
      }
      if(item.id===id&&type==='stringresponse'){
        if(item.stringresponseGrade==undefined){
          item.stringresponseGrade=0.01
        }
      }
    })

    this.props.setRandomTable(this.props.randomTable);

  }

  //统一设置分数

  onChangeAllGrade=(e)=>{
    this.setState({
      allGrade:e,
    })
  }

  onChangeSomeGrade=(e,type)=>{
    if(type==="multiplechoiceresponseGrade"){
      this.setState({
        multiplechoiceresponseGrade:e
      })
    }
    if(type==="choiceresponseGrade"){
      this.setState({
        choiceresponseGrade:e
      })
    }
    if(type==="stringresponseGrade"){
      this.setState({
        stringresponseGrade:e
      })
    }
  }

  settingHandleOk = (e) => {

    if(this.state.value===1){

      this.props.randomTable.map(item=>{

        item.multiplechoiceresponseGrade=this.state.allGrade

        item.choiceresponseGrade=this.state.allGrade

        item.stringresponseGrade=this.state.allGrade

      })

      this.props.setRandomTable(this.props.randomTable);

    }

    else{
      this.props.randomTable.map(item=>{

        item.multiplechoiceresponseGrade=this.state.multiplechoiceresponseGrade

        item.choiceresponseGrade=this.state.choiceresponseGrade

        item.stringresponseGrade=this.state.stringresponseGrade

      })

      this.props.setRandomTable(this.props.randomTable);

    }

    this.setState({
      settingScoreVisible: false,
    });

  }

  settingHandleCancel = (e) => {

    this.setState({
      settingScoreVisible: false,
    });
  }

  //删除

  seleteSection=(id)=>{

    confirm({
      title: '提示',
      content: '确定删除此题目',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      iconType:'exclamation-circle exclamation-red',
      onOk:()=>{
        this.props.randomTable.map((item,index)=>{

          if(item.id===id){
            this.props.randomTable.splice(index,1);
          }

        })
        this.props.setRandomTable(this.props.randomTable);
      },
      onCancel:()=>{
        console.log(231)
      },
    });
  }

  settingOnChange=(e)=>{
    this.setState({
      value:e.target.value,
    })
  }


  //保存随机试卷
  saveRandomExam=(e)=>{

    if(this.props.id===undefined){

      if(this.state.paperName===""){
        this.warning();
      }
      else{

        axios.post('/api/exampapers/random/',{
          name:this.state.paperName,
          description:this.state.paperIns,
          passing_ratio:this.state.paperpass,
          subject:this.props.randomTable
        })
        .then(res=>{
          console.log(res);
          window.location.href="/#/manage";
        })
        .catch(error=>{
          switch (error.response.status) {
            case 400:
             this.warning();
             break
            case 500:
              message.error('网络错误');
              break
            default:
          }
        })
      }
    }

    else{
      if(this.state.paperName===""){
        this.warning();
      }
      else{
        console.log(this.props.randomTable);
        axios.put('/api/exampapers/random/'+this.props.id+'/',{
          name:this.state.paperName,
          description:this.state.paperIns,
          passing_ratio:this.state.paperpass,
          subject:this.props.randomTable
        })
        .then(res=>{
          console.log(res);
          window.location.href="/#/manage";
          this.props.randomTable.length=0;
          this.props.setRandomTable(this.props.randomTable);
        })
        .catch(error=>{

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
      if(this.state.paperName==""&&this.state.paperIns==""&&this.props.randomTable.length===0){
        window.location.href="/#/";
      }
      else{
        this.confirmData("首页");
      }
    }

    else{
      if(this.state.paperName==""&&this.state.paperIns==""&&this.props.randomTablelength===0){
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


    return (
      <div style={this.props.style} className="displayFlx">
        <div>
          <Modal
            title="批量设置分值"
            visible={this.state.settingScoreVisible}
            onOk={this.settingHandleOk}
            onCancel={this.settingHandleCancel}
            footer={[
              <Button key="取消" onClick={this.settingHandleCancel}>取消</Button>,
              <Button key="确定" type="primary"  onClick={this.settingHandleOk}>
                确定
              </Button>
            ]}
          >
            <p>批量设置的分值将覆盖掉之前设置的分值，请谨慎操作。</p>
            <RadioGroup onChange={this.settingOnChange} value={this.state.value} style={{marginTop:'10px'}}>
              <Radio value={1}>统一分数</Radio>
              <div style={{margin:'6px 0px 6px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>所有题目</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0.01} max={100} step={0.01} value={this.state.allGrade} onChange={(event)=>this.onChangeAllGrade(event)} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <Radio value={2}>按题型</Radio>
              <div style={{margin:'6px 0px 12px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>单选题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0.01} max={100} step={0.01} value={this.state.multiplechoiceresponseGrade} onChange={(event)=>this.onChangeSomeGrade(event,'multiplechoiceresponseGrade')} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <div style={{margin:'6px 0px 12px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>多选题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0.01} max={100} step={0.01} value={this.state.choiceresponseGrade} onChange={(event)=>this.onChangeSomeGrade(event,'choiceresponseGrade')}/>
                <span style={{marginLeft:'6px'}}>分</span>
              </div>

              <div style={{margin:'6px 0px 6px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>填空题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0.01} max={100} step={0.01} value={this.state.stringresponseGrade} onChange={(event)=>this.onChangeSomeGrade(event,'stringresponseGrade')} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
            </RadioGroup>

          </Modal>
        </div>

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
              <span>编辑随机试卷</span>
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
                  maxLength="500"
                  value={this.state.paperIns}/>
                  { Length }
                </div>
              </div>
            </div>
            <div className="label-box">
              <div style={{lineHeight:'32px'}}>试题列表</div>
              <div>
                <div style={{marginBottom:'10px'}}>

                  <Button type="primary" onClick={()=>this.props.setShow(true)} >
                  <i className="iconfont" style={{fontSize:'12px',marginRight: '5px'}}>&#xe62f;</i>
                  添加 </Button>

                  {
                    this.props.randomTable.length === 0 ?
                      <Button type="primary" disabled style={{marginLeft:'10px'}}>
                      <i className="iconfont" style={{fontSize:'12px',marginRight: '5px'}}>&#xe631;</i>
                      批量设置分值</Button>
                    :
                      <Button type="primary" style={{marginLeft:'10px'}} onClick={this.showModal}>
                      <i className="iconfont" style={{fontSize:'12px',marginRight: '5px'}}>&#xe631;</i>
                      批量设置分值</Button>
                  }
                </div>
              <div>


                {
                  this.props.randomTable.length>0 ?
                  <div>
                    {
                    this.props.randomTable.map((item,index)=>{
                      return(
                        <div className="random-exam" loading={this.state.loading} key={item.id} style={{marginBottom:'10px'}}>
                        <div className="courseName">
                        <span className="examtype-name">{item.name}</span>
                        <Tooltip title="删除" className="delete-right">
                          <Icon type="delete" onClick={this.seleteSection.bind(this,item.id)} className="icon-red" style={{fontSize:'16px'}} />
                        </Tooltip>
                      </div>
                        <ul className="question-type">
                          <li className="type">单选题</li>
                          <li className="question-addnumber">共<a>{item.multiplechoiceresponse}</a>题</li>
                          <li className="question-number">
                            <div>
                              <span style={{marginRight:'30px'}}>抽题数目</span>

                              {
                                item.multiplechoiceresponse===0 ?
                                <InputNumber disabled min={0} max={item.multiplechoiceresponse} precision={1} defaultValue={0} step={1} onChange={(event)=>this.onChangeNumber(event,item.id,'multiplechoiceresponse',item.multiplechoiceresponse)} />
                                :
                                <InputNumber min={0} max={item.multiplechoiceresponse} value={item.multiplechoiceresponseNumber} step={1} onChange={(event)=>this.onChangeNumber(event,item.id,'multiplechoiceresponse')} onBlur={(event)=>this.onBlurNumber(event,item.id,'multiplechoiceresponse')} />
                              }

                            </div>
                          </li>
                          <li className="question-score">
                            <div>
                              <span style={{marginRight:'30px'}}>单题分数</span>

                              {
                                item.multiplechoiceresponse===0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01} defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'multiplechoiceresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01} value={item.multiplechoiceresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'multiplechoiceresponse')} onBlur={(event)=>this.onBlurGrade(event,item.id,'multiplechoiceresponse')} />
                              }

                            </div>
                          </li>
                        </ul>
                        <ul className="question-type">
                          <li className="type">多选题</li>
                          <li className="question-addnumber">共<a>{item.choiceresponse}</a>题</li>
                          <li className="question-number">
                            <div>
                              <span style={{marginRight:'30px'}}>抽题数目</span>

                              {
                                item.choiceresponse==0 ?
                                <InputNumber disabled min={0} max={item.choiceresponse} step={1} defaultValue={0} onChange={(event)=>this.onChangeNumber(event,item.id,'choiceresponse')} />
                                :
                                <InputNumber min={0} max={item.choiceresponse} step={1} value={item.choiceresponseNumber} onChange={(event)=>this.onChangeNumber(event,item.id,'choiceresponse')} />
                              }

                            </div>
                          </li>
                          <li className="question-score">
                            <div>
                              <span style={{marginRight:'30px'}}>单题分数</span>

                              {
                                item.choiceresponse===0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01}  defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'choiceresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01}  value={item.choiceresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'choiceresponse')} onBlur={(event)=>this.onBlurGrade(event,item.id,'choiceresponse')}/>
                              }

                            </div>
                          </li>
                        </ul>
                        <ul className="question-type">
                          <li className="type">填空题</li>
                          <li className="question-addnumber">共<a>{item.stringresponse}</a>题</li>
                          <li className="question-number">
                            <div>
                              <span style={{marginRight:'30px'}}>抽题数目</span>

                              {
                                item.stringresponse===0 ?
                                <InputNumber disabled min={0} max={item.choiceresponse} step={1} defaultValue={0} onChange={(event)=>this.onChangeNumber(event,item.id,'stringresponse')} />
                                :
                                <InputNumber min={0} max={item.choiceresponse} step={1} value={item.stringresponseNumber} onChange={(event)=>this.onChangeNumber(event,item.id,'stringresponse')} />
                              }

                            </div>
                          </li>
                          <li className="question-score">
                            <div>
                              <span style={{marginRight:'30px'}}>单题分数</span>
                              {
                                item.stringresponse===0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01} defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'stringresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01} value={item.stringresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'stringresponse')} onBlur={(event)=>this.onBlurGrade(event,item.id,'stringresponse')} />
                              }

                            </div>
                          </li>
                        </ul>
                      </div>
                      )
                    })
                    }
                  </div>
                  :
                  <div className="examnodata" loading={this.state.loading}>
                    <img src={none} style={{display:'block',width:'167px',height:'auto',margin:'42px auto 10px auto'}} />
                    <p style={{textAlign:'center'}}>暂无数据</p>
                  </div>

                }
              </div>



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
                      <span className="number">{this.props.multiplechoiceresponseNumber}</span>
                      <span className="number">{this.props.choiceresponseNumber}</span>
                      <span className="number">{this.props.stringresponseNumber}</span>
                  </div>
                  <div className="pass-per">
                    <div>
                      <span>总题数：{this.props.sumAll}</span>
                      <span>总分：{this.props.sumGrade}</span>
                      <span>
                        <span style={{marginRight:'6px'}}>及格线*</span>
                        <InputNumber className="input-padding" min={1} max={100} step={1} value={this.state.paperpass} onChange={(event)=>{this.onChangePass(event)}} />
                        <span style={{marginLeft:'6px'}}>%</span>
                      </span>
                      <span>（及格分60=总分100分*及格线60%）</span>
                    </div>
                  </div>
                </div>
              </div>

              {
                this.state.paperName=="" ?
                <div className="editbtn" style={{width:'64px'}}>
                  <Button type="primary" disabled>保存</Button>
                </div>
                :
                <div className="editbtn" style={{width:'64px'}}>
                  <Button type="primary" onClick={this.saveRandomExam}>保存</Button>
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
  const {fixedTable, randomTable } = state;
  const selectQuestionList = Object.keys(fixedTable);

  //抽题数目



  let multiplechoiceresponseNumber=0,
      choiceresponseNumber=0,
      stringresponseNumber=0,
      multiplechoiceresponseGrade=0,
      choiceresponseGrade=0,
      stringresponseGrade=0;

  randomTable.map(item=>{
    if(item.multiplechoiceresponseNumber===""){
      item.multiplechoiceresponseNumber=0;
    }
    if(item.choiceresponseNumber===""){
      item.choiceresponseNumber=0;
    }
    if(item.stringresponseNumber===""){
      item.stringresponseNumber=0;
    }
    multiplechoiceresponseNumber+=parseInt(item.multiplechoiceresponseNumber);
    choiceresponseNumber+=parseInt(item.choiceresponseNumber);
    stringresponseNumber+=parseInt(item.stringresponseNumber);
    multiplechoiceresponseGrade+=item.multiplechoiceresponseNumber*item.multiplechoiceresponseGrade;
    choiceresponseGrade+=item.choiceresponseNumber*item.choiceresponseGrade;
    stringresponseGrade+=item.stringresponseNumber*item.stringresponseGrade;
  })

  let sumAll=parseInt(multiplechoiceresponseNumber)+parseInt(choiceresponseNumber)+parseInt(stringresponseNumber);
  let sumGrade = multiplechoiceresponseGrade+choiceresponseGrade+stringresponseGrade;
  console.log(sumAll);


  sumGrade = sumGrade.toFixed(2)


  return {
    selectQuestionList,
    fixedTable,
    randomTable,
    multiplechoiceresponseNumber,
    choiceresponseNumber,
    stringresponseNumber,
    sumAll,
    sumGrade,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setFixedTable: (data) => {
      dispatch(setFixedTable(data))
    },
    setRandomTable: (data) => dispatch(setRandomTable(data))
  }
}

const RandomExamContainer= connect(mapStateToProps,mapDispatchToProps)(RandomExamContainerReducer)



export default class RandomExam extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    showShadow: false,
    isShow:false,
  }

  componentDidMount(){
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

    console.log(this.props.id);
  }

  setShow=(isShow)=>{

    this.setState({
      isShow,
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 180 + 'px'}

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
        {
          this.props.id===undefined ?
          <Header showShadow={this.state.showShadow} />
          :
          null
        }

        <div className="container" style={containerHeight}>
          <RandomExamContainer id={this.props.id} setShow={this.setShow} isShow={isShow} style={display}/>

          <SelectQuestion
            selectQuestionList={this.state.selectQuestionList}
            setShow={this.setShow}
            setFixedList={this.setFixedList}
            paperType="random" // random || fixed
            style={selectdispaly}
          />

        </div>
        {
          this.props.id===undefined ?
          <Footer />
          :
          null
        }

      </div>
    );
  }
}