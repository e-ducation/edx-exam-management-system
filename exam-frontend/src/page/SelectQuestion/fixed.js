
import React, { Component } from 'react';
import { Table, Input, Icon, Dropdown, Menu, Button } from 'antd';
import { problemsType } from '../../utils';
import ProblemDetail from '../../components/ProblemDetail';

export default class FixedQustion extends Component{
  state = {
    activeCourse: '',
    activeQuestionType: '全部',
    activeChapter: '全部',
    activeChapterName: '全部',
    keySearchL: null,
    page: 1,
    selectedRowKeys: [],
  }
  componentDidMount(){
    this.setState({
      selectedRowKeys: this.props.selectedRowKeys,
    })
  }
  componentWillReceiveProps(nextProps) {
    if( JSON.stringify(this.props.selectedRowKeys) !== JSON.stringify(nextProps.selectedRowKeys)){
      this.setState({
        selectedRowKeys: nextProps.selectedRowKeys,
      })
    }
    if (this.props.activeCourse !== nextProps.activeCourse){
      this.setState({
        activeQuestionType: '全部',
        activeChapter: '全部',
      })
    }
  }
  // 题目列表数据更新
  getQuestionData = () => {
    const { page, activeChapter, keySearch, activeQuestionType} = this.state;
    const { getList } = this.props;
    const params = {
      page,
      page_size: 10,
    };
    if (activeChapter !== '全部') params['block_id'] = activeChapter;
    if (keySearch !== null) params['search'] = keySearch;
    if (activeQuestionType !== '全部') params['problem_type'] = activeQuestionType;
    getList(params);
  }
  // 题型选择
  handleMenuClick = (v) => {
    this.setState({
      activeQuestionType: v.key,
      page: 1,
    }, () => {
      this.getQuestionData();
    });
    return true;
  }
  // 章节选择
  handleCMenuClick = (v) => {
    // console.log(v)
    this.setState({
      activeChapter: v.key,
      activeChapterName: v.item.props.children,
      page: 1,
    }, () => {
      this.getQuestionData();
    });
  }
  handleSearch = (e) => {
    // console.log(e.target.value);
    this.setState({
      keySearch: e.target.value,
      page: 1,
    }, () => {
      this.getQuestionData()
    })
  }
  // 题型统计
  confirm = () => {
    const { callback } =this.props;
    const { selectedRowKeys } = this.state;
    callback(selectedRowKeys);
  }
  render(){
    const { questionList, sectionList, loading} = this.props;
    const { activeChapter, page, activeChapterName, activeQuestionType, selectedRowKeys } = this.state;
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
        });
        this.props.countType(selectedRowKeys)
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const columns = [{
        title: '题目',
        dataIndex: 'title',
        width: '80%',
        // eslint-disable-next-line
        render: (text,item) => {
          // console.log(this.ProblemDetail,item);
          const { id, type , ...content } = item;
          const data = {
            grade: 1,
            title: item.title,
            problem_type: type,
            problem_id: id,
            content,
          }
          // eslint-disable-next-line
          return (<a onClick={this.ProblemDetail.showModal.bind(this, data)} href="javascript:;">{text}</a>)
        },
      }, {
        title: '类型',
        dataIndex: 'type',
        render: type => problemsType[type]
      }
    ];
    const cmenu = (
      <Menu onClick={this.handleCMenuClick}>
        {
          activeChapter !== '全部' &&
          <Menu.Item key="全部">全部章节</Menu.Item>
        }
        {
          sectionList.map(data => {
            return <Menu.Item key={data.id}>{data.name}</Menu.Item>
          })
        }
      </Menu>
    );
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {
          activeQuestionType !== '全部' &&
          <Menu.Item key="全部">全部</Menu.Item>
        }
        <Menu.Item key="multiplechoiceresponse">单选题</Menu.Item>
        <Menu.Item key="choiceresponse">多选题</Menu.Item>
        <Menu.Item key="stringresponse">填空题</Menu.Item>
      </Menu>
    );
    const TableHeader = () => {
      return (
        <div>
           <Dropdown overlay={menu}>
            <Button>
              { activeQuestionType === '全部' ? activeQuestionType : problemsType[activeQuestionType] } <Icon type="down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={cmenu}>
            <Button  style={{marginLeft:'4px', width: '150px', overflow:'hidden',textOverflow: 'ellipsis'}}>
              <span>{ activeChapter === '全部' ? '全部章节' : activeChapterName }</span><Icon type="down" />
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
        <ProblemDetail ref={(node) => {this.ProblemDetail = node;}} />
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
          pagination={{ current: page,pageSize: 10, total: questionList.count, onChange:(page) => { this.setState({page}, () => {this.getQuestionData()})} }}
          dataSource={questionList.results}
          size="small"
          rowKey="id"
          loading={loading}
        />
      </div>
    )
  }
}