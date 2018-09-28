import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Button, Pagination, Select, message, Modal, Tabs } from 'antd';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import './index.scss';
import none from "../../assets/images/none.png";
const TabPane = Tabs.TabPane;

export default class TextTask extends React.Component {
  constructor(props) {
    super(props);
    this.searchAjax = null;
  }

  state = {
    loading: true,
    visible: false,
    list: [
      { status: '未开始', name: '这是试卷01', create_name: '王铭业', start_time: '2018/08/01 9:00', end_time: '2018/08/01 11:30', number: '30' },
      { status: '考试中', name: '这是试卷01', create_name: '王铭业', start_time: '2018/08/01 9:00', end_time: '2018/08/01 11:30', number: '30' }
    ],
    pageCurrent: 1,
    pageTotal: 0,
    pageSize: 10,
    search: '',
    allPaper: '',
    key: 'all',
    all: '0',
    pending: '0',
    started: '0',
    finished: '0'
  }


  componentDidMount() {
    this.getList();
  }

  // 1.1 试卷列表
  getList = () => {
    const { pageCurrent, pageSize, search, key } = this.state;
    const that = this;
    const CancelToken = axios.CancelToken;
    if (this.searchAjax) {
      this.searchAjax();
    }

    this.setState({
      loading: true,
    }, () => {
      var url = "";
      //状态的改变
      if (key === 'all') {
        url = '/api/examtasks/?search=' + search + '&page=' + pageCurrent + '&page_size=' + pageSize;
      }
      else {
        url = '/api/examtasks/?search=' + search + '&task_state=' + key + '&page=' + pageCurrent + '&page_size=' + pageSize;
      }

      axios.get(url, {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.searchAjax = c
        })
      }).then(function (response) {
        const res = response.data;

        if (res.status === 0) {
          let list = res.data.results;
          that.setState({
            list,
            pageTotal: res.data.count,
            loading: false,
            all: res.data.count,
            pending: res.data.pending,
            started: res.data.started,
            finished: res.data.finished
          })

        } else {
          message.error('请求失败')
          that.setState({
            loading: false,
          })
        }
      })
        .catch(function (error) {
          that.setState({
            loading: false,
          })
        });
    })

  }

  // 1.2 试卷列表页码变更
  handlePageChange = (e) => {
    this.setState({
      pageCurrent: e,
    }, () => {
      this.getList();
    })
  }

  // 1.3 试卷列表每页显示变更
  handlePageSizeChange = (e) => {
    this.setState({
      pageSize: e,
      pageCurrent: 1,
    }, () => {
      this.getList();
    })
  }

  // 1.4 搜索试卷
  onChangeSearch = (e) => {
    this.setState({
      pageSize: this.state.pageSize,
      pageCurrent: 1,
      search: e.target.value,
    }, () => {
      this.getList();
    })
  }


  // 3. 预览试卷详情
  previewPaper = (id) => {
    //window.open("/#/task/" + id);
    window.location.href = '/#/task/' + id;
  }

  // 4. 统计试卷
  statisticsPaper = (id) => {
    window.location.href = '/#/statistics/' + id;
  }

  // 5. 删除试卷
  deletePaper = (id) => {

    Modal.confirm({
      iconType: 'exclamation-circle',
      className: 'confirm-red',
      title: '您确定要删除考试任务？',
      content: '已经结束的考试任务删除后将无法恢复',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 删除试卷
        axios.delete('/api/examtasks/' + id + '/')
          .then((response) => {

            const res = response.data;
            message.success('删除成功');
            this.getList();

            // if (res.status === 0) {
            //   message.success('删除成功');
            //
            // } else {
            //   message.error('删除失败');
            // }

          })
          .catch((error) => {
            message.error('删除失败')
          });
      }
    });
  }

  // 6. 编辑试卷
  editPaper = (id) => {
    window.location.href = '/#/task/' + id;
  }

  // 7. 切换tab栏
  callback = (key) => {

    this.setState({
      key
    }, () => {
      this.getList();
    });
  }


  render() {
    // 列表头

    const columns = [
      {
        title: '状态',
        dataIndex: 'task_state',
        width: '10%',
        render: (text, record) => (
          <span>

            {
              (() => {
                switch (record.task_state) {
                  case 'pending':
                    return '未开始';
                  case 'started':
                    return '考试中';
                  case 'finished':
                    return '已结束';
                  default:
                    return '不可用';
                }
              })()
            }
          </span>

        )
      }, {
        title: '考试任务名称',
        dataIndex: 'name',
        width: '26%',
        render: (text, record) => (
          <span onClick={this.previewPaper.bind(this, record.id)} className="text-link">{text}</span>
        )
      }, {
        title: '创建人',
        dataIndex: 'creator',
        width: '10%',
      }, {
        title: '开始时间',
        dataIndex: 'period_start',
        width: '16%',
      }, {
        title: '结束时间',
        dataIndex: 'period_end',
        width: '16%',
      }, {
        title: '考生人数',
        dataIndex: 'participant_num',
        width: '9%',
      }, {
        title: '操作',
        dataIndex: 'id',
        width: '14%',
        render: (text, record, index) => (
          <span>
            {
              record.task_state == "started" ?
                <span className="diaplayIcon">
                  <Icon disabled type="edit" className="icon-blue" style={{ fontSize: '16px', marginRight: '16px', cursor: 'not-allowed' }} />

                  <i className="iconfont" style={{ fontSize: '16px', marginRight: '14px', cursor: 'not-allowed' }}>&#xe642;</i>

                  <Icon disabled type="delete" className="icon-red" style={{ fontSize: '16px', cursor: 'not-allowed' }} />
                </span>
                :
                <span className="textIconGroup">
                  <Tooltip title="编辑">
                    <Icon type="edit" className="icon-blue" style={{ fontSize: '16px', marginRight: '16px' }} onClick={this.editPaper.bind(this, record.id)} />
                  </Tooltip>
                  <Tooltip title="统计">
                    <i className="iconfont" style={{ fontSize: '16px', marginRight: '14px', cursor: 'pointer' }} onClick={this.statisticsPaper.bind(this, record.id)}>&#xe642;</i>
                  </Tooltip>
                  <Tooltip title="删除">
                    <Icon type="delete" className="icon-red" style={{ fontSize: '16px' }} onClick={this.deletePaper.bind(this, record.id)} />
                  </Tooltip>
                </span>
            }
          </span>

        )
      }
    ];


    // 表格
    const textTask = (

      <Table
        columns={columns}
        dataSource={this.state.list}
        bordered
        pagination={false}
        size="small"
        loading={this.state.loading}
        title={() =>
          <div>
            <Button type="primary" href="/#/createTask"><i className="iconfont" style={{ fontSize: '12px', marginRight: '8px' }}>&#xe66b;</i>新建考试任务</Button>

            {
              this.state.list.length < 1 ?
                <Input
                  prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="输入考试任务名称搜索"
                  style={{ width: '200px', marginLeft: '20px', position: 'relative', top: '1px' }}
                  onChange={this.onChangeSearch}
                />
                :
                <Input
                  prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="输入考试任务名称搜索"
                  style={{ width: '200px', marginLeft: '20px', position: 'relative', top: '1px' }}
                  onChange={this.onChangeSearch}
                />
            }
          </div>
        }
        locale={{ emptyText: <div style={{ marginBottom: '100px' }}><img src={none} style={{ width: '125px', margin: '60px 0 20px' }} alt="" /><div>暂无试卷</div></div> }}
      />
    )
    return (
      <div className="displayFlx">
        <Sidebar active="task" />
        <div className="text-right-left">
          <Breadcrumb>
            <Breadcrumb.Item href="/#/">
              <Icon type="home" theme="outlined" style={{ fontSize: '14px', marginRight: '2px' }} />
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <i className="iconfont" style={{ fontSize: '12px', marginRight: '8px' }}>&#xe66b;</i>
              <span>考试管理</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ margin: '25px 0 20px', fontSize: '16px' }}>考试任务</h1>
          <Tabs defaultActiveKey={this.state.key} onChange={this.callback}>
            <TabPane tab={<span>全部（{this.state.all}）</span>} key="all">{textTask}</TabPane>
            <TabPane tab={<span>未开始（{this.state.pending}）</span>} key="pending">{textTask}</TabPane>
            <TabPane tab={<span>考试中（{this.state.started}）</span>} key="started">{textTask}</TabPane>
            <TabPane tab={<span>已结束（{this.state.finished}）</span>} key="finished">{textTask}</TabPane>
          </Tabs>


          {
            this.state.list.length === 0 ?
              null
              :
              <div className="page">
                <span className="page-total">共{this.state.pageTotal}条记录</span>
                <Pagination
                  size="small"
                  current={this.state.pageCurrent}
                  total={this.state.pageTotal}
                  onChange={this.handlePageChange}
                  pageSize={this.state.pageSize}
                  className="page-num"
                />
                <span className="page-size">
                  每页显示
                  <Select defaultValue="10" size="small" onChange={this.handlePageSizeChange} style={{ margin: '0 5px' }}>
                    <Select.Option value="10">10</Select.Option>
                    <Select.Option value="20">20</Select.Option>
                    <Select.Option value="30">30</Select.Option>
                    <Select.Option value="50">50</Select.Option>
                  </Select>
                  条
                </span>
              </div>
          }

        </div>

      </div>
    );
  }
}


