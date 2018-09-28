import React from 'react';
import { Button, Input, DatePicker, Switch, Modal, Icon, Table, Select, message } from 'antd';
import moment from 'moment';
import axios from 'axios';
import Paper from './paper';
import $ from 'jquery';
const { RangePicker } = DatePicker;
const gettext = (v) => {
  return v
}
const OptionList = (() => {
  const list = [];
  let current = 10;
  while (current <= 300) {
    list.push(current);
    current = current + 5
  }
  return list
})()
const Option = Select.Option;
export default class Preview extends React.Component {
  state = {
    paper: {},
    staff: {
      nomore: false,
      page: 0,
      search: '',
      chosen: [],
      visible: false,
      loading: true,
      list: [],
    },
    taskName: '',
    exam_time_limit: 10,
    period_start: '',
    period_end: '',
    participants: [],
    show_answer: false,
    problem_disorder: false,
    publishLoading: false,
    validate: {
      name: true,
      time: true,
      paper: true,
      participant: true,
      timeError: '',
    },
    modified: '',
  }
  componentWillMount() {
    const { task } = this.props;
    if (task.id !== undefined) {
      // const chosen = task.participants.map(item => item.participant_id)
      this.setState({
        taskName: task.name,
        exampaper_name: task.exampaper_name,
        show_answer: task.show_answer,
        problem_disorder: task.problem_disorder,
        participants: task.participants,
        exam_time_limit: task.exam_time_limit,
        period_start: task.period_start,
        period_end: task.period_end,
        modified: task.modified,
        paper: {
          create_type: task.exampaper_create_type,
          creator: "luoqingfu",
          id: task.exampaper,
          name: task.exampaper_name,
          passing_grade: (task.exampaper_total_grade * (task.exampaper_passing_ratio / 100)).toFixed(2),
          problem_statistic: task.problem_statistic,
          total_grade: task.exampaper_total_grade,
          total_problem_num: task.exampaper_total_problem_num,
        }
      })
    }
  }
  init = () => {

  }
  getList = () => {
    // this.getStaffList()
  }
  // 试卷选择弹窗
  showPaper = () => {
    this.paper.showPaper();
  }
  // 选择试卷
  selectPaper = (paper) => {
    const { validate } = this.state;
    validate.paper = true;
    this.setState({
      paper,
      validate,
    })
  }
  // 创建任务
  createTask = () => {
    const params = this.paramsInit();
    this.setState({
      publishLoading: true,
    })
    if (!this.checkAll()) {
      this.setState({
        publishLoading: false,
      })
      console.log('123123')
      return
    }
    // console.log()
    const that = this;
    axios.post('/api/examtasks/', params).then((response) => {
      console.log(response)
      if (response.data.status === 0) {
        message.success('创建成功')
        that.props.history.push('/task');
      } else {
        message.success('创建失败')
      }
      this.setState({
        publishLoading: false,
      })
    }).catch((err) => {
      console.log(err)
      this.setState({
        publishLoading: false,
      })
    })
  }
  // 修改保存考试任务
  saveTask = () => {
    this.setState({
      publishLoading: true,
    })
    if (!this.checkAll()) {
      this.setState({
        publishLoading: false,
      })
      console.log('123123')
      return
    }
    const params = this.paramsInit();
    const id = this.props.task.id;
    const that = this;
    axios.put(`/api/examtasks/${id}/`, params)
      .then((response) => {
        console.log(response)
        if (response.data.status === 0) {
          message.success('保存成功')
          that.props.history.push('/task');
        } else {
          message.success('保存失败')
        }
      })
      .catch((response) => {
        this.setState({
          publishLoading: false,
        })
      })
  }
  // 参数初始化
  paramsInit = () => {
    const { paper, participants, period_start, period_end, exam_time_limit, taskName, show_answer, problem_disorder } = this.state;
    const params = {
      name: taskName,
      exampaper: paper.id,
      exampaper_name: paper.name,
      exampaper_description: 'wating',
      exampaper_create_type: paper.create_type,
      exampaper_passing_ratio: (paper.passing_grade / paper.total_grade).toFixed(2) * 100,
      period_start,
      period_end,
      exam_time_limit,
      exampaper_total_problem_num: paper.total_problem_num,
      participants,
      show_answer,
      problem_disorder,
    }
    return params;
  }
  //
  checkAll = () => {
    const { validate, paper, taskName, participants, period_start } = this.state;
    if (validate.name) {
      validate.name = taskName.length > 0;
    }
    if (validate.time) {
      validate.time = period_start === '' ? false : true;
      validate.timeError = '考试周期不能为空'
    }
    if (validate.paper) {
      validate.paper = paper.id === undefined ? false : true;
    }
    if (validate.participant) {
      validate.participant = participants.length > 0;
    }
    return (validate.name && validate.time && validate.paper && validate.participant)
  }
  // 获取公司成员列表
  getStaffList = () => {
    const page = this.state.staff.page + 1;

    // 没有更多
    if (this.state.staff.nomore) {
      clearInterval(this.timer)
      return false;
    }

    // 加载第二页时，避免短时间内，重复请求同一页数据
    if (this.isGettingList && (page !== 1)) {
      return false;
    }

    this.isGettingList = true;
    const CancelToken = axios.CancelToken;
    const that = this;
    axios.get('/api/users/?search=' + this.state.staff.search + '&page=' + page + '&page_size=10', {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        that.searchajax = c
      })
    }).then((response) => {
      const res = response.data;
      // console.log(res)
      if (res.status === 0) {
        // 加载列表
        let arr = [];
        if (page === 1) {
          arr = res.data.results;
        } else {
          arr = this.state.staff.list.concat(res.data.results);
        }

        for (let i = 0; i < arr.length; i++) {
          arr[i].key = arr[i].user;
        }

        let { staff } = this.state;
        staff.list = arr;
        staff.loading = false;
        staff.page = this.state.staff.page + 1;
        res.data.next ? staff.nomore = false : staff.nomore = true;
        this.setState({
          staff
        }, () => {
          this.isGettingList = false;
        });

        // 判断需要下拉刷新,第一页加载完成，并且有下一页,设定计时器
        // console.log($('.staffModal .ant-table-body'), $('.staffModal .ant-table-row'))
        if (this.state.staff.page === 1 && res.data.next) {
          clearInterval(this.timer)
          this.timer = setInterval(() => {
            const { staff } = this.state;
            if (staff.loading === true) return;
            // if (staff.loading.loading == true)
            try {
              const parentElemBottom = $('.staffModal .ant-table-body')[0].getBoundingClientRect().bottom;
              const elems = $('.staffModal .ant-table-row');
              const elemBottom = elems[elems.length - 1].getBoundingClientRect().bottom;

              if (elemBottom - parentElemBottom < 150) {
                this.getStaffList();
              }
            } catch (err) {
              clearInterval(this.timer);
              console.log('error')
            }
          }, 2000)
        }

        // 如果已经有计时器，并nomore，消除计时器
        if (!res.data.next) {
          clearInterval(this.timer);
        }
      }
    })
      .catch((err) => {
        console.log(err)
      })
  }
  // 搜索人员
  onSearchChange = (e) => {
    if (this.searchajax) {
      this.searchajax();
    }
    this.setState({
      staff: {
        nomore: false,
        page: 0,
        search: e.target.value,
        chosen: [],
        visible: true,
        loading: true,
        list: [],
      }
    }, () => {
      this.getStaffList();
    })
  }
  // 按钮弹窗
  staffModal = () => {
    this.getStaffList();
    clearInterval(this.timer);
    this.setState({
      staff: {
        ...this.state.staff,
        visible: true,
      }
    })
  }
  // 选择参与人员确定选择
  handleOk = () => {
    const { staff, participants, validate } = this.state;
    const { list, chosen } = staff;
    const data = [];
    const exits = participants.map(item => item.username);
    console.log(chosen, exits)
    // eslint-disable-next-line
    list.map(item => {
      if (chosen.includes(item.username) && !exits.includes(item.username)) {
        data.push(item);
      }
    });
    staff.visible = false;
    // 验证
    if (participants.length === 0 && data.length === 0) {
      validate.participant = false;
    } else {
      validate.participant = true;
    }
    console.log(validate, participants, data)
    this.setState({
      staff,
      participants: [
        ...participants,
        ...data,
      ],
      validate,
    });
    clearInterval(this.timer);
  }
  handleCancel = () => {
    const { staff } = this.state;
    staff.visible = false;
    this.setState({
      staff,
    });
    clearInterval(this.timer);
  }
  getItem = () => {
    const { staff } = this.state;
    const { list } = staff;
    const data = {}
    list.map(item => data[item.id] = item);
    return data;
  }
  // 禁止时间
  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().startOf('day');
  }
  // 移除
  removeSelect = (username) => {
    console.log(username, 'remove');
    const { staff, participants, validate } = this.state;
    const { chosen } = staff;
    const newChosen = chosen.filter(x => x !== username)
    const newParticipants = participants.filter(x => x.username !== username);
    // console.log(newChosen, chosen)
    validate.participant = newParticipants.length > 0;
    this.setState({
      staff: {
        ...staff,
        chosen: newChosen,
      },
      participants: newParticipants,
      validate,
    })
  }
  // 周期长度
  timeHandleChange = (exam_time_limit) => {
    console.log(exam_time_limit);
    this.setState({
      exam_time_limit,
    })
  }
  // 周期长度
  rangeOnChange = (value) => {
    console.log(value);
    const { exam_time_limit, validate } = this.state;
    if (value.length === 0) {
      validate.time = false;
      validate.timeError = '考试周期不能为空';
      this.setState({
        period_start: '',
        period_end: '',
        validate,
      })
    } else {
      const time = value[1].valueOf() - value[0].valueOf();
      const min = time / 1000 / 60;
      if (min < exam_time_limit) {
        validate.timeError = '考试周期不能小于答卷时间';
        validate.time = false;
        console.log('error')
      } else if (min > 7 * 24 * 60) {
        validate.timeError = '考试周期不能大于7天';
        validate.time = false;
      } else {
        validate.time = true;
      }
      this.setState({
        period_start: value[0],
        period_end: value[1],
        validate,
      })
      console.log(time / 1000 / 60 / 60);
    }

  }
  // 考试任务名称
  nameOnChange = (e) => {
    const { validate } = this.state;
    const taskName = e.target.value;
    // if (taskName.length <= 0 ) validate.name = false;
    validate.name = taskName.length <= 0 ? false : true;
    this.setState({
      taskName,
      validate,
    })
    // console.log(e.target.value)
  }
  render() {
    const { paper, participants, validate } = this.state;
    const { create } = this.props;
    const problem_statistic = paper.problem_statistic || {};
    console.log(create)
    // 所有员工 - 列表头
    const staffColumns = [
      {
        title: gettext('Legal Name'),
        dataIndex: 'username',
        width: '16.54%',
        render: (text) => {
          return text || '--';
        },
      }, {
        title: gettext('E-mail'),
        dataIndex: 'email',
        width: '25.17%',
        render: (text) => {
          return text || '--';
        },
      }, {
        title: gettext('Mobile'),
        dataIndex: 'phone',
        width: '20.86%',
        render: (text) => {
          return text || '--';
        },
      }, {
        title: gettext('Department'),
        dataIndex: 'department',
        width: '37.41%',
        render: (text) => {
          return text || '--';
        },
      }
    ];
    const rowSelection = {
      // selectedRowKeys: staff.chosen,
      onChange: (selectedRowKeys, selectedRows) => {
        let { staff } = this.state;
        staff.chosen = selectedRowKeys;
        console.log(selectedRows);
        this.setState({
          staff,
        });
      },
      getCheckboxProps: (record) => {
        return ({
          disabled: participants.map(item => item.username).includes(record.username),
        })
      }
    };
    return (
      <div className="task-content">
        {
          // paper.id &&
          <Paper selectPaper={this.selectPaper} value={paper.id} ref={(node) => { this.paper = node; }} />
        }
        <div className="task-row">
          <div className="task-label">
            已选试卷*
          </div>
          <div className="task-item">
            {
              paper.id !== undefined ?

                <div>
                  <div>
                    <span className="test-title">{paper.name}</span>
                    <div style={{ position: 'absolute', display: 'inline-block' }}>
                      <Button onClick={this.showPaper} style={{ position: "absolute", top: '-10px', marginLeft: '20px' }}>
                        <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe66d;</i>
                        更换试卷
                      </Button>
                      {
                        this.props.task .id!== undefined &&
                        <Button style={{ position: "absolute", top: '-10px', marginLeft: '140px' }} type="primary">
                          <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe62f;</i>
                          预览试卷
                      </Button>
                      }
                    </div>
                  </div>
                  <div className="paper-info">
                    {
                      this.state.modified !== '' &&
                      `此试卷为快照，保存于${moment(this.state.modified).format('YYYY年MM月DD日')}`
                    }

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
                      <span className="number">{problem_statistic.multiplechoiceresponse_count}</span>
                      <span className="number">{problem_statistic.choiceresponse_count}</span>
                      <span className="number">{problem_statistic.stringresponse_count}</span>
                      <span className="number">{paper.total_problem_num}</span>
                    </div>
                    <div className="total-block">
                      <span className="first-span">分数</span>
                      <span className="number">{problem_statistic.multiplechoiceresponse_grade || 0}</span>
                      <span className="number">{problem_statistic.choiceresponse_grade || 0}</span>
                      <span className="number">{problem_statistic.stringresponse_grade || 0}</span>
                      <span className="number">{paper.total_grade || 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    {
                      <span>及格线： {(paper.passing_grade / paper.total_grade).toFixed(2) * 100}%</span>
                    }
                  </div>
                </div>
                :
                <div>
                  <Button onClick={this.showPaper} style={{ position: "absolute", top: '-10px' }} type="primary">
                    <i className="iconfont" style={{ fontSize: '14px', marginRight: '5px' }}>&#xe62f;</i>
                    添加试卷
                  </Button>
                  <div style={{ marginTop: ' 25px' }} className="task-item error-tips">
                    {
                      validate.paper === false &&
                      '请选择考试试卷'
                    }
                  </div>
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
        <div className="task-row input-item">
          <div className="task-label ">
            考试名称
          </div>
          <div className="task-item">
            <Input value={this.state.taskName} onChange={this.nameOnChange} maxLength={50} style={{ width: '350px' }} placeholder="输入试卷名称，限定50字符" />
            <div className="task-item error-tips">
              {
                validate.name === false &&
                '请输入考试任务名称'
              }
            </div>
          </div>
        </div>
        <div className="task-row input-item">
          <div className="task-label">
            考试周期
          </div>
          <div className="task-item">
            <RangePicker
              disabledDate={this.disabledDate}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              onChange={this.rangeOnChange}
              value={this.state.period_start ? [moment(this.state.period_start), moment(this.state.period_end)] : []}
            // format={dateFormat}
            />
            <div className="task-item error-tips">
              {
                validate.time === false &&
                validate.timeError
                // <span>
                //   {
                //     this.state.period_start == '' ?
                //     '请选择开始与结束时间'
                //     :
                //     '考试周期要大于答卷时间'
                //   }
                // </span>

              }
            </div>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label input-item">
            答卷时间
          </div>
          <div className="task-item">
            <Select defaultValue={this.state.exam_time_limit} style={{ width: 83, marginRight: '10px' }} onChange={this.timeHandleChange}>
              {
                OptionList.map(key => {
                  return <Option key={key} value={key}>{key}</Option>
                })
              }
            </Select>
            <span>分钟</span>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            参与人员
          </div>
          <div className="task-item">
            <div style={{ height: participants.length !== 0 ? '40px' : '20px' }}>
              <Button onClick={this.staffModal} style={{ position: 'absolute', top: '-6px', color: '#0692e1', borderColor: '#0692e1' }} icon="plus-square" >人员</Button>
            </div>
            {
              participants.length !== 0 &&
              <div className="staff-container">
                {
                  participants.map(item => {
                    return (
                      <span key={item.username} className="staff-block">{item.username} <Icon onClick={this.removeSelect.bind(this, item.username)} style={{ cursor: 'pointer' }} type="close" theme="outlined" /></span>
                    )
                  })
                  // (() => {
                  //   const data = this.getItem();
                  //   // console.log(data, 'ssssssss')
                  //   if (JSON.stringify(data) == '{}') return;
                  //   return staff.chosen.map((id) => {
                  //     const item = data[id];
                  //     return (
                  //       <span key={item.id} className="staff-block">{item.username} <Icon onClick={this.removeSelect.bind(this, id)} style={{ cursor: 'pointer' }} type="close" theme="outlined" /></span>
                  //     )
                  //   })
                  // })()
                }
              </div>
            }
            <div style={{ marginTop: ' 25px' }} className="task-item error-tips">
              {
                validate.participant === false &&
                '请选择参与人员'
              }
            </div>
            <Modal
              title={gettext('Add Folder Admins')}
              okText={gettext('Confirm')}
              cancelText={gettext('Cancel')}
              width="800px"
              visible={this.state.staff.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              className="staffModal"
              destroyOnClose={true}
              bodyStyle={{ height: '500px', padding: '10px 24px' }}
            >
              <Input
                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={gettext('Please search by Legal Name/E-mail/Mobile/Department')}
                size="default"
                style={{ marginBottom: '10px', height: '30px' }}
                onChange={this.onSearchChange}
              />
              <Table
                columns={staffColumns}
                dataSource={this.state.staff.list}
                bordered
                pagination={false}
                rowSelection={rowSelection}
                locale={{ emptyText: gettext('No Data') }}
                scroll={{ y: 390 }}
                size="small"
                rowKey="username"
                loading={this.state.staff.loading}
              />
            </Modal>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label switch-item">
            题目排序
          </div>
          <div className="task-item">
            <Switch onChange={(problem_disorder) => { this.setState({ problem_disorder, }) }} checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.problem_disorder} /><span style={{ marginLeft: '15px' }}>开启以后题目顺序将随机打乱</span>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label switch-item">
            查看答案
          </div>
          <div className="task-item">
            <Switch onChange={(show_answer) => { this.setState({ show_answer, }) }} checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.show_answer} /><span style={{ marginLeft: '15px' }}>说明：默认不开启，即考生考试完毕后提交答案无答案查看。开启后即考生考试完毕后，有答案供其查看</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {
            create ?
              <Button>返回</Button>
              :
              <Button onClick={() => { this.props.goback(); console.log('sss') }}>返回</Button>
          }
          {
            create ?
              <Button loading={this.state.publishLoading} onClick={this.createTask} type="primary" style={{ marginLeft: '18px' }}>发布</Button>
              :
              <Button loading={this.state.publishLoading} onClick={this.saveTask} type="primary" style={{ marginLeft: '18px' }}>保存</Button>
          }
        </div>
      </div>
    )
  }
}