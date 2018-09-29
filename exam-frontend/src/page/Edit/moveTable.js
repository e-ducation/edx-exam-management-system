import React from 'react';
import { connect } from 'react-redux'
import { Button, Table, Tooltip, Icon, InputNumber, Modal, Radio } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import './index.scss';
import none from "../../assets/images/none.png";
import { setFixedTable } from '../../model/action'

const RadioGroup = Radio.Group;
const confirm = Modal.confirm;


function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver && initialClientOffset) {
      const direction = dragDirection(
        dragRow.index,
        restProps.index,
        initialClientOffset,
        clientOffset,
        sourceClientOffset
      );
      if (direction === 'downward') {
        className += ' drop-over-downward';
      }
      if (direction === 'upward') {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);


class DragSortingTable extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }



  state = {
    data: '',
    settingScoreVisible: false,
    value: 1,
    allGrade: 1,
    singleGrade: 1,
    MuiGrade: 1,
    exericeGrade: 1,
    value01True: false,
    value02True: true,
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  //设置分数
  showModal = () => {
    this.setState({
      settingScoreVisible: true,
    });
  }
  //单个设置分数
  onsingleChange = (e, id) => {

    this.props.fixedTable[id].grade = e
    // eslint-disable-next-line
    this.props.fixHasNumArr.map(item => {
      if (item.problem_id === id) {
        item.grade = e
      }
    })

    this.props.setFixedTable(this.props.fixedTable);

  }

  //失去焦点
  onsingleBlur = (e, id) => {

    // eslint-disable-next-line
    this.props.fixHasNumArr.map(item => {
      if (item.problem_id === id) {
        if (item.grade === undefined) {
          item.grade = 0.01
          this.props.fixedTable[id].grade = 0.01
        }
      }
    })

    this.props.setFixedTable(this.props.fixedTable);

  }




  settingHandleOk = (e) => {

    if (this.state.value === 1) {

      Object.keys(this.props.fixedTable).forEach((key) => {
        this.props.fixedTable[key].grade = this.state.allGrade;
      })
      this.props.setFixedTable(this.props.fixedTable);

    }
    else {
      for (var i in this.props.fixedTable) {
        if (this.props.fixedTable[i].problem_type === "multiplechoiceresponse") {
          this.props.fixedTable[i].grade = this.state.singleGrade;
        }
        else if (this.props.fixedTable[i].problem_type === "choiceresponse") {
          this.props.fixedTable[i].grade = this.state.MuiGrade;
        }
        else {
          this.props.fixedTable[i].grade = this.state.exericeGrade;
        }
      }
      this.props.setFixedTable(this.props.fixedTable);
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

  moveRow = (dragIndex, hoverIndex) => {
    const data = this.props.fixHasNumArr;
    const dragRow = data[dragIndex];

    const props = update(this.props, {
      fixHasNumArr: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    })
    const arr = props.fixHasNumArr;

    const table = {};
    // eslint-disable-next-line
    arr.map(item => {
      table[item.problem_id] = item;
    })
    this.props.setFixedTable(table);

  }


  showDeleteConfirm = (id) => {

    confirm({
      title: '提示',
      content: '确定删除此题目',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      iconType: 'exclamation-circle exclamation-red',
      onOk: () => {
        //删除并回推数据
        delete this.props.fixedTable[id];

        this.props.setFixedTable(this.props.fixedTable);

      },
      onCancel: () => {

      },
    });
  }




  //批量设置分数
  settingOnChange = (e) => {

    if (e.target.value === 1) {
      this.setState({
        value01True: false,
        value02True: true
      })
    }
    else {
      this.setState({
        value01True: true,
        value02True: false
      })
    }

    this.setState({
      value: e.target.value,
    })
  }

  //修改全部分数
  onAllGradeChange = (e) => {

    this.setState({
      allGrade: e
    })

  }

  onAllGradeBlur = (e, grade) => {

    if (grade === undefined) {
      console.log(1);
      this.setState({
        allGrade: 0.01
      })
    }
  }
  //整数
  formatterInteger = (value, max, min) => {
    value = value.toString().replace(/\$\s?|([^\d]*)/g, '');
    if (parseInt(value, 10) > max || parseInt(value, 10) < min) {
      value = value.substring(0, value.length - 1);
    }
    return value;
  }


  //修改单选题
  onSingleChange = (e) => {
    this.setState({
      singleGrade: e
    })
  }

  onSingleBlur = (e, grade) => {

    if (grade === undefined) {

      this.setState({
        singleGrade: 0.01
      })
    }
  }


  //修改多选题的分数
  onMuiChange = (e) => {
    this.setState({
      MuiGrade: e
    })
  }

  onMuiBlur = (e, grade) => {
    if (grade === undefined) {
      this.setState({
        MuiGrade: 0.01
      })
    }
  }

  //修改填空题的分数
  onExericeChange = (e) => {
    this.setState({
      exericeGrade: e
    })
  }

  exericeGrade = (e, grade) => {
    if (grade === undefined) {
      this.setState({
        exericeGrade: 0.01
      })
    }
  }


  render() {

    const columns = [
      {
        width: '8.2%',
        title: '序号',
        dataIndex: 'sequence',
        render: (index) => index + 1 < 10 ? '0' + (index + 1) : index + 1
      }, {
        width: '67.4%',
        title: '试题',
        dataIndex: 'title'
      }, {
        width: '8.2%',
        title: '题型',
        dataIndex: 'problem_type',
        render: (text, record) => (
          <div>
            {
              (
                () => {
                  if (record.problem_type === "multiplechoiceresponse") {
                    return (
                      <span>单选题</span>
                    )
                  }
                  else if (record.problem_type === "choiceresponse") {
                    return (
                      <span>多选题</span>
                    )
                  }
                  else {
                    return (
                      <span>填空题</span>
                    )
                  }
                }
              )()
            }
          </div>
        )
      }, {
        width: '8.6%',
        title: '分值',
        dataIndex: '',
        render: (text, record) => (
          <InputNumber className="input-padding" min={0.01} max={100} step={0.01} value={record.grade}
            onChange={(event) => { this.onsingleChange(event, record.problem_id) }}
            onBlur={(event) => { this.onsingleBlur(event, record.problem_id) }} />
        )
      }, {
        width: '7.6%',
        title: '操作',
        render: (text, record) => (
          <Tooltip title="删除">
            <Icon type="delete" data-key={record.subjectdec} className="icon-red" style={{ fontSize: '16px' }} onClick={this.showDeleteConfirm.bind(this, record.problem_id)} />
          </Tooltip>
        )
      }
    ];


    return (
      <div>
        <div>
          <Modal
            title="批量设置分值"
            visible={this.state.settingScoreVisible}
            onOk={this.settingHandleOk}
            onCancel={this.settingHandleCancel}
            footer={[
              <Button key="取消" onClick={this.settingHandleCancel}>取消</Button>,
              <Button key="确定" type="primary" onClick={this.settingHandleOk}>
                确定
              </Button>
            ]}
          >
            <p>批量设置的分值将覆盖掉之前设置的分值，请谨慎操作。</p>
            <RadioGroup onChange={this.settingOnChange} value={this.state.value} name="radiogroup" style={{ marginTop: '10px' }}>
              <Radio value={1}>统一分数</Radio>
              <div style={{ margin: '6px 0px 6px 23px' }}>
                <span style={{ width: '80px', display: 'inline-block' }}>所有题目</span>
                <span style={{ marginRight: '6px' }}>每题</span>
                <InputNumber className="input-padding" disabled={this.state.value01True} min={0.01} max={100} step={0.01} value={this.state.allGrade} onChange={(event) => { this.onAllGradeChange(event) }} onBlur={(event) => { this.onAllGradeBlur(event, this.state.allGrade) }} />
                <span style={{ marginLeft: '6px' }}>分</span>
              </div>
              <Radio value={2}>按题型</Radio>
              <div style={{ margin: '6px 0px 12px 23px' }}>
                <span style={{ width: '80px', display: 'inline-block' }}>单选题</span>
                <span style={{ marginRight: '6px' }}>每题</span>
                <InputNumber className="input-padding" disabled={this.state.value02True} min={0.01} max={100} step={0.01} value={this.state.singleGrade} onChange={(event) => { this.onSingleChange(event) }} onBlur={(event) => { this.onSingleBlur(event, this.state.singleGrade) }} />
                <span style={{ marginLeft: '6px' }}>分</span>
              </div>
              <div style={{ margin: '6px 0px 12px 23px' }}>
                <span style={{ width: '80px', display: 'inline-block' }}>多选题</span>
                <span style={{ marginRight: '6px' }}>每题</span>
                <InputNumber className="input-padding" disabled={this.state.value02True} min={0.01} max={100} step={0.01} value={this.state.MuiGrade} onChange={(event) => { this.onMuiChange(event) }} onBlur={(event) => { this.onMuiBlur(event, this.state.MuiGrade) }} />
                <span style={{ marginLeft: '6px' }}>分</span>
              </div>
              <div style={{ margin: '6px 0px 6px 23px' }}>
                <span style={{ width: '80px', display: 'inline-block' }}>填空题</span>
                <span style={{ marginRight: '6px' }}>每题</span>
                <InputNumber className="input-padding" disabled={this.state.value02True} min={0.01} max={100} step={0.01} value={this.state.exericeGrade} onChange={(event) => { this.onExericeChange(event) }} onBlur={(event) => { this.onExericeBlur(event, this.state.exericeGrade) }} />
                <span style={{ marginLeft: '6px' }}>分</span>
              </div>
            </RadioGroup>

          </Modal>
        </div>


        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" onClick={() => { this.props.setShow(true) }}>
            <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe62f;</i>
            添加试题
          </Button>
          {
            this.props.fixHasNumArr.length === 0 ?
              <Button type="primary" disabled style={{ marginLeft: '10px' }}>
                <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe631;</i>
                批量设置分值</Button>
              :
              <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.showModal}>
                <i className="iconfont" style={{ lineHeight: '16px', fontSize: '16px', marginRight: '5px' }}>&#xe631;</i>
                批量设置分值</Button>
          }

        </div>
        {
          this.props.fixHasNumArr.length === 0 ?
            <div className="examnodata">
              <img src={none} alt="暂无数据" style={{ display: 'block', width: '167px', height: 'auto', margin: '42px auto 10px auto' }} />
              <p style={{ textAlign: 'center' }}>暂无数据</p>
            </div>
            :

            <Table
              columns={columns}
              dataSource={this.props.fixHasNumArr}
              components={this.components}
              pagination={false}
              bordered
              className="editExam"
              size="small"
              rowKey="problem_id"
              onRow={(record, index) => ({
                index,
                moveRow: this.moveRow,
              })}
            />

        }


      </div>
    );
  }
}



const mapStateToProps = (state) => {
  const { fixedTable } = state;

  const selectQuestionList = Object.keys(fixedTable);

  const fixArr = Object.keys(fixedTable).map(key => fixedTable[key]);

  const fixHasNumArr = []

  fixArr.forEach((item, index) => {

    item = {
      ...item,
      // sequence:index+1<10 ? '0'+(index+1):index+1
      sequence: index,
    }
    fixHasNumArr.push(item)
  })

  let sum = 0;

  fixHasNumArr.map(item => {
    sum += item.grade;
    return sum;
  })

  return {
    selectQuestionList,
    fixedTable,
    fixHasNumArr,
    sum,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setFixedTable: (data) => {
      dispatch(setFixedTable(data))
    }
  }
}

const tableFix = connect(mapStateToProps, mapDispatchToProps)(DragSortingTable);

const MoveTable = DragDropContext(HTML5Backend)(tableFix);

export default MoveTable;