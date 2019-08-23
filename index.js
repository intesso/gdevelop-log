const rawPattern = typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext.getArgument('pattern') : '*'
const pattern = compilePattern(rawPattern)

const glob = typeof gdjs !== 'undefined' ? gdjs : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}

glob.log = function log(...args) {
    if (!pattern.log) return
    try {
        const error = new Error()
        const { names, file } = getNames(error)
        if (!pattern.filter || patternMatches(names, pattern)) {
            console.log.apply(null, [names.join('::')].concat(args, '\n', file))
        }
    } catch { }
}

function compilePattern(r) {
    const p = r.split(',')
    const log = !!p[0]
    const filter = p[0] !== '*' || p.length !== 1
    const include = p.filter(p => !p.startsWith('-')).map(rex)
    const exclude = p.filter(p => p.startsWith('-')).map(p => p.substring(1)).map(rex)
    return {
        log,
        filter,
        include: rexify(include),
        exclude: rexify(exclude)
    }
}

function rex(str) {
    return '(^|,)' + str.replace(/\*/, '.*') + '($|,)'
}

function rexify(arr) {
    return arr.length ? new RegExp(arr.join('|', 'i')) : null
}

function patternMatches(names, pattern) {
    const n = names.join(',')
    if (pattern.exclude && n.match(pattern.exclude)) return false
    if (pattern.include && n.match(pattern.include)) return true
    return false
}

function getNames(error) {
    // e.g. at Object.gdjs.evtsExt__Positions__collidesWith2.userFunc0x760880 (file:///var/folders/c1/mb7qb__s08g47fxv3hy0494h0000gn/T/preview/gdjs-evtsext__positions__collideswith2-func.js:11:6)
    const e = error.stack.split('\n')
    let i = e.findIndex(l => l.match(/at .*\.?log /))
    let file, line, parts, names = [], done = false
    while (!done && i < (e.length - 3)) {
        i++
        line = e[i]
        parts = extractParts(line)
        if (!parts) continue
        if (!file) file = parts[1]
        if (parts[0].length === 1) names = names.concat(parts[0])
        if (parts[0].length === 2) {
            names = parts[0].concat(names)
            done = true
        }
    }
    return { names, file }
}

/**
 * returns an Array with two elements: first: functionName parts (Array), second: filename with line number (string)
 */
function extractParts(line) {
    const parts = line.replace(/^\s*at /, '').replace(/\)$/, '').split(/ \(/)
    if (parts.length !== 2) return null
    parts[0] = getPartNames(parts[0])
    return parts
}

/**
 * return an Array. 
 * - lenght is zero, if the stack is at an anonymous userFunction that was not defined in Functions/Behaviors.
 * - lenght is one, if the stack is inside a function.
 * - length is two, if the trace is at the user defined Functions/Behavior stack. 1: Functions/Behaviors name, 2: functionName
 */
function getPartNames(part) {
    if (!part) return []
    if (/^[a-z][a-z0-9]*$/gi.test(part)) return [part]
    return part.replace(/\.userFunc.*/, '').split('__').slice(1) // FIXME gdjs specific
}
