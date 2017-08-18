import React from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownH1Split } from '../utils/utils.js';
import { Icon, message, Row, Col, Input, Button, Card, Alert} from 'antd';

import './markdown.css';

export class MarkdownEditor extends React.Component {
    render() {
        return (
            <Row type="flex" justify="space-between">
                <Col span={11}>
                    <div>
                        <Input.TextArea placeholder="请输入..." className="markdown-editor-textarea"
                                        value={ this.props.content }
                                        onChange={ (e) => this.props.onInputChange(e.target.value) }
                                        onBlur={ (e) => this.props.onBlur(e.target.value)}
                                        autosize={{ minRows: 20 }} />
                    </div>
                </Col>
                <Col span={12}>
                    <ReactMarkdown
                        className="markdown"
                        source={ this.props.content } />
                </Col>
            </Row>
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
