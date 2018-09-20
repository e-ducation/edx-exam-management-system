import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import $ from "jquery";
import StatisticsContainer from './statistics'

export default class Statistics extends React.Component {
  state = {
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  }

  componentDidMount() {
    const that = this;

    $(window).resize(() => {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      that.setState({ height })
    })

  }

  render() {
    const containerHeight = { minHeight: this.state.height - 186 + 'px' }
    return (
      <div>
        <Header />
        <div className="container" style={containerHeight}>
          <StatisticsContainer />
        </div>
        <Footer />
      </div>
    );
  }
}