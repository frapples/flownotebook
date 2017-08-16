import noteManager from "./NoteManager.js";

class SelectedHistory {
    constructor() {
        this.defaultSelected = {};
    }

    getDefaultChildren = (id) => {
        if (id == null) {
            return null;
        }

        let nodes = noteManager.getCategory(id);
        if (this.defaultSelected[id] && nodes.find((c) => c.id == this.defaultSelected[id])) {
            return this.defaultSelected[id];
        } else if (nodes.length > 0) {
            this.defaultSelected[id] = nodes[0].id;
            return this.defaultSelected[id];
        } else {
            this.defaultSelected[id] = undefined;
        }

        return null;
    }

    getDefault = () => {
        return this.toggleNotebook(this.getDefaultChildren(-1));
    }

    toggleNotebook = (notebookId) => {
        this.defaultSelected[-1] = notebookId;
        let workspaceId = this.getDefaultChildren(notebookId);
        return {
            'notebookId': notebookId,
            'workspaceId': workspaceId,
            'noteId': this.getDefaultChildren(this.getDefaultChildren(workspaceId))
        };
    }

    toggleWorkspace = (notebookId, workspaceId) => {
        this.defaultSelected[notebookId] = workspaceId;
        return {
            'notebookId': notebookId,
            'workspaceId': workspaceId,
            'noteId': this.getDefaultChildren(this.getDefaultChildren(workspaceId))
        };
    }

    toggleNote = (workspaceId, noteId) => {
        let group = noteManager.findNodeAndParent(noteId, true).parent.id;
        this.defaultSelected[workspaceId] = group;
        this.defaultSelected[group] = noteId;
    }
}


let selectedHistory = new SelectedHistory();

export default selectedHistory;
