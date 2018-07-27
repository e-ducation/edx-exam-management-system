
import React, { Component } from 'react';
import { Table, Input, Icon, Breadcrumb, Dropdown, Menu, Button } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import axios from 'axios';
import './index.scss';
export default class SelectQuestion extends Component {
  state = {
    course: [1, 2, 3, 4, 5],
    chapters: ['a', 'b', 'c'],
    courseSearch: '',
    keySearch: '',
    questionList: [],
    selectedList: [],
    selectedRowKeys: [5,6,7],
    activeChapter: '全部章节',
    activeCourse: '1',
    activeQuestionType: '全部题型',
    selectType: 'immobilization'// immobilization|stochastic

  }
  componentDidMount() {
    this.getList('a');
    axios.get('/user?ID=12345')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  getList = (chapter) => {
    let tmp = new Array(10).fill(0);
    const questionList = tmp.map((t, i) => {
      let chapter = '';
      if (i < 3) {
        chapter = 'a';
      } else if (i < 6) {
        chapter = 'b'
      } else {
        chapter = 'c';
      }
      return {
        id: i,
        name: `${i}`,
        chapter,
        key: i,
        // name: 'John Brown',
        radio: 32,
        multiple: 'New York No. 1 Lake Park',
        checking: 32,
        completion: 32,
      }
    })
    this.setState({
      questionList: questionList.filter(x => x.chapter === chapter),
    })
  }
  onChange = (value) => {
    this.setState({
      selectedRowKeys: value,
    })
    // const { questionList, activeChapter, active } = this.state;
    // let activeData = active.filter((x) => x.chapter != activeChapter);
    // const addData = value.map((data) => {
    //     let qs = undefined;
    //     questionList.map((item) => {
    //         if (item.id  == data ) {
    //             qs = item;
    //         }
    //     })
    //     return qs;
    // }).filter((x) => x != undefined)
    // this.setState({
    //     active:[
    //         ...activeData,
    //         ...addData,
    //     ]
    // })
    // console.log(value,activeData,addData,questionList)
  }
  changeChapter = (chapter) => {
    this.getList(chapter)
    this.setState({

    })
  }
  outputData = () => {
    // 数据格式
    // const data = [{
    //     classid,
    //     classname,
    //     radio,
    //     multiple,
    //     checking,
    //     completion
    // }]
  }
  // 题目列表数据更新
  getQuestionData = () => {
    const { activeCourse, activeChapter, activeQuestionType, keySearch } = this.state;
    console.log('activeCourse',activeCourse)
    console.log('activeChapter',activeChapter)
    console.log('activeQuestionType',activeQuestionType)
    console.log('keySearch',keySearch)
    // const { callback } = this.props;
    // const { selectedRowKeys,totalAcount } = this.state;
  }
  // 题型选择
  handleMenuClick = (v) => {
    console.log(v);
    this.setState({
      activeQuestionType: v.key,
    }, () => {
      this.getQuestionData();
    });
  }
  // 章节选择
  handleCMenuClick = (v) => {
    console.log(v)
    this.setState({
      activeChapter: v.key
    }, () => {
      this.getQuestionData();
    });
  }
  handleSearch = (e) => {
    console.log(e.target.value);
    this.setState({
      keySearch: e.target.value,
    }, () => {
      this.getQuestionData()
    })
  }
  render() {
    const { questionList, selectedRowKeys, activeChapter } = this.state;
    // const CheckboxGroup = Checkbox.Group;
    let plainOptions = questionList.map((data) => {
      if (data.chapter === activeChapter) {
        return {
          label: data.name, value: data.id
        }
      } else {
        return null;
      }
    })
    plainOptions = plainOptions.filter(x => x != null);
    console.log(plainOptions)
    const columns = [{
        title: '全选本页',
        dataIndex: 'name',
        // eslint-disable-next-line
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: '单选题',
        dataIndex: 'radio',
      },
      {
        title: '多选题',
        dataIndex: 'multiple',
      },
      {
        title: '判断题',
        dataIndex: 'checking',
      },
      {
        title: '填空题',
        dataIndex: 'completion',
      },
    ];
    const stochasticRowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
        })
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const stochasticColumns = [{
        title: '题目',
        dataIndex: 'name',
        width: '80%',
        // eslint-disable-next-line
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: '类型',
        dataIndex: 'radio',
      }
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
        })
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const cmenu = (
      <Menu onClick={this.handleCMenuClick}>
        <Menu.Item key="a">a</Menu.Item>
        <Menu.Item key="b">b</Menu.Item>
        <Menu.Item key="c">c</Menu.Item>
      </Menu>
    );
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="单选题">单选题</Menu.Item>
        <Menu.Item key="多选题">多选题</Menu.Item>
        <Menu.Item key="判断题">判断题</Menu.Item>
        <Menu.Item key="填空题">填空题</Menu.Item>
      </Menu>
    );
    const TableHeader = () => {
      return (
        <div>
           <Dropdown overlay={menu}>
            <Button>
              {this.state.activeQuestionType} <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={cmenu}>
            <Button style={{marginLeft:'4px'}}>
              {this.state.activeChapter} <Icon type="down" />
            </Button>
          </Dropdown>
          <div style={{ textAlign: 'center',display:'inline-block',marginLeft: '35px',marginTop:'-1px'}}>
            <Input onChange={this.handleSearch} prefix={<Icon  type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入关键字" style={{ width: "190px" }} />
          </div>
        </div>
      )
    }
    return (
      <div>
        <Header />

        <div className="qs-container">
          <Breadcrumb style={{ margin: '20px 0' }}>
            <Breadcrumb.Item>
              <Icon type="folder-open" style={{ marginRight: '5px' }} />
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="folder-open" style={{ marginRight: '5px' }} />
              <span>选择范围</span>
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="select-scope">选择范围</div>
          <div className="sidebar">
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Input prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入关键字" style={{ width: "190px" }} />
            </div>
            <ul className="course-list">
              <li onClick={this.changeChapter.bind(this, 'a')}>全球信息化管理</li>
              <li onClick={this.changeChapter.bind(this, 'b')} className="active">大数据分析</li>
              <li onClick={this.changeChapter.bind(this, 'c')}>vue学习教程</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
            </ul>
          </div>
          <div className="main">
            <div className="course-name">大数据分析</div>
            {
              false &&
              <Table
                onHeaderRow={(column) => {
                  return {
                    onClick: () => { },        // 点击表头行
                    style: { backgroundColor: '#fff' },
                  };
                }}
                bordered={true}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={questionList}
                size="small"
              />
            }
            {
              <Table
                title= {
                  TableHeader
                }
                bordered={true}
                rowSelection={stochasticRowSelection}
                columns={stochasticColumns}
                dataSource={questionList}
                size="small"
              />
            }
            <div>
              <div>已选<span style={{ color: '#0692e1' }}>100</span>题</div>
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
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}