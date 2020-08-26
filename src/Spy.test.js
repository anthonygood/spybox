const { Spy, inspect } = require('./Spy')

describe('Spy', () => {
  it('by default works as simpler object stub', () => {
    const spy = Spy()
    spy.foo
    spy.a
    spy.a.b.c
    spy.list.map

    expect(inspect(spy)).toEqual({
      a: {
        b: {
          c: {},
        },
      },
      foo: {},
      list: {
        map: {}
      }
    })
  })

  it('can be named', () => {
    const fooObject = Spy('fooObject')
    const path = fooObject.a.b.c[1].d()[Symbol.toPrimitive]()

    expect(path).toBe('Symbol.toPrimitive(fooObject.a.b.c.1.d())')
  })

  it('can be configured to counts reads of objects and functions', () => {
    const spy = Spy('name', { countReads: true })
    spy.foo
    spy.a
    spy.a.b

    expect(inspect(spy)).toEqual({
      a: {
        __reads: 2,
        b: {
          __reads: 1,
        },
      },
      foo: {
        __reads: 1,
      },
    })
  })

  it('can set booby-traps on access paths', () => {
    const root = Spy('root', { boobyTraps: ['root.a.b.c.2'] })

    expect(() => root.a.b.c[2]).toThrowError()
  })

  it('can spy on predefined objects', () => {
    const object = {
      a: 21,
      b: [22],
    }

    const spy = Spy(object)

    expect(spy.a).toBe(21)
    expect(spy.b[0]).toBe(22)

    expect(inspect(spy)).toEqual({
      a: 1,
      b: {
        0: 1,
      }
    })
  })
})
