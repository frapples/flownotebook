import React from 'react';
import logo from './logo.svg';
import Button from 'antd/lib/button';
import { Layout, Menu, Dropdown, Breadcrumb, Icon, DatePicker, message, Tag, Row, Col, Divider } from 'antd';
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
                onClick={ (e) => this.props.onNoteSelected(parseInt(e.key)) }
            >
                {
                    this.props.group_struct.map((group, group_key) => (
                        <SubMenu key={group_key} title={<span><Icon type="user" />{group.name}</span>}>
                            {
                                group.children.map((note) => <Menu.Item key={note.key}>{note.name}</Menu.Item>)
                            }
                        </SubMenu>)
                    )
                }
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
                        <Content style={{ background: '#fff', padding: 18, margin: 0, minHeight: 500 }}>
                            <section style={{ "border-bottom-style": "inset", "border-width" : "1px" }}>
                                <Row>
                                    <Col span={18}> <div className="markdown"> <h1>{ markdown_result().h1 }</h1></div></Col>
                                    <Col span={4} offset={2}> <DatePicker defaultValue={moment('2017-01-01', dateFormat)} format={dateFormat} /> </Col>
                                </Row>
                            </section>
                        <div style={{ 'padding-top': '5px', 'padding-bottom': '5px'}}>
                            <Tag color="pink">pink</Tag>
                            <Tag color="red">red</Tag>
                            <Tag color="orange">orange</Tag>
                            <Tag color="green">green</Tag>
                            <Tag color="cyan">cyan</Tag>
                            <Tag color="blue">blue</Tag>
                            <Tag color="purple">purple</Tag>
                        </div>
                        <article style={{ "padding-left" : '15px', 'font-size': '15px' }}>
                            <ReactMarkdown
                            className="markdown"
                                source={ markdown_result().remain } />
                        </article>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

export default App;
