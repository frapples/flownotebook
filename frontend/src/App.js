import React from 'react';
import logo from './logo.svg';
import { Layout, Menu, Dropdown, Breadcrumb, Icon, DatePicker, message, Tag, Row, Col, Divider, Input, Popover, Button, Timeline, Card, Popconfirm } from 'antd';
import './App.css';
import './markdown.css';
import moment from 'moment';

import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';

import noteManager from './NoteManager.js';
import { markdown_h1_split } from './utils.js';

import 'moment/locale/zh-cn';
moment.locale('zh-cn');


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Content, Footer, Sider } = Layout;
const { MonthPicker, RangePicker } = DatePicker;


const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';

class SiderNoteList extends React.Component {
    constructor(props) {
        super();
        this.group_notes = [];
    }

    componentWillReceiveProps(nextProps) {
        this.group_notes = noteManager.getCategory(nextProps.workspace_id, true);
    }

    findGroupId = (note_id) => {
        let group = this.group_notes.find((group) => group.children.find((note) => note_id == note.id));
        return group ? group.id : null;
    }

    render() {
        const onClick = (e) => {
            if (e.item) {
                let id = parseInt(e.key);
                this.props.onNoteSelected(id);
            }
        }


        const group_id = this.findGroupId(this.props.note_id);
        return (
            <Menu
                mode="inline"
                selectedKeys = { this.props.note_id == null ? [] : [this.props.note_id.toString()]}
                defaultOpenKeys = { group_id != null ? [group_id.toString()] : [] }
                style={{ height: '100%', borderRight: 0 }}
                onClick={ onClick }
            >

                <Input.Search
            placeholder="input search text"
            style={{ width: "92%", "margin-left": "4%"}}
            onSearch={value => console.log(value)}
                />
                {
                    this.group_notes.map((group) => (
                        <SubMenu key={group.id} title={<span><Icon type="folder" />{group.name}</span>}>
                            {
                                group.children.map((note) => <Menu.Item key={note.id}>{note.title}</Menu.Item>)
                            }
                        </SubMenu>)
                    )
                }

                <Button size="small"
                        type="dashed"
                        icon="plus"
                        style= {{ 'margin-left':'50%', 'margin-right': '50%' }} />
            </Menu>
        );
    }
}

class NoteBookMenu extends React.Component {
    constructor(props) {
        super();
        this.notebooks = [];
    }

    componentWillReceiveProps = (nextProps) => {
        this.notebooks = noteManager.getCategory(-1);
    }

    currentName = () => {
        let id = this.props.notebook_id;
        let current = this.notebooks.find((b) => id == b.id);
        let current_name = current ? current.name : "";
        return current_name;
    }

    render() {
        const onSelect = (e) => {
            let id = parseInt(e.key);
            this.props.onSelected(id);
        }

        const menu = (
            <Menu onClick={ onSelect }
                defaultSelectedKeys = { [this.props.notebook_id.toString()] }
                selectedKeys = { [this.props.notebook_id.toString()] }
            >
                {
                    this.notebooks.map(
                        (book) => (<Menu.Item key={book.id} > {book.name} </Menu.Item>))
                }
            </Menu>
        );

        return (<Dropdown overlay={menu} >
            <div style={{ 'float': 'left', 'margin-right': '10px'}}>
                <Button type="primary" size="large" ghost>
                    <Icon type="book" />
                    { this.currentName() }笔记本
                </Button>
            </div>
        </Dropdown>);
    }
}

class WorkSpace extends React.Component {
    constructor(props) {
        super();
        this.workspaces = [];
        this.notebooks = [];

        this.updateData(props.notebook_id);
    }

    componentWillReceiveProps = (nextProps) => {
        this.updateData(nextProps.notebook_id);
    }

    updateData = (notebook_id) => {
        this.notebooks = noteManager.getCategory(-1);
        this.workspaces = noteManager.getCategory(notebook_id);
    }

    onAdd = (name) => {
        message.info("添加工作区" + name);
        noteManager.addCategory(name, this.props.notebook_id, (id) => {
            this.updateData(this.props.notebook_id);
            this.forceUpdate();
        });
    }

