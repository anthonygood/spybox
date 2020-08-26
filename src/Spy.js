const { SpyBox, inspect, debug } = require('./SpyBox')
const BottomlessBox = require('./BottomlessBox')

const getTarget = (targetOrName, config) => {
  const type = typeof targetOrName
  if (type === 'undefined' || type === 'string') return BottomlessBox(targetOrName, config, false)
  return targetOrName
}

const SpyFactory = (nameOrTarget, config = {}) =>
  SpyBox(
    getTarget(nameOrTarget, config),
    {},
    config.countReads || false
  )

module.exports = {
  Spy: SpyFactory,
  inspect,
  debug,
}
