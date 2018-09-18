import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Breadcrumb, Icon, Button } from 'antd'
import './index.scss';
import Preview from './preview';
export default class Task extends React.Component {
  state = {
    preview: false,
    create: true,
    id: 0,
  }
  componentWillMount() {
    console.log(this.props.match.params);
    const { id } = this.props.match.params;
    if (id != undefined) {
      this.setState({
        id,
        create: false,
        preview: true,
      });
    }
  }
  edit = () => {
    this.setState({
      preview: false,
    })
  }
  render() {
    const { create, preview } = this.state;
    return (
      <div>
        <Header />
        <div className="task container">
          <div className="displayFlx">
            <Sidebar />
            <div className="main-content">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Icon type="home" theme="outlined" style={{ fontSize: '14px', marginRight: '2px' }} />
                  <span>首页</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <i className="iconfont" style={{ fontSize: '12px', marginRight: '5px' }}>&#xe62e;</i>
                  <span>考试任务</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Icon type="edit" style={{ marginRight: '5px' }} />
                  <span>
                    {
                      create === true ?
                        '新建考试任务'
                        :
                        '考试任务详情'
                    }
                  </span>
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="paper-title">
                {
                  create === true ?
                    '新建考试任务'
                    :
                    '考试任务详情'
                }
                {
                  preview === true &&
                  <Button onClick={this.edit} icon="edit" className="edit-btn">
                    编辑
                  </Button>
                }
              </div>
              {
                preview === true ?
                  <Preview />
                  :
                  <div>
                    {
                      create === false &&
                      <Button onClick={() => { this.setState({ preview: true }) }}>
                        返回
                      </Button>
                    }
                  </div>
              }
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}