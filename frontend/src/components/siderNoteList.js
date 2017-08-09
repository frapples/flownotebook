import React from 'react';
import { Menu, Icon, Input, Button} from 'antd';

import noteManager from '../network/NoteManager.js';

export default class SiderNoteList extends React.Component {
    constructor(props) {
        super();
        this.groupAndNotes = [];
    }

    componentWillReceiveProps(nextProps) {
        this.groupAndNotes = noteManager.getCategory(nextProps.workspaceId, true);
    }

    findGroupId = (noteId) => {
        let group = this.groupAndNotes.find((group) => group.children.find((note) => noteId == note.id));
        return group ? group.id : null;
    }

    render() {
        const onClick = (e) => {
            if (e.item) {
                let id = parseInt(e.key);
                this.props.onNoteSelected(id);
            }
        }


        const groupId = this.findGroupId(this.props.noteId);
        return (
            <Menu
                mode="inline"
                selectedKeys = { this.props.noteId == null ? [] : [this.props.noteId.toString()]}
                defaultOpenKeys = { groupId != null ? [groupId.toString()] : [] }
                style={{ height: '100%', borderRight: 0 }}
                onClick={ onClick }
            >

                <Input.Search
            placeholder="input search text"
            style={{ width: "92%", "margin-left": "4%"}}
            onSearch={value => console.log(value)}
                />
                {
                    this.groupAndNotes.map((group) => (
                        <Menu.SubMenu key={group.id} title={<span><Icon type="folder" />{group.name}</span>}>
                            {
                                group.children.map((note) => <Menu.Item key={note.id}>{note.title}</Menu.Item>)
                            }
                        </Menu.SubMenu>)
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
