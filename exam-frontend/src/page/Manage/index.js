import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Button, Pagination, Select } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ChoosePaperType from '../../components/ChoosePaperType';
import './index.scss';
import $ from "jquery";
class ManageContainer extends React.Component {
  state={
    loading: false,
    visible: false,
    list: [
      {
        id: 1,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 2,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 3,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 4,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 5,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: false,
      },{
        id: 1,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 2,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 3,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 4,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 5,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: false,
      },{
        id: 1,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 2,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 3,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 4,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: true,
      },{
        id: 5,
        name: '第一张测试试卷',
        type: '固定试题',
        count: 70,
        total_grade: 100,
        pass_grade: 70,
        creator: '张伟',
        is_creator: false,
      }
    ],
    pageCurrent: 1,
    pageTotal: 50,
    pageSize: 10,
  }


  componentDidMount() {
  }

  // 1.1 试卷列表

  // 1.2 试卷列表页码变更
  handlePageChange = () => {

  }

  // 1.3 试卷列表每页显示变更
  handlePageSizeChange = () =>{

  }

  // 2.1 新建试卷
  showModal = () => {
    this.setState({
      visible: true,
    })
  }

  // 2.2 取消新建试卷
  hideModal = () => {
    this.setState({
      visible: false,
    })
  }

  // 3. 预览试卷
  previewPaper = (id) => {
    window.open("/#/preview?id=" + id)
  }

  // 4. 复制试卷
  copyPaper = (id) => {
    console.log(id)
  }

  // 5. 删除试卷
  deletePaper = (id) => {
    console.log(id)
  }


  render() {
    // 列表头
    const columns = [
      {
        title: '试卷名称',
        dataIndex: 'name',
        width: '29%',
        render: (text, record, index) => (
          <span onClick={this.previewPaper.bind(this, record.id)} className="text-link">{text}</span>
        )
      }, {
        title: '选题方式',
        dataIndex: 'type',
        width: '14%',
      }, {
        title: '试题数',
        dataIndex: 'count',
        width: '10%',
      }, {
        title: '总分',
        dataIndex: 'total_grade',
        width: '10%',
      }, {
        title: '及格分',
        dataIndex: 'pass_grade',
        width: '10%',
      }, {
        title: '创建人',
        dataIndex: 'creator',
        width: '13%',
      }, {
        title: '操作',
        dataIndex: 'is_creator',
        width: '14%',
        render: (text, record, index) => (
          <span>
            {
              record.is_creator ?
                <span>
                  <Tooltip title="编辑">
                    <Icon type="edit" className="icon-blue" style={{fontSize:'16px'}} />
                  </Tooltip>
                  <Tooltip title="复制">
                    <Icon type="copy" className="icon-blue" style={{fontSize:'16px', margin:'0 10px'}} onClick={this.copyPaper.bind(this, record.id)} />
                  </Tooltip>
                  <Tooltip title="删除">
                    <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} onClick={this.deletePaper.bind(this, record.id)} />
                  </Tooltip>
                </span>
              :
                <span>
                  <Icon type="edit" style={{fontSize:'16px', cursor: 'not-allowed', color: '#AAB2BD'}} />
                  <Icon type="copy" style={{fontSize:'16px', cursor: 'not-allowed', color: '#AAB2BD', margin:'0 10px'}} />
                  <Icon type="delete" style={{fontSize:'16px', cursor: 'not-allowed', color: '#AAB2BD'}} />
                </span>
            }
          </span>
        )
      }
    ];

    return (
      <div className="displayFlx">
        <Sidebar active="manage" />
        <div className="text-right-left">
          <Breadcrumb>
            <Breadcrumb.Item href="/#/">
              <Icon type="folder-open" style={{marginRight: '5px'}} />
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Icon type="folder-open" style={{marginRight: '5px'}} />
              <span>试卷管理</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ margin: '25px 0 20px'}}>试卷管理</h1>
          <Table
            columns={columns}
            dataSource={this.state.list}
            bordered
            pagination={false}
            size="small"
            loading={this.state.loading}
            title={() =>
              <div>
                <Button icon="file-add" type="primary" onClick={this.showModal}>新建试卷</Button>
                <Input
                  prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入关键字"
                  style={{width:'200px', marginLeft: '10px', position:'relative', top: '1px'}}
                />
              </div>
            }
            locale={{ emptyText: 'No files.' }}
          />
          <div className="page">
            <Pagination
              size="small"
              current={this.state.pageCurrent}
              total={this.state.pageTotal}
              onChange={this.handlePageChange}
              pageSize={this.state.pageSize}
              className="page-num"
            />
            <span className="page-size">
              {  !!$('#locale')[0] && $('#locale').val() === 'zh-cn' ? '每页显示' : '' }
              <Select defaultValue="10" size="small" onChange={this.handlePageSizeChange} style={{ margin: '0 5px'}}>
                <Select.Option value="10">10</Select.Option>
                <Select.Option value="20">20</Select.Option>
                <Select.Option value="30">30</Select.Option>
                <Select.Option value="50">50</Select.Option>
              </Select>
              { !!$('#locale')[0] && $('#locale').val() === 'zh-cn' ? '条' : 'items per page' }
            </span>
          </div>
        </div>
        <ChoosePaperType visible={this.state.visible} hideModal={this.hideModal} />
      </div>
    );
  }
}


export default class Manage extends React.Component {
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
          <ManageContainer />
        </div>
        <Footer />
      </div>
    );
  }
}