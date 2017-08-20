import React from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownH1Split } from '../utils/utils.js';
import { Icon, message, Row, Col, Input, Button, Card, Alert, Popconfirm, Tooltip} from 'antd';

import {Textarea} from "./component.js";
import './markdown.css';
import './style.css';

export class MarkdownEditor extends React.Component {
    render() {
        return (
            <Card>
                <Row type="flex" justify="space-around">
                    <Col span={11}>
                        <Card title={
                            <Row type="flex" justify="space-between">
                                    <Col>
                                        <span className="markdown-editor-title">
                                            <Icon type="edit" /> 编辑 </span>
                                    </Col>
                                    <Col>
                                    {
                                        this.props.hasDraft &&
                                        <Popconfirm title={"确认撤销？"} okText="是" cancelText="否" onConfirm={ this.props.canelDraft } >
                                            <Tooltip placement="topRight" title="检测到此笔记保存有草稿。">
                                                <Icon type="rollback"/>
                                            </Tooltip>
                                        </Popconfirm>
                                    }
                                    </Col>
                            </Row>
                        } bordered={false} noHovering={true} bodyStyle={{"padding-left": 0, "padding-right": 0}} >
                            <Textarea placeholder="请输入..." className="markdown-editor-textarea"
                                      value={ this.props.content }
                                      onChange={ (e) => this.props.onInputChange(e.target.value) }
                                      onBlur={ (e) => this.props.onBlur(e.target.value)}
                                      minRows={20} />
                        </Card>
                    </Col>
                    <Col span={1}><div className="markdown-editor-diver"/></Col>
                    <Col span={12}>
                        <Card title={
                            <span className="markdown-editor-title"> <Icon type="file-text" /> 预览 </span>
                        } bordered={false} noHovering={true} bodyStyle={{ "padding-left": 0, "padding-right": 0 }} >
                            <ReactMarkdown
                                className="markdown"
                                source={ this.props.content } />
                        </Card>
                    </Col>
                </Row>
            </Card>
        );

    }
}

export class MarkdownViewer extends React.Component {
    render() {
        return (

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
                            source={ this.props.content } />
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
        );
    }
}
