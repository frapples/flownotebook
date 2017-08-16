import React from 'react';
import logo from './logo.svg';
import { Layout, Spin} from 'antd';
import './style.css';

import SiderNoteList from './siderNoteList.js';
import NoteBookMenu from './notebookMenu.js';
import WorkSpace from './workspace.js';
import Note from './note.js';
import noteManager from '../network/NoteManager.js';
import selectedHistory from '../network/SelectedHistory.js';

export default class NotebookApp extends React.Component {
    state = {
        notebookId: 0,
        workspaceId: 0,
        noteId: 0,
        loading: true
    }

    constructor() {
        super();

        noteManager.initCategoryTree(() => {
            this.setState(selectedHistory.getDefault());
            this.setState({'loading': false});
        });

    }

    onNotebookChanged = (id) => {
        if (id == null) {
            this.setState(selectedHistory.getDefault());
        } else {
            this.setState(selectedHistory.toggleNotebook(id));
        }
    }

    onWorkspaceChanged = (id) => {
        if (id == null) {
            this.setState(selectedHistory.toggleNotebook(this.state.notebookId));
        } else {
            this.setState(selectedHistory.toggleWorkspace(this.state.notebookId, id));
        }
    }

    onNoteChanged = (id) => {
        if (id == null) {
        } else {
            selectedHistory.toggleNote(this.state.workspaceId, id);
        }

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
