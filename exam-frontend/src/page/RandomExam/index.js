import React from 'react';
import { connect } from 'react-redux'
import { Input,Button,Breadcrumb,Tooltip,Icon,Modal,Radio,InputNumber} from 'antd';
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

  componentDidMount() {

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
    this.setState({
      paperpass:e
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

  //抽取数量
  onChangeNumber=(e,id,type)=>{
    this.props.randomTable.map(item=>{
      if(item.id==id&&type=='multiplechoiceresponse'){
        item.multiplechoiceresponseNumber=e
      }
      if(item.id==id&&type=='choiceresponse'){
        item.choiceresponseNumber=e
      }
      if(item.id==id&&type=='stringresponse'){
        item.stringresponseNumber=e
      }
    })

    this.props.setRandomTable(this.props.randomTable);
  }

  //抽取分数
  onChangeGrade=(e,id,type)=>{
    console.log(e);
    this.props.randomTable.map(item=>{
      if(item.id==id&&type=='multiplechoiceresponse'){
        item.multiplechoiceresponseGrade=e
      }
      if(item.id==id&&type=='choiceresponse'){
        item.choiceresponseGrade=e
      }
      if(item.id==id&&type=='stringresponse'){
        item.stringresponseGrade=e
      }
    })

    this.props.setRandomTable(this.props.randomTable);

    //console.log(this.props.randomTable);

  }


  //统一设置分数

  onChangeAllGrade=(e)=>{
    this.setState({
      allGrade:e,
    })
  }

  onChangeSomeGrade=(e,type)=>{
    if(type=="multiplechoiceresponseGrade"){
      this.setState({
        multiplechoiceresponseGrade:e
      })
    }
    if(type=="choiceresponseGrade"){
      this.setState({
        choiceresponseGrade:e
      })
    }
    if(type=="stringresponseGrade"){
      this.setState({
        stringresponseGrade:e
      })
    }
  }

  settingHandleOk = (e) => {

    if(this.state.value==1){

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
    console.log(e);
    this.setState({
      settingScoreVisible: false,
    });
  }

  //删除

  seleteSection=(id)=>{

    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk:()=>{
        this.props.randomTable.map((item,index)=>{

          if(item.id==id){
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





  showDeleteConfirm=(id)=>{
    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk:()=>{
        //删除并回推数据
        delete this.props.fixedTable[id];

        this.props.setFixedTable(this.props.fixedTable);

      },
      onCancel:()=>{

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
    if(this.state.paperName==""){
      this.warning();
    }
    else{

    }
  }

  warning=()=>{
    Modal.warning({
      title: '提示',
      content: '试卷名称不能为空！',
    });
  }



  render() {
    const inputStyle={
      width:'468px'
    }

    const Length = (
      <span style={{position:'absolute',right:'8px',bottom:'8px',fontSize:'12px',color:'#ccc'}}>{this.state.paperInsLength}/500</span>
    )

    var randomArrData=[];

    return (
      <div style={this.props.style} className="displayFlx">
        <div>
          <Modal
            title="批量设置分值"
            visible={this.state.settingScoreVisible}
            onOk={this.settingHandleOk}
            onCancel={this.settingHandleCancel}
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
                <InputNumber min={0.01} max={100} step={0.01} value={this.state.choiceresponseGrade} onChange={(event)=>this.onChangeSomeGrade(event,'choiceresponseGrade')} />
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

                  <Button type="primary" onClick={()=>this.props.setShow(true)} >添加 </Button>

                  {
                    this.props.randomArr.length === 0 ?
                      <Button type="primary" disabled style={{marginLeft:'10px'}}>批量设置分值</Button>
                    :
                      <Button type="primary" style={{marginLeft:'10px'}} onClick={this.showModal}>批量设置分值</Button>
                  }
                </div>
              <div>


                {
                  this.props.randomArr.length>0 ?
                  <div>
                    {
                    this.props.randomArr.map((item,index)=>{
                      return(
                        <div class="random-exam" key={item.id} style={{marginBottom:'10px'}}>
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
                                item.multiplechoiceresponse==0 ?
                                <InputNumber disabled min={0} max={item.multiplechoiceresponse} defaultValue={0} step={1} onChange={(event)=>this.onChangeNumber(event,item.id,'multiplechoiceresponse')} />
                                :
                                <InputNumber min={0} max={item.multiplechoiceresponse} value={item.multiplechoiceresponseNumber} step={1} onChange={(event)=>this.onChangeNumber(event,item.id,'multiplechoiceresponse')} />
                              }

                            </div>
                          </li>
                          <li className="question-score">
                            <div>
                              <span style={{marginRight:'30px'}}>单题分数</span>

                              {
                                item.multiplechoiceresponse==0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01} defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'multiplechoiceresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01} value={item.multiplechoiceresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'multiplechoiceresponse')} />
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
                                item.choiceresponse==0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01}  defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'choiceresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01}  value={item.choiceresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'choiceresponse')} />
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
                                item.stringresponse==0 ?
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
                                item.stringresponse==0 ?
                                <InputNumber disabled min={0.01} max={100} step={0.01} defaultValue={1} onChange={(event)=>this.onChangeGrade(event,item.id,'stringresponse')} />
                                :
                                <InputNumber min={0.01} max={100} step={0.01} value={item.stringresponseGrade} onChange={(event)=>this.onChangeGrade(event,item.id,'stringresponse')} />
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
                  <div className="examnodata">
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
                        <InputNumber className="input-padding" min={1} max={100} step={1} value={this.state.paperpass} onChange={(event)=>{this.onChangePass(event)}} />
                        <span style={{marginLeft:'6px'}}>%</span>

                      </span>

                      <span>（及格分60=总分100分*及格线60%）</span>
                    </div>
                  </div>
                </div>
              </div>

              {
                this.props.randomArr.length>0 ?
                <div className="editbtn" style={{width:'64px'}}>
                  <Button type="primary" onClick={this.saveRandomExam}>保存</Button>
                </div>
                :
                <div className="editbtn" style={{width:'64px'}}>
                  <Button type="primary" disabled>保存</Button>
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

  const randomArr=[];

  for (let i in randomTable) {
    randomArr.push(randomTable[i]);
  }

  console.log(randomTable);
  console.log(randomArr);

  return {
    selectQuestionList,
    fixedTable,
    randomTable,
    randomArr,
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
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <RandomExamContainer setShow={this.setShow} isShow={isShow} style={display}/>

          <SelectQuestion
            selectQuestionList={this.state.selectQuestionList}
            setShow={this.setShow}
            setFixedList={this.setFixedList}
            paperType="random" // random || fixed
            style={selectdispaly}
          />

        </div>
        <Footer />
      </div>
    );
  }
}