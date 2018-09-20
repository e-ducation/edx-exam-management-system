import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Pagination, Select, message, Modal, Tabs } from 'antd';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import './index.scss';
import none from "../../assets/images/none.png";
const TabPane = Tabs.TabPane;
class StatisticsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.searchAjax = null;
  }

  state = {
    loading: true,
    visible: false,
    list: [
      { name: '王铭业', phone: '13184821132', email: '13498655697@qq.com', result: '及格', grade: '100' },
      { name: '陈嘉琪', phone: '13184821132', email: '13498655697@qq.com', result: '不及格', grade: '59' },
      { name: '陈嘉琪', phone: '13184821132', email: '13498655697@qq.com', result: '待考', grade: '100' }
    ],
    pageCurrent: 1,
    pageTotal: 0,
    pageSize: 10,
    search: '',
    allPaper: '',
    key: 1,
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
      axios.get('/api/exampapers/?search=' + search + '&page=' + pageCurrent + '&page_size=' + pageSize, {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.searchAjax = c
        })
      }).then(function (response) {
        const res = response.data;
        if (res.status === 0) {
          // 给list添加key
          let list = res.data.results;
          for (let i = 0; i < list.length; i++) {
            list[i].key = i;
          }
          that.setState({
            list,
            pageTotal: res.data.count,
            loading: false,
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
          // message.error('请求失败')
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


  // 3. 预览试卷
  previewPaper = (id) => {
    window.open("/#/preview/" + id)
  }

  // 4. 复制试卷
  copyPaper = (id) => {
    const that = this;
    axios.post('/api/exampapers/' + id + '/duplicate/')
      .then(function (response) {
        const res = response.data;
        if (res.status === 0) {
          that.getList();
        } else {
          message.error('复制失败');
        }

      })
      .catch(function (error) {
        message.error('复制失败')
      });
  }

  // 5. 删除试卷
  deletePaper = (id) => {
    const that = this;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: 'confirm-red',
      title: '提示',
      content: '确定删除此试卷？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 删除试卷
        axios.delete('./api/exampapers/' + id + '/')
          .then(function (response) {
            const res = response.data;
            if (res.status === 0) {
              message.success('删除成功');
              that.getList();
            } else {
              message.error('删除失败');
            }

          })
          .catch(function (error) {
            message.error('删除失败')
          });
      }
    });
  }

  // 6. 编辑试卷
  editPaper = (id) => {
    //window.location.href = '/#/edit/' + id;
  }

  // 7. 切换tab栏
  callback = (key) => {
    this.setState({
      key
    })
  }


  statisticsUrl = (id) => {
    window.open('/#/preview/statistics/' + id + '');
  }
  render() {
    // 列表头


    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        width: '10%',
        render: (text, record) => (
          <span>
            {
              record.create_type === 'fixed' ?
                <span onClick={this.previewPaper.bind(this, record.id)} className="text-link">{text}</span>
                :
                <span>{text}</span>
            }
          </span>

        )
      }, {
        title: '电话',
        dataIndex: 'phone',
        width: '15%',
      }, {
        title: '邮箱',
        dataIndex: 'email',
        width: '19%',
      }, {
        title: '考试结果',
        dataIndex: 'result',
        width: '14%',
        render: (text, record) => (
          <span>
            {
              (
                () => {
                  if (record.result == "及格") {
                    return (
                      <span style={{ color: '#94d055' }}>及格</span>
                    )
                  }
                  else if (record.result == "不及格") {
                    return (
                      <span style={{ color: '#f4323c' }}>不及格</span>
                    )
                  }
                  else {
                    return (
                      <span>待审查</span>
                    )
                  }
                }
              )()
            }
          </span>
        )
      }, {
        title: '考试分数',
        dataIndex: 'grade',
        width: '13%',
      }, {
        title: '操作',
        dataIndex: 'id',
        width: '14%',
        render: (text, record, index) => (
          <span className="statistics-icon">
            {
              (
                () => {
                  if (record.result == "待考") {
                    return (<i className="iconfont nohoverstatus" style={{ fontSize: '16px', marginRight: '14px', cursor: 'pointer' }}>&#xe66d;</i>)
                  }
                  else {
                    return (
                      <Tooltip title="查看答卷">
                        <i className="iconfont hashoverstatus" style={{ fontSize: '16px', marginRight: '14px', cursor: 'pointer' }} onClick={this.statisticsUrl.bind(this, record.id)}>&#xe66d;</i>
                      </Tooltip>
                    )
                  }
                }
              )()
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
          <div style={{ overflow: 'hidden' }}>
            <p style={{ float: 'left', marginTop: '6px' }}>
              <span>考试名称：商务知识管理</span>
              <span>及格线：60分（固定试卷）</span>
            </p>
            <Input
              prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入姓名/电话/邮箱"
              style={{ width: '200px', marginLeft: '10px', float: 'right' }}
              onChange={this.onChangeSearch}
            />
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
            <Breadcrumb.Item href="/#/task/">
              <i className="iconfont" style={{ fontSize: '12px', marginRight: '8px' }}>&#xe66b;</i>
              <span>考试任务</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <i className="iconfont" style={{ fontSize: '16px', marginRight: '8px', cursor: 'pointer' }}>&#xe642;</i>
              <span>统计考试任务</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ margin: '25px 0 10px', fontSize: '16px' }}>考试任务</h1>
          <Tabs defaultActiveKey="1" onChange={this.callback} >
            <TabPane tab={<span>应考人数（{this.state.pageSize}）</span>} key="1">{textTask}</TabPane>
            <TabPane tab={<span>待考人数（{this.state.pageSize}）</span>} key="2">{textTask}</TabPane>
            <TabPane tab={<span>合格人数（{this.state.pageSize}）</span>} key="3">{textTask}</TabPane>
            <TabPane tab={<span>不及格人数（{this.state.pageSize}）</span>} key="4">{textTask}</TabPane>
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


export default StatisticsContainer;