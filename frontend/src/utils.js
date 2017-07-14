
export function markdown_h1_split(content) {
    /* https://github.com/rexxars/react-markdown/issues/48*/
    let result = {};
    result.remain = content.replace(/^#\s+(.+)$/m, (all_h1, h1) => {
        result.h1 = h1;
        return "";
    });

    return result;
}



