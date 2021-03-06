module.exports = function() {
    let Num=""
    for(let i=0;i<6;i++)
    {
        Num+=Math.floor(Math.random()*10)
    }
    return Num
}