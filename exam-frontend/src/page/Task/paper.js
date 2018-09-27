import React from 'react';
import { Input, Modal, Icon, Radio, message } from 'antd';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller';
const RadioGroup = Radio.Group;
export default class Paper extends React.Component {
  state = {
    visible: false,
    data: [],
    pageCurrent: 1,
    search: '',
    hasMore: true,
    loading: false,
  }
  componentWillMount() {
    this.getList((res) => {
      let { data } = this.state;
      let list = res.data.results;
      data = data.concat(list);
      this.setState({
        data,
        pageTotal: res.data.count,
        loading: false,
        // value: this.props.value != undefined ? this.props.value : data[0].id, // 默认选择第一个
      })
    })
  }
  showPaper = () => {
    this.setState({
      visible: true
    })
  }
  paperHandleOk = () => {
    const { data, value } = this.state;
    let paper = {};
    for (let item of data) {
      if (item.id == value) {
        paper = item;
        break;
      }
    }
    console.log(paper)
    this.setState({
      visible: false,
    });
    this.props.selectPaper(paper)
  }
  paperHandleCancel = () => {
    this.setState({
      visible: false
    })
  }
  // 试卷列表
  getList = (callback) => {
    const { pageCurrent, search } = this.state;
    const that = this;
    const CancelToken = axios.CancelToken;
    if (this.searchAjax) {
      this.searchAjax();
    }

    this.setState({
      loading: true,
    }, () => {
      axios.get('/api/exampapers/?search=' + search + '&page=' + pageCurrent, {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.searchAjax = c
        })
      }).then(function (response) {
        const res = response.data;
        if (res.status === 0) {
          // 给list添加key
          callback(res)

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
  // 滚动加载
  handleInfiniteOnLoad = () => {
    let data = this.state.data;
    const { pageTotal } = this.state;
    if (data.length >= pageTotal) {
      message.warning('Infinite List loaded all');
      this.setState({
        hasMore: false,
        loading: false,
      });
      return;
    }
    this.setState({
      loading: true,
      pageCurrent: this.state.pageCurrent + 1,
    }, () => {
      this.getList((res) => {
        data = data.concat(res.data.results);
        this.setState({
          data,
          loading: false,
        });
      })
    });
  }
  handleSearch = (e) => {
    this.setState({
      search: e.target.value,
      pageCurrent: 1,
    }, () => {
      this.getList((res) => {
        const data = res.data.results;
        const hasMore = data.length < res.data.count;
        this.setState({
          data: data.length == 0 ? [] : data,
          pageTotal: res.data.count,
          loading: false,
          hasMore,
          // value: data.length == 0 && this.props.value != undefined ? '' : data[0].id, // 默认选择第一个
        })
      })
    })
  }
  // radio 选择器
  radioOnChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  }
  render() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const { data, value } = this.state;
    return (
      <Modal
        title="试卷选择"
        visible={this.state.visible}
        onOk={this.paperHandleOk}
        onCancel={this.paperHandleCancel}
      >
        <Input onChange={this.handleSearch} prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入搜索关键字" />
        <div className="paper-select" style={{ height: '240px', overflow: 'auto', padding: '5px', marginTop: '10px' }}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!this.state.loading && this.state.hasMore}
            useWindow={false}
          >
            <RadioGroup style={{ width: '100%' }} onChange={this.radioOnChange} value={this.state.value}>
              {
                data.map(item => {
                  return (
                    <Radio key={item.id} style={radioStyle} value={item.id}>[{item.create_type === 'fixed' ? '固定试卷' : '随机试卷'}] {item.name}</Radio>
                  )
                })
              }
            </RadioGroup>
          </InfiniteScroll>
        </div>
      </Modal>
    )
  }
}