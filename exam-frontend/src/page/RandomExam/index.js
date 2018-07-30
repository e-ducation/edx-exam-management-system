import React from 'react';
import { Input,Button,Breadcrumb,Tooltip,Icon,Modal,Radio,InputNumber} from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import './index.scss';
import $ from "jquery";
const RadioGroup = Radio.Group;


const { TextArea } = Input;


class RandomExamContainer extends React.Component {
  state={
    paperName:"这是试卷名称",
    paperIns:"这是试卷说明",
    paper:[],
    paperpass:60,
    settingScoreVisible: true,
    value: 1,
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

  //设置分数
  showModal = () => {
    this.setState({
      settingScoreVisible: true,
    });
  }

  onChange=(value)=>{
    console.log('changed', value);
  }

  settingHandleOk = (e) => {
    console.log(e);
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


  render() {
    const inputStyle={
      width:'468px'
    }

    return (
      <div className="displayFlx">
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
                <InputNumber min={0} max={10} step={0.1} onChange={this.onChange} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <Radio value={2}>按题型</Radio>
              <div style={{margin:'6px 0px 12px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>单选题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0} max={10} step={0.1} onChange={this.onChange} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <div style={{margin:'6px 0px 12px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>多选题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0} max={10} step={0.1} onChange={this.onChange} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <div style={{margin:'6px 0px 12px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>判断题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0} max={10} step={0.1} onChange={this.onChange} />
                <span style={{marginLeft:'6px'}}>分</span>
              </div>
              <div style={{margin:'6px 0px 6px 23px'}}>
                <span style={{width:'80px',display:'inline-block'}}>填空题</span>
                <span style={{marginRight:'6px'}}>每题</span>
                <InputNumber min={0} max={10} step={0.1} onChange={this.onChange} />
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
              <div style={{marginBottom:'10px'}}>
                <Button type="primary">添加 </Button>
                <Button type="primary" style={{marginLeft:'10px'}} onClick={this.showModal}>批量设置分值</Button>
              </div>


                <div class="random-exam">
                  <div className="courseName">
                    <span className="examtype-name">母婴产品进阶课程</span>
                    <Tooltip title="删除" className="delete-right">
                      <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} />
                    </Tooltip>
                  </div>
                  <ul className="question-type">
                    <li className="type">选择题</li>
                    <li className="question-addnumber">共<a>120</a>题</li>
                    <li className="question-number">
                      <div>
                        <span style={{marginRight:'30px'}}>抽题数目</span>
                        <InputNumber min={0} max={10} step={1} onChange={this.onChange} />
                      </div>
                    </li>
                    <li className="question-score">
                      <div>
                        <span style={{marginRight:'30px'}}>单题分数</span>
                        <InputNumber min={0} max={10} step={1} onChange={this.onChange} />
                      </div>
                    </li>
                  </ul>
                  <ul className="question-type">
                    <li className="type">多选题</li>
                    <li className="question-addnumber">共<span>120</span>题</li>
                    <li className="question-number">3</li>
                    <li className="question-score">4</li>
                  </ul>
                  <ul className="question-type">
                    <li className="type">判断题</li>
                    <li className="question-addnumber">共<span>120</span>题</li>
                    <li className="question-number">3</li>
                    <li className="question-score">4</li>
                  </ul>
                  <ul className="question-type">
                    <li className="type">填空题</li>
                    <li className="question-addnumber">共<span>120</span>题</li>
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