import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import $ from "jquery";
import PreviewContainer from '../../components/Preview';

export default class Preview extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeigh,
    showBackToTop: false,
  }

  componentDidMount() {
    const that = this;
    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })


  }

  onChangeUpBtn = (val) => {
    this.setState({
      showBackToTop: val,
    })
  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px', minWidth: '649px' }
    return (
      <div>
        <Header changeUpBtn={this.onChangeUpBtn} />
        <div className="container" style={containerHeight}>
          <PreviewContainer showBackToTop={this.state.showBackToTop} />
        </div>
        <Footer />
      </div>
    );
  }
}