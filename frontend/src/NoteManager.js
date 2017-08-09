import { fetch_post } from './utils.js';
import { message } from 'antd';

class NoteManager {
    constructor() {
        this.category_cache = {};
        this.tree_cache = [];
    }

    getCategory = (id, include_children) => {
        if (!(id in this.category_cache)) {
            return [];
        }

        let nodes = this.category_cache[id].children.slice(0);
        if (!include_children) {
            nodes = nodes.map((node) => Object.assign({}, node, {'children': undefined}));
        }

        return nodes;
    }

    fetchCategory = (id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/category_children', {'id': id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    };

    fetchNote = (id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/note_get', {id: id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    }

    fetchTree = (onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/category_tree')
            .then((res) => res.json().catch(onError))
            .then((result) => {
                onSuccess(result.data);
            });
    };

    addCategory = (name, parent_id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/category_add', {name: name, parent_id: parent_id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                if (result.success) {
                    this.category_cache[result.id] = {name: name, id: result.id, children: []};
                    this.category_cache[parent_id].children.push(this.category_cache[result.id]);
                    onSuccess(result.id);
                } else {
                    onError();
                }
            });

    };

    delCategory = (parent_id, id, onSuccess) => {
        let onError = () => message.error('获取数据失败。。。', 5);
        fetch_post('/json_api/note/category_del', {id: id})
            .then((res) => res.json().catch(onError))
            .then((result) => {
                if (result.success) {
                    let children = this.category_cache[parent_id].children;
                    children.splice(children.indexOf(this.category_cache[id]), 1);
                    this.category_cache[id] = undefined;
                    onSuccess();
                } else {
                    onError();
                }
            });
    }

    initTree = (onSuccess) => {

        const cache = (node) => {
            if ('children' in node) {
                this.category_cache[node.id] = node;
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
