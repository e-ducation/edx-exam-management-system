import React from 'react';
import { Input,Button,Table,Tooltip,Icon,InputNumber,Modal,Radio} from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import './index.scss';
import none from "../../assets/images/none.png";
import axios from 'axios';

import SelectQuestion from '../SelectQuestion'

const RadioGroup = Radio.Group;
const { TextArea } = Input;

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
    this.numberList();
  }


  state = {
    data: [
      {subjectdec:'你好1',type:'选择题'},
      {subjectdec:'你好2',type:'选择题'}
    ],
    settingScoreVisible: false,
    selectQuestionList: [],
    paperType: '',
    selectSectionList: [],
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  //序列号
  numberList = ()=>{
    let arr=[]
    this.state.data.forEach((item,index)=>{

      item = {
        ...item,
        // number: index+1<10 ? 0+index:index
        number:index+1<10 ? '0'+(index+1):index
      }
      arr.push(item)
    })

    this.setState({
      data:arr
    })

    console.log(this.state.data)
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

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];

    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    );
    this.numberList();
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



  //删除题目
  deleteSubject=(index)=>{
    console.log(index);
  }

  render() {

    const columns = [
      {
        width:'8.2%',
        title: '序号',
        dataIndex:'number'
      },{
        width:'67.4%',
        title: '试题',
        dataIndex: 'subjectdec'
      },{
        width:'8.2%',
        title: '题型',
        dataIndex: 'type'
      },{
        width:'8.6%',
        title: '分值',
        dataIndex: 'score',
        render:(record)=>(
          <div className="inputBox">
            <div className="inputLeft">
              <Input type="text" />
            </div>
            <div className="inputRight">
              <div><Icon type="up" /></div>
              <div><Icon type="down" /></div>
            </div>
          </div>
        )
      },{
        width:'7.6%',
        title: '操作',
        dataIndex: 'operate',
        render:(record,index)=>(
          <Tooltip title="删除">
            <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} onClick={this.deleteSubject.bind(this.index)} />
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


        <div style={{marginBottom:'10px'}}>
          <Button type="primary" href="/#/question">添加试题</Button>
          {
            this.state.data.length === 0 ?
              <Button type="primary" disabled style={{marginLeft:'10px'}} onClick={this.showModal}>批量设置分值</Button>
            :
              <Button type="primary" style={{marginLeft:'10px'}}>批量设置分值</Button>
          }

        </div>
        {
          this.state.data.length === 0 ?
            <div className="examnodata">
              <img src={none} style={{display:'block',width:'167px',height:'auto',margin:'42px auto 10px auto'}} />
              <p style={{textAlign:'center'}}>暂无数据</p>
            </div>
          :

            <Table
              columns={columns}
              dataSource={this.state.data}
              components={this.components}
              pagination={false}
              bordered
              className="editExam"
              size="small"
              onRow={(record, index) => ({
                index,
                moveRow: this.moveRow,
              })}
            />

        }


        <SelectQuestion
            selectQuestionList={this.state.selectQuestionList}
            setFixedList={this.setFixedList}
            paperType="fixed" // random || fixed
        />


      </div>
    );
  }
}

const MoveTable = DragDropContext(HTML5Backend)(DragSortingTable);

export default MoveTable