    onDelete = () => {
        message.info("删除工作区" + this.props.workspace_id);
        noteManager.delCategory(this.props.notebook_id, this.props.workspace_id,
                                () => {
                                    this.updateData(this.props.notebook_id);
                                    this.forceUpdate();
                                });
    }

    onMove = (notebook_id) => {
        message.info("移动" + this.props.workspace_id + "到" + notebook_id);
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
            defaultSelectedKeys={[this.props.workspace_id.toString()]}
            selectedKeys = { this.props.workspace_id == null ? [] : [this.props.workspace_id.toString()]}
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
                                          empty = {this.workspaces.length == 0}
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
                if (e.key == "add") {
                    this.setState({ inputVisible: true }, () => this.refs.input.focus());
                } else if (e.key == 'delete') {
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
                        <Menu.Item key="delete" disabled={this.props.empty ? true : false}>
                            <Popconfirm title="确认删除?" okText="是" cancelText="否" onConfirm={ this.props.onDelete }>
                                <div>
                                    <Icon type="delete" />
                                    删除
                                </div>
                            </Popconfirm>
                        </Menu.Item>

                        <SubMenu key="sub1" disabled={this.props.empty ? true : false} title={<span>移动到</span>}>
                            {
                                this.props.notebooks.map((notebook) => (
                                    <Menu.Item key={notebook.id}>{notebook.name}</Menu.Item>))
                            }
                        </SubMenu>
                    </Menu>

                }>
                    <Button size="small" icon="menu-unfold" ghost />
                </Dropdown>
            } </Button.Group>);
    }
}

class NoteTags extends React.Component {
    constructor(props) {
        super();
        this.state = {
            inputVisible: false,
            tags: props.tags.slice(0)
        }
    }

    handleInputChange = (e) => {
    }

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }

    handleInputConfirm = (e) => {
        let tags = this.state.tags;
        let new_tag = e.target.value.trim();
        if (new_tag) {
            if (this.state.tags.indexOf(new_tag) < 0) {
                tags = [...this.state.tags, new_tag];
            } else {
                message.info("标签" + new_tag + "已经存在，无需添加。");
            }
        }
        this.setState({
            inputVisible: false,
            colors: this.state.colors,
            tags: tags
        });

    }

    render() {
        let colors = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple'];
        let i = 0;
        const next_color = () => colors[(i++) % colors.length];

        return (
            <Row>
                <Col>
                    {
                        this.state.tags.map((tag) =>
                            <div style={{ "padding-top": "3px", "float": "left" }}>
                                <Tag color={ next_color() } closable>
                                    <span> <Icon type="tag-o" style={{ 'padding-right': '2px' }} />{ tag } </span>
                                </Tag>
                            </div>
                        )

                    }

                    <div style={{ "padding-top": "3px", "float": "left" }}>
                        {
                            this.state.inputVisible ?
                            <Input
                                ref={ (input) => this.input = input /* 将本组件对象绑定到 this.input 上来 */ }
                                type="text"
                                size="small"
                                style={{ width: 78 }}
                                onChange={this.handleInputChange}
                                onBlur={this.handleInputConfirm}
                                onPressEnter={this.handleInputConfirm}
                            />
                            :
                            <Button size="small" type="dashed" onClick={this.showInput}>+</Button>
                        }
                    </div>
                </Col>
            </Row>
        );
    }
}

class Note extends React.Component {
    state = {
        note_content: '',
        note_tags: []
    }

    constructor(props) {
        super();
        this.updateData(props.note_id);
    }

    componentWillReceiveProps (nextProps) {
        this.updateData(nextProps.note_id);
    }

    updateData = (id) => {
        if (id != null) {
            noteManager.fetchNote(id, (note) => {
                this.setState({'note_content': note.content, 'note_tags': note.tags});
            });
        }
    }

