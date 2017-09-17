import React from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownH1Split, markdownToc } from '../utils/utils.js';
import { Icon, message, Row, Col, Input, Button, Card, Alert, Popconfirm, Tooltip} from 'antd';


import {Textarea} from "./component.js";
import './markdown.css';
import './style.css';

export class MarkdownEditor extends React.Component {
    render() {
        generateToc(this.props.content);

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
                                source={ this.props.content }
                            renderers={{Heading: HeadingRenderer}}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>
        );

    }
}

/* https://github.com/rexxars/react-markdown/issues/69 */
function HeadingRenderer(props) {
    /* let key = props.level + props.children[0];*/
    let key = props.children[0];
    return React.createElement('h' + props.level, {}, [...props.children,
                                                       <a name={ key }></a>])
}


export class MarkdownViewer extends React.Component {
    render() {

        let toc_res = generateToc(this.props.content);
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
                            source={ this.props.content }
                            renderers={{Heading: HeadingRenderer}}
                        />
                    }
                </Col>

                <Col span={4}>
                    {
                        toc_res.isEmpty ||
                        <Card bodyStyle = {{ padding: '10px', 'min-height': 0 }} className="toc toc-anchor">
                            {
                                toc_res.reactDom
                            }
                        </Card>
                    }
                </Col>
            </Row>
        );
    }
}


function generateToc(content) {
    let toc = markdownToc(content).filter((h) => h.level == 2);

    return {
        isEmpty: toc.length == 0,
        reactDom:
        <ul>
            {
                toc.map((h) => <li><a href={"#" + h.content}>{h.content}</a></li>)
            }
        </ul>
    };
}
