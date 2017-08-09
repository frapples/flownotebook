import React from 'react';
import { Icon, DatePicker, message, Tag, Row, Col, Input, Popover, Button, Timeline, Card, Spin, Alert } from 'antd';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import 'moment/locale/zh-cn';
import './markdown.css';

import noteManager from '../network/NoteManager.js';
import { markdownH1Split } from '../utils/utils.js';

moment.locale('zh-cn');
const dateFormat = 'YYYY-MM-DD';

export default class Note extends React.Component {
    state = {
        noteContent: '',
        loading: true
    }

    constructor(props) {
        super();
        this.tags = [];
        this.updateData(props.noteId);
    }

    componentWillReceiveProps (nextProps) {
        this.updateData(nextProps.noteId);
    }

    updateData = (id) => {
        if (id == null) {
            this.tags = [];
            this.setState({'noteContent': ''});
        } else {
            this.setState({'loading': true});
            if (id != null) {
                noteManager.fetchNote(id, (note) => {
                    this.tags = note.tags;
                    this.setState({'noteContent': note.content, loading: false});
                });
            }
        }
    }

    render() {
        let result = markdownH1Split(this.state.noteContent);
        let h1 = result.h1;
        let contentRemain = result.remain;

        const updatedLog = (
            <Timeline>
                <Timeline.Item>2017-09-01 增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2016-09-03增加了9行，删除了1行。</Timeline.Item>
                <Timeline.Item>2015-09-01增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2015-07-01 创建笔记。 </Timeline.Item>
            </Timeline>
        );

        return (
            <Spin size="large" tip="加载中..." delay={100} spinning={this.state.loading}>
            <Card bodyStyle={{ 'padding-top': '5px', 'min-height': "75vh"}} title = {
                <Row type="flex" justify="space-between" align="middle">
                    <Col>
                        <h1 style={{ "display": "inline"}}>{ h1 }</h1>
                        <Button icon="edit" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                        <Popover content={updatedLog} title="修改记录">
                            <Button icon="line-chart" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                        </Popover>
                    </Col>
                    <Col>
                        <DatePicker defaultValue={moment('2017-01-01', dateFormat)} format={dateFormat} />
                    </Col>
                </Row>
            } extra={ "" } style={{ }}>
            <div style={{ 'padding-bottom': '5px'}}>
            <NoteTags tags= { this.tags } noteId = {this.props.noteId} />
            </div>
            <Row>
            <Col span={20}>
            {
                this.props.noteId == null ?
                <Alert
                    message="未选择笔记..."
                    description="在左侧的笔记列表中选择一个笔记"
                    type="info"
                    showIcon
                />
                :
                <ReactMarkdown
                    className="markdown"
                    source={ contentRemain } />
            }
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
            </Spin>
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

    componentWillReceiveProps(nextProps) {
        this.setState({tags: nextProps.tags.slice(0)});
    }
    handleInputChange = (e) => {
    }

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }

    handleInputConfirm = (e) => {
        let newTag = e.target.value.trim();
        if (newTag !== "" && this.state.tags.indexOf(newTag) >= 0) {
            message.info("标签" + newTag + "已经存在，无需添加。");
        } else {
            this.setState({tags: [...this.state.tags, newTag]});
        }
        this.setState({inputVisible: false});
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        message.info("移除标签" + removedTag);
        this.setState({ tags: tags });
    }

    render() {
        let colors = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple'];
        let i = 0;
        const nextColor = () => colors[(i++) % colors.length];

        return (
            <Row>
                <Col>
                    {
                        this.state.tags.map((tag) =>
                            <div style={{ "padding-top": "3px", "float": "left" }}>
                                <Tag color={ nextColor() } closable afterClose={() => this.handleClose(tag)} >
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
                            <Button size="small" type="dashed" onClick={this.showInput} disabled={this.props.noteId == null}>+</Button>
                        }
                    </div>
                </Col>
            </Row>
        );
    }
}
