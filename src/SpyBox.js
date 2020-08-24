const BottomlessBox = (name = 'BottomlessBox', { boobyTraps = [] } = {}) =>
  new Proxy(function() {}, {
    get(_target, prop, _handler) {
      if (prop === Symbol.toPrimitive) return () => `Symbol.toPrimitive(${name})`
      const path = `${name}.${prop.toString()}`
      if (boobyTraps.includes(path)) throw new Error(`Trap sprung for ${path}`)
      return BottomlessBox(path, { boobyTraps })
    },
    apply(_target, _thisArg, _args) {
      return BottomlessBox(`${name}()`, { boobyTraps })
    }
  })

const registerKey = Symbol('register')

const sanitizePropertyName = prop => prop === 'constructor' ? '[constructor]' : prop.toString()

const SpyBox = (target, register = {}, countReads = true) => {
  const handler = {
    get(target, prop) {
      if (prop === registerKey) return register
      if (prop === Symbol.species) return target[prop]

      const value = Reflect.get(target, prop)
      const sanitizedProp = sanitizePropertyName(prop)
      const registered = register[sanitizedProp]

      if (typeof value === 'object' || typeof value === 'function') {
        if (!registered) {
          const spy = SpyBox(value, countReads ? { __reads: 1 } : {}, countReads)
          register[sanitizedProp] = spy[registerKey]
          return spy
        }

        if (registered.__reads) registered.__reads++

        return SpyBox(value, registered, countReads)
      }

      if (typeof registered === 'undefined') {
        register[sanitizedProp] = 1
      }

      if (typeof registered === 'number') {
        register[sanitizedProp]++
      }

      return value
    },
    apply(target, thisArg, args) {
      if (typeof target.name === 'string') {
        const registered = thisArg[registerKey][target.name]
        if (registered) {
          registered.__invoked = registered.__invoked || 0
          registered.__invoked++
        }
      }
      return Reflect.apply(target, thisArg, args)
    }
  }

  return new Proxy(target, handler)
}

const Spy = (name, config) => SpyBox(BottomlessBox(name, config), {}, false)
const inspect = spy => spy[registerKey]
const debug = spy => JSON.stringify(inspect(spy), null, 2)

module.exports = {
  Spy,
  SpyBox,
  BottomlessBox,
  inspect,
  debug,
}
