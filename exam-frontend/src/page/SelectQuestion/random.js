import React, { Component } from 'react';
import { Table } from 'antd';
import none from "../../assets/images/none.png";
export default class RandomBlock extends Component {
  state = {
    selectedRowKeys: [],
  }
  componentDidMount(){
    this.setState({
      selectedRowKeys: this.props.selectedRowKeys,
    })
  }
  componentWillReceiveProps(nextProps) {
    if( JSON.stringify(this.props.selectedRowKeys) !== JSON.stringify(nextProps.selectedRowKeys)){
      this.setState({
        selectedRowKeys: nextProps.selectedRowKeys,
      })
    }
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
        dataIndex: 'multiplechoiceresponse',
      },
      {
        title: '多选题',
        dataIndex: 'choiceresponse',
      },
      {
        title: '填空题',
        dataIndex: 'stringresponse',
      },
    ];
    const stochasticRowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
        })
        this.props.countType(selectedRowKeys)
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return(
      <div className="random page">
        <Table
          bordered={true}
          rowSelection={stochasticRowSelection}
          columns={stochasticColumns}
          dataSource={sectionList}
          size="small"
          rowKey="id"
          loading={loading}
          pagination={{showTotal: (z)=> `共${z}条记录`}}
          locale={{ emptyText: <div style={{marginBottom: '35px'}}><img src={none} style={{width: '125px', margin: '30px 0 20px'}} alt="" /><div>暂无数据</div></div> }}
        />
      </div>
    )
  }
}