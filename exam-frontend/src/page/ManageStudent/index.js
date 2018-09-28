import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Button, Pagination, Select, message, Modal, Tabs } from 'antd';
import Footer from '../../components/Footer';
import HeaderStudent from '../../components/HeaderStudent';
import axios from 'axios';
import './index.scss';
import $ from "jquery";
import none from "../../assets/images/none.png";

const TabPane = Tabs.TabPane;

class ManageStudentContainer extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.searchAjax = null;
  }

  state = {
    list: [],
    loading: false,
    pageCurrent: 1,
    pageTotal: 1,
    pageSize: 10,
    search: '',
    task_state: 'started',
    visible: false,
    /* tab总数 */
    started: '',
    finished: '',
    pending: '',
    all_count: '',
    /* 弹框 */
    record: {
      exam_task: {},
    },
    timestamp_now: null,
    timestamp_start: null,
    timestamp_end: null,
  }

  componentDidMount() {
    const tab = window.location.href.split('?tab=')[1];
    this.setState({
      tab: tab ? tab + '' : 'started',
    }, () => {
      this.getList();
    })
  }

  // 1.1 获取试卷列表
  getList = () => {
    const { task_state, pageCurrent, pageSize, search } = this.state;
    const CancelToken = axios.CancelToken;
    const that = this;

    if (this.searchAjax) {
      this.searchAjax();
    }

    clearInterval(this.timer);
    this.setState({
      loading: true,
    }, () => {
      axios.get('/api/my_exam/my_exam/', {
        params: {
          task_state,
          search,
          page: pageCurrent,
          page_size: pageSize,
        },
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.searchAjax = c
        })
      }).then((response) => {
        const res = response.data;

        if (res.status === 0){
          this.setState({
            list: res.data.results,
            started: res.data.started,
            finished: res.data.finished,
            pending: res.data.pending,
            all_count: res.data.all_count,
            pageTotal: res.data.count,
            timestamp_now: Date.parse(new Date(res.data.current_time)),
            loading: false,
          }, () => {
            clearInterval(this.timer);
            // 设置倒计时
            this.timer = setInterval(() => {
              this.setState({
                timestamp_now: this.state.timestamp_now - 1000
              })
            }, 1000)
          });
        } else {
          message.error('请求失败')
        }
      })
      .catch((error) => {
        that.setState({
          loading: false,
        })
      });
    })
  }

  componentWillUnmount() {
    clearInterval(this.timer)
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
      task_state: key,
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
      timestamp_start: Date.parse(new Date(record.exam_task.period_start)),
      timestamp_end: Date.parse(new Date(record.exam_task.period_end)),
    })
  }

  hideModal = () => {
    this.setState({
      visible: false,
    });
    clearInterval(this.timer);
  }



  // 倒计时
  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  // 开始考试
  startExam = () =>{
    axios.post('/api/my_exam/my_exam/', {'participant_id' : this.state.record.id})
      .then((response) => {
        const res = response.data;
        if (res.status === 0){
         window.location.href = '/#/exam/' + this.state.record.id;
        } else {
          message.error('请求失败')
        }
      })
      .catch((error) => {
        message.error('请求失败')
      });
  }

  // 查看试卷
  goToPaper = (participant_id) => {
    window.location.href = "/#/exam/" + participant_id;
  }

  render() {
    const columns = [
      {
        title: '考试任务',
        dataIndex: 'exam_task.name',
        width: '32.4%',
        render: (text, record) => (
          <span>
            {
              record.exam_result === 'pending' ?
                <span className="text-link" onClick={this.showModal.bind(this, record)}> {text}</span>
              :
                <span className="text-link" onClick={this.goToPaper.bind(this, record.participant_id)}>{text}</span>

            }
          </span>
        )
      }, {
        title: '发布者',
        dataIndex: 'exam_task.creator',
        width: '10%',
      }, {
        title: '考试期限',
        dataIndex: 'exam_task.period_start',
        width: '30.3%',
        render: (text, record) => {
          return <span>{record.exam_task.period_start + ' ~ ' + record.exam_task.period_end}</span>
        }
      }, {
        title: '时长',
        dataIndex: 'exam_task.exam_time_limit',
        width: '6.8%',
        render: (text) => {
          return <span>{ text }分钟</span>
        }
      }, {
        title: '总分',
        dataIndex: 'exam_task.exampaper_total_grade',
        width: '6.7%',
      }, {
        title: '及格线',
        dataIndex: 'exam_task.exampaper_passing_ratio',
        width: '6.8%',
      }, {
        title: '成绩',
        dataIndex: 'total_grade',
        width: '6.8%',
        render: (text, record) => {
          return <span>{ record.task_state === 'finished' ? text : '--'}</span>
        }
      }
    ];

    const beforeStart = this.state.timestamp_start - this.state.timestamp_now;
    const beforeEnd = this.state.timestamp_end - this.state.timestamp_now;
    const { started, finished, pending, all_count } = this.state;
    const { exam_task } = this.state.record;
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
        <Tabs activeKey={this.state.task_state} onChange={this.tabsChange}>
          <TabPane tab={'考试中(' + started + ')'} key="started"></TabPane>
          <TabPane tab={'即将开始(' + pending + ')'} key="pending"></TabPane>
          <TabPane tab={'已结束(' + finished + ')'} key="finished"></TabPane>
          <TabPane tab={'全部(' + all_count + ')'} key=""></TabPane>
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
                    <Button type="primary" onClick={this.startExam}>开始考试</Button>
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
            <h1>{ exam_task.name }</h1>
            <p>
              <span>共{ exam_task.exampaper_total_problem_num }题</span>
              <span>试卷总分: { exam_task.exampaper_total_grade }分</span>
              <span>及格分: { exam_task.exampaper_passing_ratio }分</span>
            </p>
            <p>
              <span>考试期限: { exam_task.period_start } ~ { exam_task.period_end }</span>
              <span>答卷时间: { exam_task.exam_time_limit }分钟</span>
            </p>
            <p className="description">试卷说明：{ exam_task.exampaper_description }</p>
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
        <HeaderStudent />
        <div className="container container_student" style={containerHeight}>
          <ManageStudentContainer history={this.props.history} />
        </div>
        <Footer />
      </div>
    );
  }
}