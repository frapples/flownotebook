import React from 'react';
import logo from './logo.svg';
import { Layout, Menu, Dropdown, Breadcrumb, Icon, DatePicker, message, Tag, Row, Col, Divider, Input, Popover, Button, Timeline, Card } from 'antd';
import './App.css';
import './markdown.css';
import moment from 'moment';

import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';

import NoteManager from './NoteManager.js';
import { markdown_h1_split, fetch_post } from './utils.js';

import 'moment/locale/zh-cn';
moment.locale('zh-cn');


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Content, Footer, Sider } = Layout;
const { MonthPicker, RangePicker } = DatePicker;


const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';

class SiderNoteList extends React.Component {
    render() {
        return (
            <Menu
                mode="inline"
                defaultSelectedKeys={[this.props.note_id.toString(), ]}
                defaultOpenKeys={[this.props.group_id.toString(), ]}
                style={{ height: '100%', borderRight: 0 }}
                onClick={ (e) => { e.item ? this.props.onNoteSelected(parseInt(e.key)) : null  }}
            >

            <Input.Search
            placeholder="input search text"
            style={{ width: "92%", "margin-left": "4%"}}
            onSearch={value => console.log(value)}
            />
                {
                    this.props.group_notes.map((group) => (
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
    render() {
        let current = this.props.notebooks.find((b) => this.props.notebook_id == b.id);
        let current_name = current ? current.name : "";


        const menu = (
            <Menu onClick={ (e) => this.props.onSelected(parseInt(e.key)) }>
                {
                    this.props.notebooks.map(
                        (book) => (<Menu.Item key={book.id} > {book.name} </Menu.Item>))
                }
            </Menu>
        );

        return (<Dropdown overlay={menu} >
                <div style={{ 'float': 'left', 'margin-right': '10px'}}>
                    <Button type="primary" size="large" ghost>
                        <Icon type="book" />
                        { current_name }笔记本
                    </Button>
                </div>
            </Dropdown>);
    }
}

class WorkSpace extends React.Component {
    render() {
        return (
            <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[this.props.workspace_id.toString()]}
                onSelect={ (e) => this.props.onSelected(parseInt(e.key)) }
            style={{ lineHeight: '64px', 'font-size': '14px' }} >
                {
                    this.props.workspaces.map(
                        (workspace) => <Menu.Item key={workspace.id}>{workspace.name}</Menu.Item>
                    )
                }
             <Button icon="plus" style={{ "margin-left": "5px" }} ghost />
            </Menu>
        );
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

class App extends React.Component {
    state = {
        notebook_id: 0,
        workspace_id: 0,
        group_id: 1,
        note_id: 0,

        notebooks: [],
        workspaces: [],
        group_notes: [],

        note_content: "",
        note_tags: []
    }

    constructor() {
        super();
    }

    fetchCategory = (id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/category_children', {'id': id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    }

    fetchNote = (id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/note_get', {id: id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    }

    componentDidMount = () => {
        this.fetchCategory(-1, (notebooks) => {
            this.setState({'notebooks': notebooks});
            this.setNotebookId(notebooks[0].id);
        });
    }

    setNotebookId = (id) => {
        this.setState({'notebook_id': id});

        this.fetchCategory(id, (workspaces) => {
                this.setState({'workspaces': workspaces});
                this.setWorkspaceId(workspaces[0].id);
        });
    }

    setWorkspaceId = (id) => {
        this.setState({'workspace_id': id});

        let onFetched = (group_notes) => {
            this.setState({'group_notes': group_notes});
        }

        this.fetchCategory(id, (groups) => {
            let func = (i) => {
                if (i < groups.length) {
                    this.fetchCategory(groups[i].id, (notes) => {
                        groups[i].children = notes;
                        func(i + 1);
                    });
                } else {
                    onFetched(groups);
                }
            };
            func(0);
        });
    }

    setNoteId = (id) => {
        this.setState({'note_id': id});
        this.fetchNote(id, (note) => {
            this.setState({'note_content': note.content, 'note_tags': note.tags});
        });
    };

    onNotebookChanged = (key) => {
        this.setNotebookId(key);

        let notebook = this.state.notebooks.find((b) => b.id == key);
        message.info('选择笔记本' + notebook.name);
    }

    onWorkspaceChanged = (key) => {
        this.setState({workspace_id: key});
        message.info('切换工作区');
    }

    onNoteChanged = (key) => {
        this.setNoteId(key);
    }

    render() {
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

        const tags = ['java', 'web', '编程', 'servlet', 'MySQL', 'Tomcat'];
        return (
            <Layout>
                <Header>
                    {/* <div className="logo" /> */}
                    <NoteBookMenu
                    notebooks = {this.state.notebooks}
                    notebook_id = {this.state.notebook_id}
                        onSelected = { this.onNotebookChanged }/>
                    <WorkSpace
                    workspaces = { this.state.workspaces }
                    workspace_id = {this.state.workspace_id}
                        onSelected = { this.onWorkspaceChanged } />
                </Header>

                <Layout>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <SiderNoteList
                            group_id = {this.state.group_id}
                            note_id = {this.state.note_id}
                            group_notes = { this.state.group_notes }
                            onNoteSelected = { this.onNoteChanged }
                        />
                    </Sider>

                    <Layout style={{ padding: '15px 15px 15px' }}>
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
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

export default App;
