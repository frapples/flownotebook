import { fetchPost } from '../utils/utils.js';
import { message } from 'antd';

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
        let onError = () => message.error('获取数据失败。。。', 5);
        fetchPost('/json_api/note/category_children', {'id': id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    };

    fetchNote = (id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetchPost('/json_api/note/note_get', {id: id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    }

    fetchTree = (onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetchPost('/json_api/note/category_tree')
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    };

    addCategory = (name, parent_id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetchPost('/json_api/note/category_add', {name: name, parent_id: parent_id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                if (result.success) {
                    let node = this.findNode(parent_id, false);
                    node.children.push({name: name, id: result.id, children: []});
                    onSuccess(result.id);
                } else {
                    onError();
                }
            });

    };

    delCategory = (parent_id, id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetchPost('/json_api/note/category_del', {id: id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                if (result.success) {
                    let parent = this.findNode(parent_id, false);
                    let node = parent.children.find((c) => c.id == id);
                    parent.children.splice(parent.children.indexOf(node), 1);

                    onSuccess();
                } else {
                    onError();
                }
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
