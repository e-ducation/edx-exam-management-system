import React from 'react';
import { Button, Input, InputNumber, DatePicker, Switch, } from 'antd';
import moment from 'moment';
import Paper from './paper'
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

export default class Preview extends React.Component {
  state = {
    paper: {},
  }
  componentWillMount() {

  }
  getList = () => {

  }
  showPaper = () => {
    this.paper.showPaper();
  }
  selectPaper = (paper) => {
    this.setState({
      paper,
    })
  }
  render() {
    const { paper } = this.state;
    const { create } = this.props;
    return (
      <div className="task-content">
        <Paper selectPaper={this.selectPaper} value={paper.id} ref={(node) => { this.paper = node; }} />
        <div className="task-row">
          <div className="task-label">
            已选试卷*
          </div>
          <div className="task-item">
            {
              paper.id != undefined ?

                <div>
                  <div>
                    <span className="test-title">{paper.name}</span>
                    <div style={{ position: 'absolute', display: 'inline-block' }}>
                      <Button onClick={this.showPaper} style={{ position: "absolute", top: '-10px', marginLeft: '20px' }}>
                        <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe66d;</i>
                        更换试卷
                      </Button>
                      <Button style={{ position: "absolute", top: '-10px', marginLeft: '140px' }} type="primary">
                        <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe62f;</i>
                        预览试卷
                      </Button>
                    </div>
                  </div>
                  <div className="paper-info">
                    此试卷为快照，保存于10月1日
                  </div>
                  <div className="total">
                    <div className="total-block total-top">
                      <span className="first-span">题型</span>
                      <span>单选题</span>
                      <span>多选题</span>
                      <span>填空题</span>
                      <span>合计</span>
                    </div>
                    <div className="total-block">
                      <span className="first-span">数量</span>
                      <span className="number">{3}</span>
                      <span className="number">{1}</span>
                      <span className="number">{2}</span>
                      <span className="number">{2}</span>
                    </div>
                    <div className="total-block">
                      <span className="first-span">分数</span>
                      <span className="number">{3}</span>
                      <span className="number">{1}</span>
                      <span className="number">{2}</span>
                      <span className="number">{2}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span>及格线： {(paper.passing_grade / paper.total_grade).toFixed(2) * 100}%</span>
                  </div>
                </div>
                :
                <div>
                  <Button onClick={this.showPaper} style={{ position: "absolute", top: '-10px' }} type="primary">
                    <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe62f;</i>
                    添加试卷
                  </Button>
                </div>
            }
          </div>
        </div>
        {/* {
          paper.id != undefined &&
          <div className="task-row">
            <div className="task-label input-item">
              及格线
            </div>
            <div className="task-item">
              {
                (paper.passing_grade / paper.total_grade).toFixed(2) * 100
              }
              %
            </div>
          </div>
        } */}
        <div className="task-row">
          <div className="task-label input-item">
            考试名称
          </div>
          <div className="task-item">
            <Input maxLength={50} style={{ width: '350px' }} placeholder="输入试卷名称，限定50字符" />
          </div>
        </div>
        <div className="task-row input-item">
          <div className="task-label">
            考试周期
          </div>
          <div className="task-item">
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            // format={dateFormat}
            />
          </div>
        </div>
        <div className="task-row">
          <div className="task-label input-item">
            答卷时间
          </div>
          <div className="task-item">
            <InputNumber min={1} max={100} defaultValue={30} /> <span>分钟</span>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            参与人员
          </div>
          <div className="task-item">
            <div className="participate">
              <div style={{ minWidth: '60px' }}>成员：</div>
              <div>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
              </div>
            </div>

          </div>
        </div>
        <div className="task-row">
          <div className="task-label switch-item">
            题目排序
          </div>
          <div className="task-item">
            <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked /><span style={{ marginLeft: '15px' }}>开启以后题目顺序将随机打乱</span>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label switch-item">
            查看答案
          </div>
          <div className="task-item">
            <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked /><span style={{ marginLeft: '15px' }}>说明：默认不开启，即考生考试完毕后提交答案无答案查看。开启后即考生考试完毕后，有答案供其查看</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {
            create == false ?
              <Button>返回</Button>
              :
              <Button onClick={() => { this.props.goback() }}>返回</Button>
          }
          <Button type="primary" style={{ marginLeft: '18px' }}>发布</Button>
        </div>
      </div>
    )
  }
}