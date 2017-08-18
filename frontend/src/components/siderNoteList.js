import React from 'react';
import { Menu, Icon, Input, Button, Popover, Row, Col, Popconfirm, Dropdown} from 'antd';

import noteManager from '../network/NoteManager.js';

import { stringIsInt } from '../utils/utils.js';

export default class SiderNoteList extends React.Component {
    state = {
        inputVisible: false
    }

    constructor(props) {
        super();
        this.groupAndNotes = [];
    }

    componentWillReceiveProps(nextProps) {
        this.groupAndNotes = noteManager.getCategory(nextProps.workspaceId, true);
    }

    findGroupId = (noteId) => {
        let group = this.groupAndNotes.find((group) => group.children.find((note) => noteId == note.id));
        return group ? group.id : null;
    }

    onGroupAdd = (name) => {
        noteManager.addCategory(name, this.props.workspaceId, (id) => {
            this.groupAndNotes = noteManager.getCategory(this.props.workspaceId, true);
            this.forceUpdate();
        });
    }

    onGroupDelete = (id) => {
        noteManager.delCategory(id, () => {
            this.groupAndNotes = noteManager.getCategory(this.props.workspaceId, true);
            this.forceUpdate();
            this.props.onNoteSelected(null);
        });
    }

    onNoteAdd = (group_id, type) => {
        if (type == 'markdown') {
            let defaultTitle = "未命名笔记...";
            let defaultContent = "# 未命名笔记...\n";
            noteManager.addNote(group_id, defaultTitle, defaultContent, type, (id) => {
                this.groupAndNotes = noteManager.getCategory(this.props.workspaceId, true);
                this.forceUpdate();
                this.props.onNoteSelected(id);
            });
        } else {
            console.log(type);
        }
    }

    handleInputConfirm = (e) => {
        let name = e.target.value.trim();
        if (name) {
            this.onGroupAdd(name);
        }
        this.setState({inputVisible: false});
    }

    render() {
        const onClick = (e) => {
            if (e.item && stringIsInt(e.key)) {
                let id = parseInt(e.key);
                this.props.onNoteSelected(id);
            }
        }


        const groupId = this.findGroupId(this.props.noteId);
        return (
            <Menu
                mode="inline"
                selectedKeys = { this.props.noteId == null ? [] : [this.props.noteId.toString()]}
                defaultOpenKeys = { groupId != null ? [groupId.toString()] : [] }
                style={{ height: '100%', borderRight: 0 }}
                onClick={ onClick }
            >

                <Input.Search
            placeholder="input search text"
            style={{ width: "92%", "margin-left": "4%"}}
            onSearch={value => console.log(value)}
                />
                {
                    this.groupAndNotes.map((group) => (
                        <Menu.SubMenu key={group.id} title={
                            <Popover content={
                                <Button.Group>
                                    <Dropdown overlay={
                                        <Menu onClick={ (e) => this.onNoteAdd(group.id, e.key) } >
                                            <Menu.Item key="markdown"><Icon size="small" type="copy" /> 笔记</Menu.Item>
                                            <Menu.Item key="scraps"><Icon size="small" type="appstore-o" /> 摘取</Menu.Item>
                                            <Menu.Item key="snippet"><Icon size="small" type="code-o" /> 代码</Menu.Item>
                                        </Menu>
                                    }>
                                        <Button size="small" icon="plus" />
                                    </Dropdown>
                                    <Popconfirm title={"确认删除" + group.name + "? "}
                                                      okText="是"
                                                      cancelText="否"
                                                      onConfirm={ () => this.onGroupDelete(group.id) }>
                                        <Button size="small" icon="delete"/>
                                    </Popconfirm>
                                </Button.Group>
                            }
                                             placement="topLeft"
                                             trigger="hover"
                                             mouseLeaveDelay="0.5"
                                >
                                <span><Icon type="folder" />{group.name}</span>
                            </Popover>
                        } >
                            {
                                group.children.map((note) => <Menu.Item key={note.id}>{note.title}</Menu.Item>)
                            }

                        </Menu.SubMenu>)
                    )
                }

                <Menu.Item key="add">
                    <Row type="flex" justify="center" >
                        <Col>
                        {
                            this.state.inputVisible ?
                            <Input
                                ref="input"
                                type="text"
                                size="small"
                                style={{ width: 78 }}
                                onBlur={ () => this.setState({inputVisible: false}) }
                                onPressEnter={this.handleInputConfirm}
                            />
                            :
                            <Button size="small"
                                    type="dashed"
                                    icon="plus"
                                    onClick={ () => this.setState({inputVisible: true}, () => this.refs.input.focus()) }
                            />
                        }
                        </Col>
                    </Row>
                </Menu.Item>
            </Menu>
        );
    }
}
