import React from 'react';
import { Input,Button,Table,Breadcrumb,Tooltip,Icon} from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import './index.scss';
import $ from "jquery";
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

const columns = [
  {
    width:'8.2%',
    title: '序号',
    dataIndex: 'index'
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
    render:(record)=>(
      <Tooltip title="删除">
        <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} />
      </Tooltip>
    )
  }
];

class DragSortingTable extends React.Component {
  state = {
    data: [{
      key: '1',
      index: '序号',
      subjectdec: 32,
      type: '1',
    }, {
      key: '2',
      index: 'Jim Green',
      subjectdec: 42,
      type: '1',
    }, {
      key: '3',
      index: 'Joe Black',
      subjectdec: 32,
      type: '1',
    }],
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
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
  }

  render() {
    return (
      <Table
        columns={columns}
        dataSource={this.state.data}
        components={this.components}
        pagination={false}
        bordered
        size="small"
        onRow={(record, index) => ({
          index,
          moveRow: this.moveRow,
        })}
      />
    );
  }
}

const MoveTable = DragDropContext(HTML5Backend)(DragSortingTable);


class EditContainer extends React.Component {
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
                <div style={{marginBottom:'10px'}}>
                  <Button type="primary">添加试题</Button>
                  <Button type="primary" style={{marginLeft:'10px'}}>批量设置分值</Button>
                </div>
                <MoveTable />

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
  }

  componentDidMount(){
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

    $(document.body).scroll(() => {
      this.setState({
        showShadow: ($(window).height() !== $(document).height()) && $(document.body).scrollTop() > 0
      })
    })
  }

  render() {
    const containerHeight = { minHeight: this.state.height - 180 + 'px'}
    return (
      <div>
        <Header showShadow={this.state.showShadow} />
        <div className="container" style={containerHeight}>
          <EditContainer />
        </div>
        <Footer />
      </div>
    );
  }
}