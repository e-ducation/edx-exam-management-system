import React from 'react';
import { Button } from 'antd';
import moment from 'moment';
export default class Preview extends React.Component {
  render() {
    const { task } = this.props;
    const { problem_statistic = {}} = task;
    console.log(problem_statistic, task.modified)
    return (
      <div className="task-content">
        <div className="task-row">
          <div className="task-label">
            已选试卷
          </div>
          <div className="task-item">
            <div>{task.exampaper_name} <Button style={{ position: "absolute", top: '-10px', marginLeft: '30px' }} type="primary">预览试卷</Button></div>
            <div className="paper-info">
              {
                task.modified !== undefined &&  task.modified !== '' &&
                `此试卷为快照，保存于${moment(task.modified).format('YYYY年MM月DD日 HH时mm分')}`
              }
            </div>
            <div className="total">
              <div className="total-block total-top">
                <span className="first-span">题型</span>
                <span>单选题</span>
                <span>多选题</span>
                <span>填空题</span>
                <span>合计</span>
              </div>
              <div className="total-block">
                <span className="first-span">数量</span>
                <span className="number">{problem_statistic.multiplechoiceresponse_count}</span>
                <span className="number">{problem_statistic.choiceresponse_count}</span>
                <span className="number">{problem_statistic.stringresponse_count}</span>
                <span className="number">{task.exampaper_total_problem_num}</span>
              </div>
              <div className="total-block">
                <span className="first-span">分数</span>
                <span className="number">{problem_statistic.multiplechoiceresponse_grade || 0}</span>
                <span className="number">{problem_statistic.choiceresponse_grade || 0}</span>
                <span className="number">{problem_statistic.stringresponse_grade || 0}</span>
                <span className="number">{task.exampaper_total_grade || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            及格线
          </div>
          <div className="task-item">
            {task.exampaper_passing_ratio}%
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            考试名称
          </div>
          <div className="task-item">
            {task.name}
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            考试周期
          </div>
          <div className="task-item">
            {moment(task.period_start).format('YYYY年MM月DD日')}
            -
            {moment(task.period_end).format('YYYY年MM月DD日')}
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            答卷时间
          </div>
          <div className="task-item">
            {task.exam_time_limit}分钟
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            参与人员
          </div>
          <div className="task-item">
            <div className="participate">
              <div style={{ minWidth: '60px' }}>成员：</div>
              <div>
                {
                  task.participants.map(item => {
                    return (<span key={item.username}>{item.username}</span>)
                  })
                }
              </div>
            </div>

          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            题目排序
          </div>
          <div className="task-item">
            {
              task.problem_disorder ? '是' : '否'
            }
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            查看答案
          </div>
          <div className="task-item">
            {
              task.show_answer ? '是' : '否'
            }
          </div>
        </div>
      </div>
    )
  }
}