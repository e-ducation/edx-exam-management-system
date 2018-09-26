import { Switch, Route } from 'react-router-dom';
import React, { Component } from 'react';
import Home from '../page/Home';
import Roster from '../components/Roster';
import SelectQuestion from '../page/SelectQuestion';
import Manage from '../page/Manage';
import Preview from '../page/Preview';
import Edit from '../page/Edit';
import RandomExam from '../page/RandomExam';
import Task from '../page/Task';
import TextTask from '../page/TextTask';
import Statistics from '../page/Statistics';

// 我的考生
import HomeStudent from '../page/HomeStudent';
import ManageStudent from '../page/ManageStudent';
import Examing from '../page/Examing';
// import { deflateRaw } from 'zlib';


export default class Main extends Component {
  render() {
    return (<main>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/roster' component={Roster} />
        <Route path='/question' component={SelectQuestion} />
        <Route path='/edit/:id' component={Edit} />
        <Route path='/new/fix' component={Edit} />
        <Route path='/new/random' component={RandomExam} />
        <Route path='/manage' component={Manage} />
        <Route path='/preview/:id' component={Preview} />
        <Route path='/createTask' component={Task} />
        <Route path='/task/:id' component={Task} />
        <Route path='/task' component={TextTask} />
        <Route path='/statistics' component={Statistics} />
        <Route path='/student' component={HomeStudent} />
        <Route path='/student_manage' component={ManageStudent} />
        <Route path='/examing/:id' component={Examing} />
      </Switch>
    </main>)
  }
}
