
import React, { Component } from 'react';
import { Table, Input, Icon, Dropdown, Menu, Button } from 'antd';

export default class FixedQustion extends Component{
  state = {
    activeCourse: '',
    activeQuestionType: '全部',
    activeChapter: '全部章节',
    keySearchL: null,
    page: 1,
    selectedRowKeys: [],
  }
  componentDidMount(){
  }
  // 题目列表数据更新
  getQuestionData = () => {
    const { page, activeChapter, keySearch } = this.state;
    const { getList } = this.props;
    const params = {
      page,
      page_size: 10,
    };
    if (activeChapter != null) params['section_id'] = activeChapter;
    if (keySearch != null) params['search'] = keySearch;
    getList(params);
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
  confirm = () => {
    const { callback } =this.props;
    const { selectedRowKeys } = this.state;
    callback(selectedRowKeys);
  }
  render(){
    const { questionList, sectionList} = this.props;
    const { activeChapter, activeQuestionType, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // if (selectedRowData[activeCourse] != undefined){
        //   selectedRowData[activeCourse][page] = selectedRows;
        // } else {
        //   selectedRowData[activeCourse] = {
        //     [page]:selectedRows
        //   }
        // }
        // callback(selectedRowKeys);
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
    const columns = [{
        title: '题目',
        dataIndex: 'id',
        key: 'id',
        width: '80%',
        // eslint-disable-next-line
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: '类型',
        dataIndex: 'name',
      }
    ];
    const cmenu = (
      <Menu onClick={this.handleCMenuClick}>
        {
          sectionList.map(data => {
            return <Menu.Item key={data.id}>{data.name}</Menu.Item>
          })
        }
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
              { activeQuestionType } <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={cmenu}>
            <Button  style={{marginLeft:'4px', width: '150px', overflow:'hidden',textOverflow: 'ellipsis'}}>
              <span>{ activeChapter }</span><Icon type="down" />
            </Button>
          </Dropdown>
          <div style={{ textAlign: 'center',display:'inline-block',marginLeft: '35px',marginTop:'-1px'}}>
            <Input onChange={this.handleSearch} prefix={<Icon  type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入关键字" style={{ width: "190px" }} />
          </div>
        </div>
      )
    }
    return(
      <div>
        <Table
          title= {
            TableHeader
          }
          onHeaderRow={(column) => {
            return {
              onClick: () => { },        // 点击表头行
              style: { backgroundColor: '#fff' },
            };
          }}
          bordered={true}
          rowSelection={rowSelection}
          columns={columns}
          pagination={{ pageSize: 10, total: questionList.count, onChange:(page) => { this.setState({page}, () => {this.getQuestionData()})} }}
          dataSource={questionList.results}
          size="small"
          rowKey="id"
        />
      </div>
    )
  }
}