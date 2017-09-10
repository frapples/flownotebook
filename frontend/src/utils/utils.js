import commonmark from 'commonmark';

export function markdownH1Split(content) {
    /* https://github.com/rexxars/react-markdown/issues/48*/
    let result = {};
    result.remain = content.replace(/^#\s+(.+)$/m, (all, h1) => {
        result.h1 = h1;
        return "";
    });

    return result;
}

export function markdownToc(content) {
    let lines = content.split("\n");
    let walker = new commonmark.Parser().parse(content).walker();

    let toc = []
    let event, node;

    while ((event = walker.next())) {
        node = event.node;
        if (event.entering && node.type === 'heading') {
            let pos = node.sourcepos;
            let line = pos[0][0] - 1;
            toc.push([node.level, lines[line].substring(pos[0][1], pos[1][1])])
        }
    }
    return toc;
}

export function fetchPost(url, data) {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { /* 必要，有些server比较严格 */
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: urlencode(data)
    });
}

export function urlencode(data) {
    var out = new Array();

    for(var key in data) {
        out.push(key + '=' + encodeURIComponent(data[key]));
    }

    return out.join('&');
}


export function stringIsInt(s) {
    return parseInt(s).toString() == s;
}
