import React, { Component } from 'react';
export default class Footer extends Component {
    render() {
      const { fixbottom}  = this.props;
      return (
        <div className={`footer ${fixbottom ? 'fixbottom' : ''}`}>
          <div className="copyright">© Copyright 2018 E-ducation Copyright 粤ICP备13044168号-3</div>
        </div>);
    }
  }