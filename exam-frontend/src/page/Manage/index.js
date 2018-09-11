import React from 'react';
import { Icon, Tooltip, Table, Input, Breadcrumb, Button, Pagination, Select, message, Modal } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ChoosePaperType from '../../components/ChoosePaperType';
import axios from 'axios';
import './index.scss';
import $ from "jquery";
import none from "../../assets/images/none.png";
class ManageContainer extends React.Component {
  constructor(props){
    super(props);
    this.searchAjax = null;
  }

  state={
    loading: true,
    visible: false,
    list: [],
    pageCurrent: 1,
    pageTotal: 0,
    pageSize: 10,
    search: '',
  }


  componentDidMount() {
    this.getList();

  }

  // 1.1 试卷列表
  getList = () => {
    const { pageCurrent, pageSize, search } = this.state;
    const that = this;
    const CancelToken = axios.CancelToken;
    if (this.searchAjax){
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
          if (res.status === 0){
            // 给list添加key
            let list = res.data.results;
            for (let i = 0; i < list.length; i++){
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
  handlePageSizeChange = (e) =>{
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
    window.open("/#/preview/" + id)
  }

  // 4. 复制试卷
  copyPaper = (id) => {
    const that = this;
    axios.post('/api/exampapers/' + id + '/duplicate/')
      .then(function (response) {
        const res = response.data;
        if (res.status === 0){
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
        axios.delete('/api/exampapers/' + id + '/')
        .then(function (response) {
          const res = response.data;
          if (res.status === 0){
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
    window.location.href = '/#/edit/' + id;
  }


  render() {
    // 列表头
    const columns = [
      {
        title: '试卷名称',
        dataIndex: 'name',
        width: '29%',
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
        title: '选题方式',
        dataIndex: 'create_type',
        width: '14%',
        render: (text) => (
          <span>{ text === 'fixed' ? '固定试题' : '随机试题'}</span>
        )
      }, {
        title: '试题数',
        dataIndex: 'total_problem_num',
        width: '10%',
      }, {
        title: '总分',
        dataIndex: 'total_grade',
        width: '10%',
      }, {
        title: '及格分',
        dataIndex: 'passing_grade',
        width: '10%',
      }, {
        title: '创建人',
        dataIndex: 'creator',
        width: '13%',
      }, {
        title: '操作',
        dataIndex: 'id',
        width: '14%',
        render: (text, record, index) => (
          <span>
            <Tooltip title="编辑">
              <Icon type="edit" className="icon-blue" style={{fontSize:'16px'}} onClick={this.editPaper.bind(this, record.id)} />
            </Tooltip>
            <Tooltip title="复制">
              <Icon type="copy" className="icon-blue" style={{fontSize:'16px', margin:'0 10px'}} onClick={this.copyPaper.bind(this, record.id)} />
            </Tooltip>
            <Tooltip title="删除">
              <Icon type="delete" className="icon-red" style={{fontSize:'16px'}} onClick={this.deletePaper.bind(this, record.id)} />
            </Tooltip>
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
              <Icon type="home" theme="outlined" style={{fontSize:'14px',marginRight: '2px'}}/>
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <i className="iconfont" style={{fontSize:'12px',marginRight: '5px'}}>&#xe62e;</i>
              <span>试卷管理</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <h1 style={{ margin: '25px 0 20px', fontSize:'16px'}}>试卷管理</h1>
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
                  onChange={this.onChangeSearch}
                />
              </div>
            }
            locale={{ emptyText: <div style={{marginBottom: '100px'}}><img src={none} style={{width: '125px', margin: '60px 0 20px'}} alt="" /><div>暂无试卷</div></div> }}
          />
          {
            this.state.list.length === 0 ?
              null
            :
              <div className="page">
                <span className="page-total">共{ this.state.pageTotal }条记录</span>
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
                  <Select defaultValue="10" size="small" onChange={this.handlePageSizeChange} style={{ margin: '0 5px'}}>
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
        <ChoosePaperType visible={this.state.visible} hideModal={this.hideModal} />
      </div>
    );
  }
}


export default class Manage extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  }

  componentDidMount(){
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px'}
    return (
      <div>
        <Header />
        <div className="container" style={containerHeight}>
          <ManageContainer />
        </div>
        <Footer />
      </div>
    );
  }
}