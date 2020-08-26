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

const inspect = spy => spy[registerKey]
const debug = spy => JSON.stringify(inspect(spy), null, 2)

module.exports = {
  SpyBox,
  inspect,
  debug,
}