    render() {
        const tags = ['java', 'web', '编程', 'servlet', 'MySQL', 'Tomcat'];
        let result = markdown_h1_split(this.state.note_content);
        let h1 = result.h1;
        let content_remain = result.remain;

        const updated_log = (
            <Timeline>
                <Timeline.Item>2017-09-01 增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2016-09-03增加了9行，删除了1行。</Timeline.Item>
                <Timeline.Item>2015-09-01增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2015-07-01 创建笔记。 </Timeline.Item>
            </Timeline>
        );

        return (
            <Card bodyStyle={{ 'padding-top': '5px' }} title = {
                <Row type="flex" justify="space-between" align="middle">
                    <Col>
                        <h1 style={{ "display": "inline"}}>{ h1 }</h1>
                        <Button icon="edit" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                        <Popover content={updated_log} title="修改记录">
                            <Button icon="line-chart" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                        </Popover>
                    </Col>
                    <Col>
                        <DatePicker defaultValue={moment('2017-01-01', dateFormat)} format={dateFormat} />
                    </Col>
                </Row>
            } extra={ "" } style={{ }}>
            <div style={{ 'padding-bottom': '5px'}}>
                <NoteTags tags= { tags } />
            </div>
            <Row>
                <Col span={20}>
                    <ReactMarkdown
                        className="markdown"
                        source={ content_remain } />
                </Col>
                <Col span={4}>
                    <Card bodyStyle = {{ padding: '10px', 'min-height': 0 }} className="toc toc-anchor">
                        <ul>
                            <li><a herf="#">开发环境配置</a></li>
                            <li><a herf="#">servlet API介绍</a></li>
                        </ul>
                    </Card>
                </Col>
            </Row>
            </Card>
        );
    }
}
class App extends React.Component {
    state = {
        notebook_id: 0,
        workspace_id: 0,
        note_id: 0,

        loading: true
    }

    constructor() {
        super();

        this.defaultSelectedWorkspace = {};
        this.defaultSelectedNote = {};

        const initDefaultSelected = (tree) => {
            tree.forEach((notebook) => {
                if (notebook.children.length > 0) {
                    this.defaultSelectedWorkspace[notebook.id] = notebook.children[0].id;
                } else {
                    this.defaultSelectedWorkspace[notebook.id] = null;
                }

                notebook.children.forEach((workspace) => {
                    this.defaultSelectedNote[workspace.id] = null;
                    workspace.children.forEach((group) => {
                        if (group.children.length > 0 && this.defaultSelectedNote[workspace.id] == null) {
                            this.defaultSelectedNote[workspace.id] = group.children[0].id;
                        }
                    })
                })
            });
        };

        noteManager.initTree((tree) => {
            initDefaultSelected(tree);
            let defaultNotebookId = tree[0].id;
            this.setState({
                'notebook_id': defaultNotebookId,
                'workspace_id': this.defaultSelectedWorkspace[defaultNotebookId],
                'note_id': this.defaultSelectedNote[this.defaultSelectedWorkspace[defaultNotebookId]],
                'loading': false
            });
        });

    }

    onNotebookChanged = (id) => {
        this.setState({'notebook_id': id,
                       'workspace_id': this.defaultSelectedWorkspace[id],
                       'note_id': this.defaultSelectedNote[this.defaultSelectedWorkspace[id]],
        });
    }

    onWorkspaceChanged = (id) => {
        this.defaultSelectedWorkspace[this.state.notebook_id] = id;
        this.setState({'workspace_id': id,
                       'note_id': this.defaultSelectedNote[id]
        });

        /* message.info('切换工作区');*/
    }

    onNoteChanged = (id) => {
        this.defaultSelectedNote[this.state.workspace_id] = id;
        this.setState({'note_id': id});
    }

    render() {
        return (
            <Layout>
                <Header>
                    {/* <div className="logo" /> */}
                    <NoteBookMenu ref="notebook"
                                  notebook_id={this.state.notebook_id}
                                  onSelected = { this.onNotebookChanged }/>
                    <WorkSpace ref="workspace"
                               notebook_id = {this.state.notebook_id }
                               workspace_id = {this.state.workspace_id }
                               onSelected = { this.onWorkspaceChanged } />
                </Header>

                <Layout>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <SiderNoteList ref="sidernotelist" workspace_id = {this.state.workspace_id}
                                       note_id = {this.state.note_id}
                                       onNoteSelected = { this.onNoteChanged } />
                    </Sider>

                    <Layout style={{ padding: '15px 15px 15px' }}>
                        <Note ref="note" note_id = {this.state.note_id} />
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

export default App;
