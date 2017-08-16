import React from 'react';
import noteManager from '../network/NoteManager.js';
import { Menu, Dropdown, Icon, message, Input, Button, Popconfirm} from 'antd';


export default class WorkSpace extends React.Component {

    constructor(props) {
        super();
        this.workspaces = [];
        this.notebooks = [];

        this.updateData(props.notebookId);
    }

    componentWillReceiveProps = (nextProps) => {
        this.updateData(nextProps.notebookId);
    }

    updateData = (notebookId) => {
        this.notebooks = noteManager.getCategory(-1);
        this.workspaces = noteManager.getCategory(notebookId);
    }

    onAdd = (name) => {
        noteManager.addCategory(name, this.props.notebookId, (id) => {
            this.updateData(this.props.notebookId);
            this.forceUpdate();
        });
    }

    onDelete = () => {
        noteManager.delCategory(this.props.workspaceId,
                                () => {
                                    this.updateData(this.props.notebookId);
                                    this.forceUpdate();
                                    this.props.onSelected(null);
                                });
    }

    onMove = (notebookId) => {
        noteManager.moveCategory(notebookId, this.props.workspaceId,
                                 () => {
                                     this.updateData(this.props.notebookId);
                                     this.forceUpdate();
                                     this.props.onSelected(null);
                                 });
    }

    render() {
        const onSelect = (e) => {
            if (e.item) {
                let id = parseInt(e.key);
                this.props.onSelected(parseInt(id));
            }
        }

        return (
            <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[this.props.workspaceId.toString()]}
            selectedKeys = { this.props.workspaceId === null ? [] : [this.props.workspaceId.toString()]}
            onSelect={ onSelect  }
            style={{ lineHeight: '64px', 'font-size': '14px' }} >
            {
                this.workspaces.map(
                    (workspace) => <Menu.Item key={workspace.id}> {workspace.name} </Menu.Item>)
            }
                <WorkSpaceOperateDropdown notebooks={this.notebooks}
                                          onAdd = {this.onAdd}
                                          onDelete = {this.onDelete}
                                          onMove = {this.onMove}
                                          empty = {this.workspaces.length === 0}
                                          style={{ 'margin-left': "10px" }} />
            </Menu>
        );
    }
}

class WorkSpaceOperateDropdown extends React.Component {
    state = {
        inputVisible: false,
    }

    handleInputConfirm = (e) => {
        this.props.onAdd(e.target.value);
        this.setState({inputVisible: false});
    }

    render() {
        const onClick = (e) => {
            if (e.item) {
                if (e.key === "add") {
                    this.setState({ inputVisible: true }, () => this.refs.input.focus());
                } else if (e.key === 'delete') {
                    /* this.props.onDelete();*/
                } else {
                    this.props.onMove(parseInt(e.key));
                }
            }
        }

        return (
            <Button.Group style={ this.props.style }>
            {
                this.state.inputVisible ?
                <Input
                    ref="input"
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    onChange={this.handleInputChange }
                    onBlur={ () => this.setState({'inputVisible': false}) }
                    onPressEnter={this.handleInputConfirm }/ >
                :
                <Dropdown overlay={
                    <Menu onClick={onClick} style={{ width: 70 }} selectedKeys={[]} >

                        <Menu.Item key="add"><Icon type="plus" />添加</Menu.Item>
                        <Menu.Item key="delete" disabled={this.props.empty ? true : false} >
                            <Popconfirm title="确认删除?" okText="是" cancelText="否" onConfirm={ this.props.onDelete }>
                                <div>
                                    <Icon type="delete" />
                                    删除
                                </div>
                            </Popconfirm>
                        </Menu.Item>

                        <Menu.SubMenu key="sub1" disabled={this.props.empty ? true : false} title={<span>移动到</span>}>
                            {
                                this.props.notebooks.map((notebook) => (
                                    <Menu.Item key={notebook.id}>{notebook.name}</Menu.Item>))
                            }
                        </Menu.SubMenu>
                    </Menu>

                }>
                    <Button size="small" icon="menu-unfold" ghost />
                </Dropdown>
            } </Button.Group>);
    }
}
