import { fetch_post } from './utils.js';
import { message } from 'antd';

class NoteManager {
    constructor() {
        this.category_cache = {};
        this.tree_cache = [];
    }

    defaultIdPath = () => {
        let path = [];

        let id = -1;
        while (true) {
            let nodes = this.getCategory(-1);
            if (nodes.length > 0) {
                id = nodes[0].id;
                path.push(id);
            } else {
                break;
            }
        }
    }

    getCategory = (id, include_children) => {
        if (!(id in this.category_cache)) {
            return [];
        }

        let nodes = this.category_cache[id].slice(0);
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

    initTree = (onSuccess) => {

        const cache = (id, children_nodes) => {
            this.category_cache[id] = children_nodes;
            children_nodes.map((node) => {
                if ('children' in node) {
                    cache(node.id, node.children);
                }
            });
        };

        this.fetchTree((tree) => {
            this.tree_cache = tree;
            cache(-1, tree);
            onSuccess(tree);
        });
    }

};

let noteManager = new NoteManager();
export default noteManager;
