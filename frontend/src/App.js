import React from 'react';
import logo from './logo.svg';
import { Layout, Menu, Dropdown, Breadcrumb, Icon, DatePicker, message, Tag, Row, Col, Divider, Input, Popover, Button, Timeline, Card } from 'antd';
import './App.css';
import './markdown.css';
import moment from 'moment';

import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';

import NoteManager from './NoteManager.js';
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
                    this.props.group_struct.map((group, group_key) => (
                        <SubMenu key={group_key} title={<span><Icon type="folder" />{group.name}</span>}>
                            {
                                group.children.map((note) => <Menu.Item key={note.key}>{note.name}</Menu.Item>)
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
        const menu = (
            <Menu onClick={ (e) => this.props.onSelected(parseInt(e.key)) }>
                {
                    this.props.notebooks.map(
                        (name, key) => (<Menu.Item key={key} > {name} </Menu.Item>))
                }
            </Menu>
        );

        return (<Dropdown overlay={menu} >
                <div style={{ 'float': 'left', 'margin-right': '10px'}}>
                    <Button type="primary" size="large" ghost>
                        <Icon type="book" />
                        { this.props.notebooks[this.props.notebook_id] }笔记本
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
                        (name, key) => <Menu.Item key={key}>{name}</Menu.Item>
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
    }

    constructor() {
        super();
        this.note_manager = new NoteManager();
        this.note_manager.onDataChanged.push(
            (e) => {
                this.forceUpdate();
            });
    }

    onNotebookChanged = (key) => {
        this.setState({notebook_id: key, note_id: -1});
        message.info('选择笔记本' + this.note_manager.get_notebooks()[key]);
    }

    onWorkspaceChanged = (key) => {
        this.setState({workspace_id: key, note_id: -1});
        message.info('选择工作区' + this.note_manager.get_workspaces(this.state.notebook_id)[key]);
    }

    onNoteChanged = (key) => {
        this.setState({note_id: key});
    }

    render() {
        const markdown_result = () => markdown_h1_split(this.note_manager.get_note_content(this.state.note_id));

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
                    notebooks = {this.note_manager.get_notebooks()}
                    notebook_id = {this.state.notebook_id}
                        onSelected = { this.onNotebookChanged }/>
                    <WorkSpace
                    workspaces = {this.note_manager.get_workspaces(this.state.notebook_id)}
                    workspace_id = {this.state.workspace_id}
                        onSelected = { this.onWorkspaceChanged } />
                </Header>

                <Layout>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <SiderNoteList
                            group_id = {this.state.group_id}
                            note_id = {this.state.note_id}
                            group_struct = { this.note_manager.get_group_struct(this.state.notebook_id, this.state.workspace_id) }
                            onNoteSelected = { this.onNoteChanged }
                        />
                    </Sider>

                    <Layout style={{ padding: '15px 15px 15px' }}>
                        <Card bodyStyle={{ 'padding-top': '5px' }} title = {
                            <Row type="flex" justify="space-between" align="middle">
                                <Col>
                                    <h1 style={{ "display": "inline"}}>{ markdown_result().h1 }</h1>
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
                                        source={ markdown_result().remain } />
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
