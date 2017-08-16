
let arraytool = {
    removeItem: (arr, condFunc) => {
        let item = arr.find(condFunc);
        arr.splice(arr.indexOf(item), 1);
    }
};

export default arraytool;
