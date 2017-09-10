import { fetchPost } from '../utils/utils.js';
import { message } from 'antd';
import arraytool from '../utils/arraytool.js';


function fetchPostFromJsonAPI(url, post, onSuccess, onFailed) {
    let onError = () => message.error('获取数据失败。。。', 5);
    if (!onFailed) {
        onFailed = () => () => message.warning('操作执行失败。。。', 5);
    }

    fetchPost(url, post)
        .then((res) => res.json().catch(onError))
        .then((result) => {
            if (result.success) {
                onSuccess(result);
            } else {
                onFailed(result);
            }
        });
}

class NoteManager {
    constructor() {
        this.treeCache = {};
    }

    getCategory = (id, includeChildren) => {
        let node = this.findNode(id, false);
        if (node == null) {
            return [];
        }

        let nodes = node.children.slice(0);
        if (!includeChildren) {
            nodes = nodes.map((node) => Object.assign({}, node, {'children': undefined}));
        }

        return nodes;
    }

    findNode = (id, isLeaf) => {
        return this.findNodeAndParent(id, isLeaf).node;
    }

    findNodeAndParent = (id, isLeaf) => {
        let result = {parent: null, node: null};
        const find = (parent, tree) => {
            if (tree.id == id && isLeaf == (tree.note_type != undefined)) {
                result.node = tree;
                result.parent = parent;
            } else {
                if (tree.children) {
                    tree.children.forEach((children) => find(tree, children));
                }
            }
        };

        find(null, this.treeCache);
        return result;
    }

    fetchCategory = (id, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/category_children', {'id': id}, (result) => onSuccess(result.data));
    };

    fetchNote = (id, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_get', {id: id}, (result) => onSuccess(result.data));
    }

    fetchTree = (onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/category_tree', {}, (result) => onSuccess(result.data));
    };

    addCategory = (name, parent_id, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/category_add', {name: name, parent_id: parent_id},
                             (result) => {
                                 let node = this.findNode(parent_id, false);
                                 node.children.push({name: name, id: result.id, children: []});
                                 onSuccess(result.id);
                             });
    };

    delCategory = (id, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/category_del', {id: id}, (result) => {
            let parent = this.findNodeAndParent(id, false).parent;
            arraytool.removeItem(parent.children, (c) => c.id == id);

            onSuccess();
        });
    }

    moveCategory = (new_parent_id, id, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/category_move', {new_parent_id: new_parent_id, id: id},
                             () => {
                                 let result = this.findNodeAndParent(id, false);
                                 let new_parent = this.findNode(new_parent_id, false);
                                 arraytool.removeItem(result.parent.children, (c) => c.id == id);
                                 new_parent.children.push(result.node);

                                 onSuccess();
                             });
    }

    addNote = (category_id, title, content, type, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_add', {category_id: category_id, content: content, type: type},
                             (result) => {
                                 let category = this.findNode(category_id, false);
                                 category.children.push({id: result.id, note_type: type, title: title});
                                 onSuccess(result.id);
                             });
    }

    addTag = (note_id, tag_name, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_tag_add', {id: note_id, tagname: tag_name},
                             () => {
                                 onSuccess();
                             });
    }

    delTag = (note_id, tag_name, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_tag_del', {id: note_id, tagname: tag_name},
                             () => {
                                 onSuccess();
                             });
    }

    saveDraft = (noteId, draft, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_save_draft', {id: noteId, draft: draft}, () => onSuccess());
    }

    saveContent = (noteId, content, onSuccess) => {
        fetchPostFromJsonAPI('/json_api/note/note_save_content', {id: noteId, content: content}, () => {
            this.findNode(noteId, true).content = content;
            onSuccess();
        });
    }

    initCategoryTree = (onSuccess) => {
        this.fetchTree((tree) => {
            this.treeCache = {id: -1, name: "", children: tree};
            onSuccess();
        });
    }
};

let noteManager = new NoteManager();

export default noteManager;
