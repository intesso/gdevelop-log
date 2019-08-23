require('./index')

global.log(1, 2, 3)
const a = () => global.log(4, 5, 6)

function bla() {
    global.log(3, 5, 8)
    a()
}

bla()
a()
