import React from 'react';
import { Menu, Dropdown, Icon, Input, Button} from 'antd';

import noteManager from '../network/NoteManager.js';

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

    render() {
        const onSelect = (e) => {
            let id = parseInt(e.key);
            this.props.onSelected(id);
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
            </Menu>
        );

        return (<Dropdown overlay={menu} >
            <div style={{ 'float': 'left', 'margin-right': '10px'}}>
                <Button type="primary" size="large" ghost>
                    <Icon type="book" />
                    { this.currentName() }笔记本
                </Button>
            </div>
        </Dropdown>);
    }
}
