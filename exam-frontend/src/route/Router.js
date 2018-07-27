import { Switch, Route } from 'react-router-dom';
import React, { Component } from 'react';
import Home from '../page/Home';
import Roster from '../components/Roster';
import SelectQuestion from '../page/SelectQuestion';
import Manage from '../page/Manage';
import Preview from '../page/Preview';
import Edit from '../page/Edit';
// import { deflateRaw } from 'zlib';


export default class Main extends Component {
  render() {
    return (<main>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/roster' component={Roster} />
        <Route path='/question' component={SelectQuestion} />
        <Route path='/edit' component={Edit} />
        <Route path='/manage' component={Manage} />
        <Route path='/preview' component={Preview} />
      </Switch>
    </main>)
  }
}
