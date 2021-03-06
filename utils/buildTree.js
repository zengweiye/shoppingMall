function buildTree(list, currentList, parentKey, childKey){
    for(let node of currentList){
        let children = []
        for(let item of list){
            if(node[parentKey]===item[childKey]){
                children.push(item)
            }
        }
        node['children'] = children
        if(children.length){
            buildTree(list, children, parentKey, childKey)
        }
    }
}
// test tree
// let list = [
//     {
//         id: 1,
//         parentId: null
//     },
//     {
//         id: 2,
//         parentId: 1
//     },
//     {
//         id: 3,
//         parentId: 1
//     },
//     {
//         id: 4,
//         parentId: 2
//     },
//     {
//         id: 5,
//         parentId: 3
//     },
//     {
//         id: 6,
//         parentId: null
//     },
//     {
//         id: 7,
//         parentId: 6
//     },
//     {
//         id: 8,
//         parentId: 6
//     },
// ]

// let currentList = [
//     {
//         id: 1,
//         parentId: null
//     },
//     {
//         id: 6,
//         parentId: null
//     },
// ]

// buildTree(list, currentList, 'id', 'parentId')
// console.log(JSON.stringify(currentList))
module.exports = {buildTree}