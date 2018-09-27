import React from 'react';
import { Button, Input, InputNumber, DatePicker, Switch, Modal, Icon, Table, Select } from 'antd';
import moment from 'moment';
import axios from 'axios';
import Paper from './paper';
import $ from 'jquery';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
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
    exam_time_limit: '',
    period_start: '',
    period_end: '',
    participants: [],
    show_answer: false,
    problem_disorder: false,
  }
  componentWillMount() {
    console.log($().jquery)
  }
  getList = () => {
    const list = [
      {
        id: 573,
        user: 800004054,
        username: "lili",
        is_xdmin: true,
        phone: "13500000032",
        email: "admin002@lts.cn",
        department: "管理员,测试001"
      },
      {
        id: 574,
        user: 800004055,
        username: "测试",
        is_xdmin: true,
        phone: "13500000029",
        email: "admin001@lts.cn",
        department: "管理员,测试001"
      },
      {
        id: 579,
        user: 800004130,
        username: "admin003",
        is_xdmin: true,
        phone: "15900000003",
        email: "admin003@lts.cn",
        department: "管理员,测试001,20180404"
      },
      {
        id: 581,
        user: 800004145,
        username: "ad004",
        is_xdmin: true,
        phone: "15900000004",
        email: "admin004@lts.cn",
        department: "管理员,测试001"
      },
      {
        id: 600,
        user: 800004207,
        username: "admin0051441",
        is_xdmin: true,
        phone: "15900000005",
        email: "admin005@lts.cn",
        department: "管理员,测试001"
      },
      {
        id: 602,
        user: 800004216,
        username: "sole652",
        is_xdmin: true,
        phone: "13500000030",
        email: "sole652@qq.com",
        department: "管理员,测试001"
      },
      {
        id: 604,
        user: 800004219,
        username: "guanli06",
        is_xdmin: true,
        phone: "15900000006",
        email: "admin006@lts.cn",
        department: "管理员,测试001"
      },
      {
        id: 843,
        user: 800004160,
        username: "test012",
        is_xdmin: false,
        phone: "13500000012",
        email: "test012@lts.cn",
        department: "技术部/广州区/PHP"
      },
      {
        id: 970,
        user: 800004203,
        username: "sole651",
        is_xdmin: false,
        phone: "18816786355",
        email: "sole651@163.com",
        department: "课程/助教!"
      },
      {
        id: 984,
        user: 800005283,
        username: "test045",
        is_xdmin: true,
        phone: "13500000045",
        email: "test045@lts.cn",
        department: ""
      }
    ]
    this.setState({
      staff: {
        ...this.state.staff,
        list,
        loading: false,
      }
    });
    // this.getStaffList()
  }
  //
  showPaper = () => {
    this.paper.showPaper();
  }
  selectPaper = (paper) => {
    this.setState({
      paper,
    })
  }
  // 创建任务
  createTask = () => {
    const { paper, period_start, period_end, exam_time_limit, staff, taskName } = this.state;
    const { chosen } = staff;
    const participants = [];
    const data = this.getItem();
    chosen.map(id => {
      participants.push({
        participant: data[id],
      })
    })
    // console.log()
    axios.post('/api/examtasks/', {
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
      participants: participants,
    }).then((response) => {
      console.log(response)
    }).catch((err)=>{
      console.log(err)
    })
  }
  // 2.2 获取公司成员列表
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
    axios.get('/api/users/?search=' + this.state.staff.search + '&page=' + page + '&page_size=20', {
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
            if (staff.loading == true) return;
            // if (staff.loading.loading == true)
            const parentElemBottom = $('.staffModal .ant-table-body')[0].getBoundingClientRect().bottom;
            const elems = $('.staffModal .ant-table-row');
            const elemBottom = elems[elems.length - 1].getBoundingClientRect().bottom;

            if (elemBottom - parentElemBottom < 150) {
              this.getStaffList();
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
  // 2.3 搜索人员
  onSearchChange = (e) => {
    if (this.searchajax) {
      console.log(this.searchajax, '12312312312')
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
  // 确定选择
  handleOk = () => {
    const { staff } = this.state;
    staff.visible = false;
    this.setState({
      staff,
    });
    clearInterval(this.timer);
  }
  getItem = () => {
    const { staff } = this.state;
    const { list, chosen } = staff;
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
  removeSelect = (id) => {
    console.log(id, 'remove');
    const { staff } = this.state;
    const { chosen } = staff;
    const newChosen = chosen.filter(x => x != id)
    // console.log(newChosen, chosen)
    this.setState({
      staff: {
        ...staff,
        chosen: newChosen,
      },
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

    const time = value[1].valueOf() - value[0].valueOf();
    this.setState({
      period_start: value[0],
      period_end: value[1],
    })
    console.log(time / 1000 / 60 / 60);
  }
  //
  nameOnChange = (e) => {
    this.setState({
      taskName: e.target.value,
    })
    // console.log(e.target.value)
  }
  render() {
    const { paper } = this.state;
    const { create } = this.props;
    const { staff } = this.state;
    const problem_statistic = paper.problem_statistic || {};
    console.log(staff)
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
      selectedRowKeys: staff.chosen,
      onChange: (selectedRowKeys, selectedRows) => {
        let { staff } = this.state;
        staff.chosen = selectedRowKeys;
        this.setState({
          staff,
        });
      },
      getCheckboxProps: (record) => {
        return ({
          disabled: record.is_file_admin,
        })
      }
    };
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
            <Input onChange={this.nameOnChange} maxLength={50} style={{ width: '350px' }} placeholder="输入试卷名称，限定50字符" />
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
            // format={dateFormat}
            />
          </div>
        </div>
        <div className="task-row">
          <div className="task-label input-item">
            答卷时间
          </div>
          <div className="task-item">
            <Select defaultValue="10" style={{ width: 83, marginRight: '10px' }} onChange={this.timeHandleChange}>
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
            <div style={{ height: staff.chosen.length != 0 ? '40px' : '20px' }}>
              <Button onClick={this.staffModal} style={{ position: 'absolute', top: '-6px', color: '#0692e1', borderColor: '#0692e1' }} icon="plus-square" >人员</Button>
            </div>
            {
              staff.chosen.length != 0 &&
              <div className="staff-container">
                {
                  (() => {
                    const data = this.getItem();
                    console.log(data)
                    return staff.chosen.map((id) => {
                      const item = data[id];
                      return (
                        <span key={item.id} className="staff-block">{item.username} <Icon onClick={this.removeSelect.bind(this, id)} style={{ cursor: 'pointer' }} type="close" theme="outlined" /></span>
                      )
                    })
                  })()
                }
              </div>
            }
            <Modal
              title={gettext('Add Folder Admins')}
              okText={gettext('Confirm')}
              cancelText={gettext('Cancel')}
              width="800px"
              visible={this.state.staff.visible}
              onOk={this.handleOk}
              onCancel={this.handleOk}
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
                rowKey="id"
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
          <Button onClick={this.createTask} type="primary" style={{ marginLeft: '18px' }}>发布</Button>
        </div>
      </div>
    )
  }
}