import React from 'react';
import { Menu, Dropdown, Icon, Input, Button, Modal, Col, Row} from 'antd';

import noteManager from '../network/NoteManager.js';
import { SimpleInputModal, stateGetterSetter } from './component.js';

export default class NoteBookMenu extends React.Component {
    constructor(props) {
        super();
        this.notebooks = [];
    }

    componentWillReceiveProps = (nextProps) => {
        this.notebooks = noteManager.getCategory(-1);
    }

    currentName = () => {
        let id = this.props.notebookId;
        let current = this.notebooks.find((b) => id === b.id);
        let current_name = current ? current.name : "";
        return current_name;
    }

    onAdd = (name) => {
        name = name.trim();

        if (name != "") {
            noteManager.addCategory(name, -1, (id) => {
                this.notebooks = noteManager.getCategory(-1);
                this.forceUpdate();
                this.props.onSelected(null);
            });
        }
    }

    render() {
        const onSelect = (e) => {
            if (e.key == "add") {
                this.refs.inputModal.show();
            } else {
                let id = parseInt(e.key);
                this.props.onSelected(id);
            }
        }

        const menu = (
            <Menu onClick={ onSelect }
            defaultSelectedKeys = { [this.props.notebookId.toString()] }
            selectedKeys = { [this.props.notebookId.toString()] }
            >
            {
                this.notebooks.map(
                    (book) => (<Menu.Item key={book.id} > {book.name} </Menu.Item>))
            }
            <Menu.Divider/>
            <Menu.Item key="add">
                <Icon type="plus" style={{ 'display': 'inline', 'text-align': 'center' }} />
            </Menu.Item>
            </Menu>
        );

        return (<div>
            <Dropdown overlay={menu} >
                <div style={{ 'float': 'left', 'margin-right': '10px'}}>
                    <Button type="primary" size="large" ghost>
                        <Icon type="book" />
                        { this.currentName() }笔记本
                    </Button>
                </div>

            </Dropdown>

            <SimpleInputModal
                title="添加新笔记本"
                placeholder="新笔记本..."
                prefix={<Icon type="book" />}
                onConfirm={ this.onAdd }
                ref="inputModal"
            />
        </div>);
    }
}

