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
                        <SubMenu key={group_key} title={<span><Icon type="user" />{group.name}</span>}>
                            {
                                group.children.map((note) => <Menu.Item key={note.key}>{note.name}</Menu.Item>)
                            }
                        </SubMenu>)
                    )
                }
            <Icon type="plus" style= {{ 'margin-left':'50%', 'margin-right': '50%' }} />
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
             <Button icon="plus" ghost />
            </Menu>
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
                                <Row>
                                    <Col span={18}> <div className="markdown" style={{display: 'inline-flex', 'align-items': 'center'}}>
                                        <h1>{ markdown_result().h1 }</h1>
                                            <Button icon="edit" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                                        <Popover content={updated_log} title="修改记录">
                                            <Button icon="line-chart" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                                        </Popover>
                                    </div>
                                    </Col>
                                    <Col span={4} offset={2}>
                                        <div style={{ 'padding-top': '5px'}}>
                                            <DatePicker defaultValue={moment('2017-01-01', dateFormat)} format={dateFormat} />
                                        </div>
                                    </Col>
                                </Row>
                        } extra={ "" } style={{ }}>
                        <div style={{ 'padding-bottom': '5px'}}>
                            <Tag color="pink">pink</Tag>
                            <Tag color="red">red</Tag>
                            <Tag color="orange">orange</Tag>
                            <Tag color="green">green</Tag>
                            <Tag color="cyan">cyan</Tag>
                            <Tag color="blue">blue</Tag>
                            <Tag color="purple">purple</Tag>
                        </div>
                        <div style={{ display: 'flex'}}>
                            <article style={{ "padding-left" : '15px', 'font-size': '15px', 'width': '87%'}}>
                                <ReactMarkdown
                                    className="markdown"
                                    source={ markdown_result().remain } />
                            </article>
                            <div style={{ width: "13%", 'min-height': 0}}>
                                <Card bodyStyle = {{ padding: '12px'}}>
                                    <p><a herf="#">开发环境配置</a></p>
                                    <p><a herf="#">servlet API介绍</a></p>
                                </Card>
                                <div></div>
                            </div>
                        </div>
                        </Card>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

export default App;
