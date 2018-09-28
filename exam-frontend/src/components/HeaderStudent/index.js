import React from 'react';
import $ from 'jquery';
export default class HeaderStudent extends React.Component {
  state = {
    showShadow: false,
  }

  componentDidMount() {
    this.scroll = () => {
      const old = this.state.showShadow;
      const now = ($(window).height() !== $(document).height()) && $(document).scrollTop() > 0;
      if (old === now) {
        return false;
      }

      this.setState({
        showShadow: now
      })

      if (this.props.changeUpBtn) {
        this.props.changeUpBtn(now);
      }
    }
    $(document).scroll(this.scroll)
  }

  componentWillUnmount() {
    $(document).unbind('scroll', this.scroll)
  }

  render() {
    const { share } = this.props;
    const width = $(document).width() + 6 + 'px';
    return (
      <div className="header">
        <div className="header-wrap" style={this.state.showShadow ? { boxShadow: '0px -1px 7px 0px rgba(0,0,0,.5)', width, borderBottom: 'none' } : { width }}>
          <div className="header-content">
            <a href="/#/student" style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
              <div className="header-logo">
                <i className="iconfont" style={{ color: '#fff', fontSize: '20px' }}>&#xe62c;</i>
              </div>
              <span className="logo-text">我的考试</span>
            </a>
            {
              !share &&
              <div className="link-menu">
                <a className="text-link" href="http://dev.ems.lms.ngrok.elitemc.cn:8000/">
                  学习中心<i className="iconfont" style={{ verticalAlign: 'middle', fontSize: '14px', marginLeft: '10px' }}>&#xe62a;</i>
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}