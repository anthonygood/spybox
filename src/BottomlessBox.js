const BottomlessBox = (name = 'BottomlessBox', { boobyTraps = [] } = {}) =>
  new Proxy(function() {}, {
    get(_target, prop, _handler) {
      if (prop === 'toJSON') return () => `toJSON(${name})`
      if (prop === Symbol.toPrimitive) return () => `Symbol.toPrimitive(${name})`
      const path = `${name}.${prop.toString()}`
      if (boobyTraps.includes(path)) throw new Error(`Trap sprung for ${path}`)
      return BottomlessBox(path, { boobyTraps })
    },
    apply(_target, _thisArg, _args) {
      return BottomlessBox(`${name}()`, { boobyTraps })
    }
  })

module.exports = BottomlessBox
