import React from 'react';
import { Button } from 'antd';
export default class Preview extends React.Component {
  render() {
    return (
      <div className="task-content">
        <div className="task-row">
          <div className="task-label">
            已选试卷
          </div>
          <div className="task-item">
            <div>母婴知识答题 <Button style={{ position: "absolute", top: '-10px', marginLeft: '30px' }} type="primary">预览试卷</Button></div>
            <div className="paper-info">
              此试卷为快照，保存于10月1日
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
                <span className="number">{3}</span>
                <span className="number">{1}</span>
                <span className="number">{2}</span>
                <span className="number">{2}</span>
              </div>
              <div className="total-block">
                <span className="first-span">分数</span>
                <span className="number">{3}</span>
                <span className="number">{1}</span>
                <span className="number">{2}</span>
                <span className="number">{2}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            及格线
          </div>
          <div className="task-item">
            60%
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            考试名称
          </div>
          <div className="task-item">
            母婴知识竞赛A卷第一次考试
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            考试周期
          </div>
          <div className="task-item">
            2018年9月14日 - 2018年10月15日
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            答卷试卷
          </div>
          <div className="task-item">
            30分值
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
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
                <span>企业人员1</span>
              </div>
            </div>

          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            题目排序
          </div>
          <div className="task-item">
            是
          </div>
        </div>
        <div className="task-row">
          <div className="task-label">
            查看答案
          </div>
          <div className="task-item">
            否
          </div>
        </div>
      </div>
    )
  }
}