import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Button, Pagination, Select, message, Modal, Tabs } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import axios from 'axios';
import './index.scss';
import $ from "jquery";
import none from "../../assets/images/none.png";

const TabPane = Tabs.TabPane;

class ManageStudentContainer extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
  }

  state = {
    list: [],
    loading: false,
    pageCurrent: 1,
    pageTotal: 1,
    pageSize: 10,
    search: '',
    tab: '1',
    visible: false,
    /* 弹框 */
    record: null,
    timestamp_now: null,
    timestamp_start: null,
    timestamp_end: null,
  }

  componentDidMount() {
    const tab = window.location.href.split('?tab=')[1];
    this.setState({
      tab: tab ? tab + '' : '1',
    }, () => {
      this.getList();
    })
  }

  // 1.1 获取试卷列表
  getList = () => {
    // status 未开考/已开考
    this.setState({
      list: [
        {
          id: 1,
          name: '商务谈判技巧',
          creator: '张明明',
          start_time: '2018/09/20 11:08',
          end_time: '2018/09/22 12:14',
          consume: '180分钟',
          total_grade: 120,
          passing_grade: 60,
          grade: '',
          is_start: false,
          count: 20,
          description: '试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明'
        }
      ]
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

  // 1.5 tab变更
  tabsChange = (key) => {
    this.setState({
      pageCurrent: 1,
      search: '',
      pageSize: 10,
      tab: key,
    }, () => {
      this.getList();
    });
    this.props.history.push('/student_manage?tab=' + key);
  }

  // 2. 考试详情Modal
  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      timestamp_start: Date.parse(new Date(record.start_time)),
      timestamp_end: Date.parse(new Date(record.end_time)),
      timestamp_now: Date.parse(new Date())
    })

    // 设置倒计时
    this.timer = setInterval(() => {
      this.setState({
        timestamp_now: Date.parse(new Date())
      })
    }, 1000)
  }

  hideModal = () => {
    this.setState({
      visible: false,
    });
    clearInterval(this.timer);
  }

  goToPaper = () => {
    // 前往答卷
  }

  // 倒计时
  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  render() {
    const columns = [
      {
        title: '考试任务',
        dataIndex: 'name',
        width: '32.4%',
        render: (text, record) => (
          <span>
            {
              record.is_start ?
                <span className="text-link" onClick={this.goToPaper}>{text}</span>
                :
                <span className="text-link" onClick={this.showModal.bind(this, record)}> {text}</span>
            }
          </span>
        )
      }, {
        title: '发布者',
        dataIndex: 'creator',
        width: '10%',
      }, {
        title: '考试期限',
        dataIndex: 'time',
        width: '30.3%',
        render: (text, record) => {
          return <span>{record.start_time + ' ~ ' + record.end_time}</span>
        }
      }, {
        title: '时长',
        dataIndex: 'consume',
        width: '6.8%',
      }, {
        title: '总分',
        dataIndex: 'total_grade',
        width: '6.7%',
      }, {
        title: '及格线',
        dataIndex: 'passing_grade',
        width: '6.8%',
      }, {
        title: '成绩',
        dataIndex: 'grade',
        width: '6.8%',
      }
    ];

    const beforeStart = this.state.timestamp_start - this.state.timestamp_now;
    const beforeEnd = this.state.timestamp_end - this.state.timestamp_now;
    return (
      <div style={{ width: '100%' }}>
        <Breadcrumb>
          <Breadcrumb.Item href="/#/student">
            <Icon type="home" theme="outlined" style={{ fontSize: '14px', marginRight: '2px' }} />
            <span>首页</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe62e;</i>
            <span>我的考试</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <h1 style={{ margin: '25px 0 15px', fontSize: '16px' }}>我的考试</h1>
        <Tabs activeKey={this.state.tab} onChange={this.tabsChange}>
          <TabPane tab="考试中(2)" key="1"></TabPane>
          <TabPane tab="即将开始(1)" key="2"></TabPane>
          <TabPane tab="已结束(27)" key="3"></TabPane>
          <TabPane tab="全部(30)" key="4"></TabPane>
        </Tabs>
        <Table
          columns={columns}
          dataSource={this.state.list}
          bordered
          pagination={false}
          size="small"
          loading={this.state.loading}
          rowKey="id"
          title={() =>
            <div>
              <Input
                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入考试任务搜索"
                style={{ width: '200px', position: 'relative', top: '1px' }}
                onChange={this.onChangeSearch}
              />
            </div>
          }
          locale={{ emptyText: <div style={{ marginBottom: '100px' }}><img src={none} style={{ width: '125px', margin: '60px 0 20px' }} alt="" /><div>暂无记录</div></div> }}
        />
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
        <Modal
          title="考试详情"
          visible={this.state.visible}
          onCancel={this.hideModal}
          width="680px"
          footer={
            (() => {
              if (beforeStart > 0) {
                // 按钮 - 确定
                return <Button type="primary" onClick={this.hideModal}>确定</Button>;

              } else if (beforeEnd > 0) {
                // 按钮 - 暂不考试, 开始考试
                return (
                  <div>
                    <Button onClick={this.hideModal}>暂不考试</Button>
                    <Button type="primary">开始考试</Button>
                  </div>
                )

              } else {
                // 按钮 - 查看试卷
                return <Button type="primary">查看试卷</Button>
              }
            })()
          }
        >
          <div className="student-modal">
            <h1>商务管理基础知识</h1>
            <p>
              <span>共20题</span>
              <span>试卷总分: 100分</span>
              <span>及格分: 60分</span>
            </p>
            <p>
              <span>考试期限: 2016/06/02 10:00 ~ 2017/09-09 10:00</span>
              <span>答卷时间: 30分钟</span>
            </p>
            <p className="description">试卷说明：试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明试卷说明</p>
            <div style={{ padding: '30px 0 20px' }}>
              {
                (() => {
                  if (beforeStart > 30 * 24 * 3600 * 1000) {
                    // 距离考试开始还有30天
                    return (
                      <div className="count">
                        <p>距离考试开始还有</p>
                        <span className="count-black">大于<span style={{ fontSize: '18px', padding: '0 8px' }}>30</span>天</span>
                      </div>
                    )

                  } else if (beforeStart > 24 * 3600 * 1000) {
                    // 距离考试还有 1天 - 30天
                    const days = parseInt(beforeStart / 1000 / 60 / 60 / 24, 10);
                    return (
                      <div className="count">
                        <p>距离考试开始还有</p>
                        <span className="count-black"><span style={{ fontSize: '18px', padding: '0 8px' }}>{days}</span>天</span>
                      </div>
                    )
                  } else if (beforeStart > 0) {
                    // 距离考试还有 0 - 1天
                    let countStyle = { padding: '0 10px 0 12px' };
                    const hours = parseInt(beforeStart / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
                    const minutes = parseInt(beforeStart / 1000 / 60 % 60, 10);//计算剩余的分钟
                    const seconds = parseInt(beforeStart / 1000 % 60, 10);//计算剩余的秒数


                    if (beforeStart < 10 * 60 * 1000) {
                      // 距离考试还有 0 - 10分钟, 颜色变更
                      countStyle.background = '#95cd5b';
                      countStyle.color = '#fff';
                    }

                    return (
                      <div className="count">
                        <p>距离考试开始还有</p>
                        <span className="count-black" style={countStyle}>
                          <span style={{ fontSize: '18px', padding: '0 5px 0 0' }}>{this.checkTime(hours)}</span>时
                        </span>
                        <span className="count-black" style={countStyle}>
                          <span style={{ fontSize: '18px', padding: '0 5px 0 0' }}>{this.checkTime(minutes)}</span>分
                        </span>
                        <span className="count-black" style={countStyle}>
                          <span style={{ fontSize: '18px', padding: '0 5px 0 0' }}>{this.checkTime(seconds)}</span>秒
                        </span>
                      </div>
                    )
                  } else if (beforeEnd > 10 * 60 * 1000) {
                    // 距离考试结束 大于10分钟
                    return (
                      <div style={{ fontSize: '16px' }}>考试已开始</div>
                    )
                  } else if (beforeEnd > 0) {
                    // 距离考试结束 0 - 10分钟
                    let minutes = parseInt(beforeEnd / 1000 / 60 % 60, 10);
                    if (minutes === 0) {
                      minutes = 1;
                    }
                    return (
                      <div>
                        <p style={{ fontSize: '16px' }}>考试已开始</p>
                        <p>本场考试将于<span style={{ color: '#f5222d' }}>{minutes}分钟</span>后结束！系统将在10分钟后自动交卷，请合理安排答题进度。</p>
                      </div>
                    )
                  } else {
                    // 考试已结束
                    return (
                      <p style={{ fontSize: '16px' }}>
                        考试已结束<br />
                        系统已自动交卷
                      </p>
                    )
                  }
                })()
              }
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}


export default class ManageStudent extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  }

  componentDidMount() {
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px' }
    return (
      <div>
        <Header />
        <div className="container container_student" style={containerHeight}>
          <ManageStudentContainer history={this.props.history} />
        </div>
        <Footer />
      </div>
    );
  }
}