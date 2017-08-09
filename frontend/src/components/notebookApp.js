import React from 'react';
import logo from './logo.svg';
import { Layout, Spin} from 'antd';
import './style.css';

import SiderNoteList from './siderNoteList.js';
import NoteBookMenu from './notebookMenu.js';
import WorkSpace from './workspace.js';
import Note from './note.js';
import noteManager from '../network/NoteManager.js';

export default class NotebookApp extends React.Component {
    state = {
        notebookId: 0,
        workspaceId: 0,
        noteId: 0,
        loading: true
    }

    constructor() {
        super();

        this.defaultSelectedWorkspace = {};
        this.defaultSelectedNote = {};

        const initDefaultSelected = (tree) => {
            tree.forEach((notebook) => {
                if (notebook.children.length > 0) {
                    this.defaultSelectedWorkspace[notebook.id] = notebook.children[0].id;
                } else {
                    this.defaultSelectedWorkspace[notebook.id] = null;
                }

                notebook.children.forEach((workspace) => {
                    this.defaultSelectedNote[workspace.id] = null;
                    workspace.children.forEach((group) => {
                        if (group.children.length > 0 && this.defaultSelectedNote[workspace.id] == null) {
                            this.defaultSelectedNote[workspace.id] = group.children[0].id;
                        }
                    })
                })
            });
            this.setState({loading: false});
        };

        noteManager.initCategoryTree((tree) => {
            initDefaultSelected(tree);
            let defaultNotebookId = tree[0].id;
            this.setState({
                'notebookId': defaultNotebookId,
                'workspaceId': this.defaultSelectedWorkspace[defaultNotebookId],
                'noteId': this.defaultSelectedNote[this.defaultSelectedWorkspace[defaultNotebookId]],
                'loading': false
            });
        });

    }

    onNotebookChanged = (id) => {
        this.setState({'notebookId': id,
                       'workspaceId': this.defaultSelectedWorkspace[id],
                       'noteId': this.defaultSelectedNote[this.defaultSelectedWorkspace[id]],
        });
    }

    onWorkspaceChanged = (id) => {
        if (id == null) {
            id = this.defaultSelectedWorkspace[this.state.notebookId];
        } else {
            this.defaultSelectedWorkspace[this.state.notebookId] = id;
        }
        this.setState({'workspaceId': id,
                       'noteId': this.defaultSelectedNote[id]});
    }

    onNoteChanged = (id) => {
        this.defaultSelectedNote[this.state.workspaceId] = id;
        this.setState({'noteId': id});
    }

    render() {
        return (
            <Layout>
                <Spin size="large" spinning={this.state.loading} tip="加载中...">
                    <Layout.Header>
                        {/* <div className="logo" /> */}
                        <NoteBookMenu ref="notebook"
                                      notebookId={this.state.notebookId}
                                      onSelected = { this.onNotebookChanged }/>
                        <WorkSpace ref="workspace"
                                   notebookId = {this.state.notebookId }
                                   workspaceId = {this.state.workspaceId }
                                   onSelected = { this.onWorkspaceChanged } />
                    </Layout.Header>

                    <Layout>
                        <Layout.Sider width={200} style={{ background: '#fff' }}>
                            <SiderNoteList ref="sidernotelist" workspaceId = {this.state.workspaceId}
                                           noteId = {this.state.noteId}
                                           onNoteSelected = { this.onNoteChanged } />
                        </Layout.Sider>

                        <Layout style={{ padding: '15px 15px 15px'}}>
                            <Note ref="note" noteId = {this.state.noteId} />
                        </Layout>
                    </Layout>
                </Spin>
            </Layout>
        );
    }
}
