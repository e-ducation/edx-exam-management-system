
import React, { Component } from 'react';
import { Table, Input, Icon, Breadcrumb, Dropdown, Menu, Button } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import axios from 'axios';
import FixedQuestion from './fixed';
import RandomQuestion from './random';
export default class SelectQuestion extends Component {
  state = {
    courseList: [],
    sectionList: [],
    courseSearch: '',
    keySearch: '',
    questionList: [],
    selectedList: [],
    selectedRowKeys: [],
    selectedRowData: {},
    activeChapter: '全部章节',
    activeCourse: '',
    activeQuestionType: '全部题型',
    selectType: 'immobilization'// immobilization|stochastic

  }
  componentDidMount() {
    this.getCourses();
    this.random = {}
  }
  fixedInit = () => {
    // const { data } = this.props;
    // const selectedRowKeys = Object.keys(data).map(key => {
    //   return data.id
    // });
    // this.setState({

    // })
  }
  // 获取课程列表
  getCourses = () => {
    axios.get('/api/courses/')
      .then( ({data}) => {
        if (data.length > 0) {
          this.setState({
            courseList: data,
            activeCourse: data[0].id,
          })
          this.getList(data[0].id);
        } else {

        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 课程名称获取题目列表
  getList = (course) => {
    this.getSection(course);
    axios.get(`/api/courses/${course}/problems/`)
      .then( ({data}) => {
        this.setState({
          questionList: data,
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 获取章节列表
  getSection = (id) => {
    axios.get(`/api/courses/${id}/sections/`)
      .then( ({data}) => {
        this.setState({
          sectionList: data,
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 回调设置勾选的题目
  onSelect = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  }
  sectionSelect = (selectedRowKeys) => {
    // this.setSta
  }
  // 切换课程
  changeCourse = (course) => {
    this.getList(course)
    this.setState({
      activeCourse: course,
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
  getQuestionData = (params) => {
    const { activeCourse, activeChapter, activeQuestionType, keySearch } = this.state;
    console.log('activeCourse',activeCourse)
    console.log('activeChapter',activeChapter)
    console.log('activeQuestionType',activeQuestionType)
    console.log('keySearch',keySearch)
    axios.get(`/api/courses/${activeCourse}/problems/`, {
        params,
      })
      .then( ({data}) => {
        this.setState({
          questionList: data,
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
    const {courseList, activeCourse, sectionList, questionList, } = this.state;
    const type = false;
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
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <Input prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入关键字" style={{ width: "190px" }} />
            </div>
            <ul className="course-list">
              {
                 // 课程列表
                courseList.map(data => {
                  return <li key={data.id} className={activeCourse == data.id ? 'active': ''} onClick={this.changeCourse.bind(this, data.id)}>{data.display_name}</li>
                })
              }
            </ul>
          </div>
          <div className="main">
            <div className="course-name">大数据分析</div>
            {
              type ?
              // 固定出题
              <FixedQuestion
                ref={node => this.fixed = node}
                getList={this.getQuestionData} // 列表数据获取回调函数
                activeCourse={activeCourse} // 选中的课程ID
                sectionList={sectionList}   // 章节列表
                questionList={questionList} // 问题
                callback={this.onSelect}    // 回调函数
                />
              :
              <RandomQuestion
                ref={node => this.random = node}
                activeCourse={activeCourse} // 选中的课程ID
                sectionList={sectionList}   // 章节列表
                questionList={questionList} // 问题
                callback={this.sectionSelect}
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
            {
              type ?
              <Button onClick={this.fixed.confirm.bind(this)}>
                选好了
              </Button>
              :
              <Button onClick={() => { this.random.confirm()}}>
                选好了
              </Button>
            }
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}