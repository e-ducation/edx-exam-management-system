
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Input, Icon, Breadcrumb, Button } from 'antd';
import './index.scss';
import axios from 'axios';
import FixedQuestion from './fixed';
import RandomQuestion from './random';
import { setFixedTable, setRandomTable } from '../../model/action'
class SelectQuestion extends Component {
  state = {
    courseList: [],
    sectionList: [],
    courseSearch: '',
    keySearch: '',
    questionList: [],
    selectedRowKeys: [],
    activeChapter: '全部章节',
    activeCourse: '',
    activeQuestionType: '全部题型',
    randomLoading: false,
    quesitonLoading: false,
    counting: {
      multiplechoiceresponse: 0,
      choiceresponse: 0,
      stringresponse: 0,
    },
  }
  static defaultProps = {
    // paperType: 'fixed'
    paperType: 'random'
  }

  componentDidMount() {
    this.getCourses();
    this.random = {}
  }
  initData = (selectedRowKeys) => {
    axios.post('/api/problems/detail/', {
        problems:selectedRowKeys,
      }).then(res => {
      console.log(res.data)
      const { fixedTable } = this.props;
      const fetchData = {}
      const list = res.data.data;
      // eslint-disable-next-line

      list.map((item,index) => {
        const { id, type , ...content } = item;
        fetchData[id] = {
          grade: 1,
          title: item.title,
          problem_type: type,
          problem_id: id,
          content,
        }
      })
      // 初始化结构
      if (Object.keys(fixedTable).length === 0){
        this.props.setFixedTable(fetchData);
      } else {
        // 非初始化结构
        this.resetData(fetchData)
      }
      console.log(fetchData)
    }).catch(error => {
      console.log(error)
    })
  }
  resetData = (fetchData) => {
    const { fixedTable } = this.props;// 历史数据
    // 查找还存在的历史数据
    // eslint-disable-next-line
    Object.keys(fixedTable).map(key => {
      if(fetchData[key] != undefined){
        fetchData[key] = fixedTable[key];
      }
    })
    // Object.keys(fetchData).map(id => {
    //   // eslint-disable-next-line
    //   Object.keys(fixedTable).map(key => {
    //     if(id === key){
    //       fetchData[key] = fixedTable[key];
    //     }
    //   })
    // })
    this.props.setFixedTable(fetchData);
  }
  // 获取课程列表
  getCourses = () => {
    axios.get('/api/courses/')
      .then( (res) => {
        console.log(res.data, 123)
        if (res.data.status === 0) {
          const { data }  = res.data;
          console.log(res.data, 123)
          if (data.length > 0) {
            this.setState({
              courseList: data,
              activeCourse: data[0].id,
            })
            this.getList(data[0].id);
          } else {

          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 课程名称获取题目列表
  getList = (course) => {
    this.getSection(course);
    this.setState({
      quesitonLoading: true,
    })
    axios.get(`/api/xblocks/${course}/problems/`)
      .then( (res) => {
        const { data } = res.data
        this.setState({
          questionList: data,
          quesitonLoading: false,
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 获取章节列表
  getSection = (id) => {
    this.setState({
      randomLoading: true,
    })
    axios.get(`/api/courses/${id}/sections/`)
      .then( (res) => {
        const { data } = res.data
        this.setState({
          sectionList: data,
          randomLoading: false,
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 题型统计
  countType = (selectedRowKeys) => {
    axios.post('/api/problems/detail/', {
      problems:selectedRowKeys,
    }).then(res => {
      const list = res.data.data;
      const counting = {
        multiplechoiceresponse: 0,
        choiceresponse: 0,
        stringresponse: 0,
      }
      list.map(data => {
        counting[data.type]++;
      })
      this.setState({
        counting
      })
      console.log(counting)
    }).catch(error => {
      console.log(error)
    })
  }
  // 回调设置勾选的题目
  onSelect = (selectedRowKeys) => {
    // 设置数据
    this.initData(selectedRowKeys);
    console.log(this.props.randomTable);
  }
  sectionSelect = (selectedRowKeys) => {
    // this.setSta
    this.props.setRandomTable(selectedRowKeys);
  }
  // 切换课程
  changeCourse = (course) => {
    this.getList(course)
    this.setState({
      activeCourse: course,
    })
  }
  // 题目列表数据更新
  getQuestionData = (params) => {
    const { activeCourse } = this.state;
    console.log(params, 'params')
    this.setState({
      quesitonLoading: true,
    })
    const block = params.block_id == undefined ? activeCourse : params.block_id;
    axios.get(`/api/xblocks/${block}/problems/`, {
        params,
      })
      .then( (res) => {
        const { data } = res.data;
        this.setState({
          questionList: data,
          quesitonLoading: false,
        })
        console.log(data)
      })
      .catch(function (error) {
        console.log(error);
      });
    // const { callback } = this.props;
    // const { selectedRowKeys,totalAcount } = this.state;
  }
  render() {
    const {courseList, activeCourse, sectionList, questionList,randomLoading, quesitonLoading, counting } = this.state;
    const { paperType, selectQuestionList, selectSectionList} = this.props;
    return (
      <div style={this.props.style}>
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
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <Input prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入关键字" style={{ width: "190px" }} />
            </div>
            <ul className="course-list">
              {
                 // 课程列表
                courseList.map(data => {
                  return <li key={data.id} className={activeCourse === data.id ? 'active': ''} onClick={this.changeCourse.bind(this, data.id)}>{data.name}</li>
                })
              }
            </ul>
          </div>
          <div className="main">
            <div className="course-name">大数据分析</div>
            {
              paperType == 'fixed' ?
              // 固定出题
              <FixedQuestion
                selectedRowKeys={selectQuestionList}
                ref={node => this.fixed = node}
                getList={this.getQuestionData} // 列表数据获取回调函数
                activeCourse={activeCourse} // 选中的课程ID
                sectionList={sectionList}   // 章节列表
                questionList={questionList} // 问题
                callback={this.onSelect}    // 回调函数
                loading={quesitonLoading}
                countType={this.countType}
                />
              :
              <RandomQuestion
                selectedRowKeys={selectSectionList}
                ref={node => this.random = node}
                loading={randomLoading}
                activeCourse={activeCourse} // 选中的课程ID
                sectionList={sectionList}   // 章节列表
                callback={this.sectionSelect}
              />
            }
            <div style={{padding: '10px 0'}}>
              <div>已选<span style={{ color: '#0692e1' }}>
                {
                  counting['multiplechoiceresponse']+counting['choiceresponse']+counting['stringresponse']
                }
              </span>题</div>
              <div className="total">
                <div className="total-block total-top">
                  <span className="first-span">题型</span>
                  <span>单选题</span>
                  <span>多选题</span>
                  <span>填空题</span>
                </div>
                <div className="total-block">
                  <span className="first-span">已选数量</span>
                  <span className="number">{counting['multiplechoiceresponse']}</span>
                  <span className="number">{counting['choiceresponse']}</span>
                  <span className="number">{counting['stringresponse']}</span>
                </div>
              </div>
            </div>
            <div style={{padding: '10px',textAlign: 'center'}}>
              {
                paperType == 'fixed' ?
                <Button type="primary" onClick={() => {this.fixed.confirm();this.props.setShow(false)}}>
                  选好了
                </Button>
                :
                <Button type="primary" onClick={() => { this.random.confirm();this.props.setShow(false)}}>
                  选好了
                </Button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  const { fixedTable, randomTable } = state;
  const selectQuestionList = Object.keys(fixedTable);
  const selectSectionList = randomTable.map(data => data.id);
  return {
    selectQuestionList,
    selectSectionList,
    fixedTable,
    randomTable,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setFixedTable: (data) => {
      dispatch(setFixedTable(data))
    },
    setRandomTable: (data) => dispatch(setRandomTable(data))
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(SelectQuestion)