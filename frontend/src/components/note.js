import React from 'react';
import { Icon, DatePicker, message, Tag, Row, Col, Input, Popover, Button, Timeline, Card, Spin, Alert, Popconfirm} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';

import noteManager from '../network/NoteManager.js';
import { markdownH1Split } from '../utils/utils.js';
import { MarkdownEditor, MarkdownViewer } from './markdownComponent.js';

moment.locale('zh-cn');
const dateFormat = 'YYYY-MM-DD';

export default class Note extends React.Component {
    state = {
        noteContent: '',
        draftContent: '',
        loading: true,
        editorMode: false
    }

    constructor(props) {
        super();
        this.tags = [];
        this.updateData(props.noteId);
    }

    componentWillReceiveProps (nextProps) {
        this.updateData(nextProps.noteId);
    }

    hasDraft = () => {
        return this.state.draftContent && this.state.noteContent != this.state.draftContent;
    }

    saveDraft = () => {
        if (this.hasDraft()) {
            noteManager.saveDraft(this.props.noteId, this.state.draftContent, () => {
            });
        }
    }

    canelDraft = () => {
            noteManager.saveDraft(this.props.noteId, this.state.noteContent, () => {
            });
            this.setState({draftContent: this.state.noteContent});
    }

    saveNote = () => {
        alert(JSON.stringify(this.state.draftContent));
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
                    this.setState({'noteContent': note.content,
                                   'draftContent': note.draft ? note.draft : note.content,
                                   loading: false});
                });
            }
        }
    }

    render() {
        let result = markdownH1Split(this.state.editorMode ? this.state.draftContent : this.state.noteContent);

        const updatedLog = (
            <Timeline>
                <Timeline.Item>2017-09-01 增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2016-09-03增加了9行，删除了1行。</Timeline.Item>
                <Timeline.Item>2015-09-01增加了3行，删除了2行。</Timeline.Item>
                <Timeline.Item>2015-07-01 创建笔记。 </Timeline.Item>
            </Timeline>
        );

        let editorModeToggle = () => this.setState({editorMode: !this.state.editorMode});

        const saveButton = () => this.hasDraft() ?
                               <Popconfirm title={"检测到笔记已修改，是否保存? "} okText="保存" cancelText="撤销" onCancel={ () => {
                                       this.canelDraft();
                                       editorModeToggle();
                               }} onConfirm={ () => {
                                                   this.saveNote();
                                                   editorModeToggle();
                                           } } >
                                    <Button icon="file-text" size="small" shape="circle" style={{ 'margin-left': '5px'}} />
                                </Popconfirm>
                                :
                               <Button icon="file-text" size="small" shape="circle" style={{ 'margin-left': '5px'}} onClick={ editorModeToggle } />;
        return (
            <Card bodyStyle={{ 'padding-top': '5px', 'min-height': "75vh"}} loading={this.state.loading} title = {
                <Row type="flex" justify="space-between" align="middle">
                    <Col>
                        <h1 style={{ "display": "inline"}}>{ result.h1 }</h1>
                        {
                            this.state.editorMode ?
                            saveButton()
                            :
                            <Button icon="edit" size="small" shape="circle" style={{ 'margin-left': '5px'}} onClick={ editorModeToggle } />
                        }
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
            {
                this.state.editorMode ?
                <MarkdownEditor content={ this.state.draftContent }
                                hasDraft={ this.hasDraft() }
                                canelDraft= {this.canelDraft}
                                onInputChange={ (v) => this.setState({draftContent: v }) }
                                onBlur={ this.saveDraft } />
                :
                <MarkdownViewer content={ result.remain } noteId={ this.props.noteId }/>
            }
            </Card>
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
