import { fetchPost } from '../utils/utils.js';
import { message } from 'antd';

class NoteManager {
    constructor() {
        this.categoryCache = {};
        this.tree_cache = [];
    }

    getCategory = (id, includeChildren) => {
        if (!(id in this.categoryCache)) {
            return [];
        }

        let nodes = this.categoryCache[id].children.slice(0);
        if (!includeChildren) {
            nodes = nodes.map((node) => Object.assign({}, node, {'children': undefined}));
        }

        return nodes;
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
                    this.categoryCache[result.id] = {name: name, id: result.id, children: []};
                    this.categoryCache[parent_id].children.push(this.categoryCache[result.id]);
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
                    let children = this.categoryCache[parent_id].children;
                    children.splice(children.indexOf(this.categoryCache[id]), 1);
                    this.categoryCache[id] = undefined;
                    onSuccess();
                } else {
                    onError();
                }
            });
    }

    initCategoryTree = (onSuccess) => {

        const cache = (node) => {
            if ('children' in node) {
                this.categoryCache[node.id] = node;
                node.children.forEach((subnode) => cache(subnode));
            }
        };

        this.fetchTree((tree) => {
            this.tree_cache = tree;
            cache({id: -1, name: "", children: tree});
            onSuccess(tree);
        });
    }

};

let noteManager = new NoteManager();
export default noteManager;
