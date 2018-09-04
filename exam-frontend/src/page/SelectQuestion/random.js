import React, { Component } from 'react';
import { Table, Button } from 'antd';
export default class RandomBlock extends Component {
  state = {
    selectedRowKeys: [],
  }
  confirm = () => {
    const { callback } = this.props;
    const { selectedRowKeys } = this.state;
    callback(selectedRowKeys);
  }
  render(){
    const { sectionList, loading } = this.props;
    const { selectedRowKeys } = this.state;
    const  stochasticColumns = [{
        title: '全选本页',
        dataIndex: 'name',
        // eslint-disable-next-line
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: '单选题',
        dataIndex: 'radio',
      },
      {
        title: '多选题',
        dataIndex: 'multiple',
      },
      {
        title: '判断题',
        dataIndex: 'checking',
      },
      {
        title: '填空题',
        dataIndex: 'completion',
      },
    ];
    const stochasticRowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
        })
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return(
      <div>
        <Table
          bordered={true}
          rowSelection={stochasticRowSelection}
          columns={stochasticColumns}
          dataSource={sectionList}
          size="small"
          rowKey="id"
          loading={loading}
        />
      </div>
    )
  }
}