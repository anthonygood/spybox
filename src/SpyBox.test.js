const {
  Spy,
  SpyBox,
  BottomlessBox,
  inspect,
} = require('./SpyBox')

describe('SpyBox', () => {
  it('records object access', () => {
    const state = { foo: 'bar' }
    const spy = SpyBox(state)

    expect(spy.foo).toBe('bar')
    expect(inspect(spy)).toEqual({ foo: 1 })
  })

  it('records multiple access', () => {
    const state = { foo: 'bar', qux: 'qaak' }
    const spy = SpyBox(state)

    spy.foo
    spy.foo
    spy.qux
    spy.someUndefinedThing

    expect(inspect(spy)).toEqual({ foo: 2, qux: 1, someUndefinedThing: 1 })
  })

  it('records deep access', () => {
    const state = { foo: { bar: 'qux' } }
    const spy = SpyBox(state)

    expect(spy.foo.bar).toBe('qux')
    expect(inspect(spy)).toEqual({
      foo: {
        __reads: 1,
        bar: 1
      }
    })
  })

  it('records really deep access', () => {
    const state = {
      foo: {
        bar: { qux: 'qaak' },
        baz: 999
      },
      raa: true
    }
    const spy = SpyBox(state)

    expect({ ...spy.foo.bar }).toEqual(state.foo.bar)
    expect(spy.foo.bar.qux).toBe('qaak')
    expect(spy.foo.baz).toBe(state.foo.baz)
    expect(spy.raa).toBe(state.raa)

    expect(inspect(spy)).toEqual({
      foo: {
        __reads: 3,
        bar: {
          __reads: 2,
          qux: 2 // 2 because we de-structured spy.foo.bar above, and directly accessed
        },
        baz: 1,
      },
      raa: 1,
    })
  })

  it('works with array values', () => {
    const state = {
      foo: 'bar',
      list: [1],
      nested: {
        list: [2],
      },
    }

    const spy = SpyBox(state)

    expect(spy.foo).toBe(state.foo)
    expect(spy.list[0]).toEqual(1)
    expect(spy.nested.list[0]).toEqual(2)
    expect(spy.nested.list[1]).toEqual(undefined)
    expect(spy.nested.list[2]).toEqual(undefined)

    expect(inspect(spy)).toEqual({
      foo: 1,
      list: {
        __reads: 1,
        0: 1,
      },
      nested: {
        __reads: 3,
        list: {
          __reads: 3,
          0: 1,
          1: 1,
          2: 1,
        },
      }
    })
  })

  it('records array methods', () => {
    const state = {
      list: [0, 1, { foo: 2 }],
    }

    const spy = SpyBox(state)

    spy.list.map((_item, index, arr) => {
      // Read even indexes again
      index % 2 === 0 && arr[index]
    })

    expect(inspect(spy)).toEqual({
      list: {
        __reads: 1,
        map: {
          __invoked: 1,
          __reads: 1,
        },
        length: 1,
        0: 2,
        1: 1,
        2: {
          __reads: 2,
        },
      }
    })
  })

  describe('with bottomless box', () => {
    it('works with bottomless box', () => {
      const spy = SpyBox(BottomlessBox())
      spy.foo
      spy.a
      spy.a.b.c
      spy.list.map

      expect(inspect(spy)).toEqual({
        a: {
          __reads: 2,
          b: {
            __reads: 1,
            c: { __reads: 1 },
          },
        },
        foo: { __reads: 1 },
        list: {
          __reads: 1,
          map: { __reads: 1 }
        }
      })
    })

    it('values can be invoked', () => {
      const spy = SpyBox(BottomlessBox())
      spy.foo
      spy.foo()

      // NB. __invoked not recorded
      expect(inspect(spy)).toEqual({ foo: { __reads: 2 } })
    })

    it('Symbol.toPrimitive yields access path', () => {
      const spy = SpyBox(BottomlessBox('root'))

      const path = spy.a.b.c[1].d()[Symbol.toPrimitive]()
      expect(path).toBe('Symbol.toPrimitive(root.a.b.c.1.d())')
    })

    it('can set booby-traps on access paths', () => {
      const box = BottomlessBox('root', { boobyTraps: ['root.a.b.c.2'] })
      const spy = SpyBox(box)

      expect(() => spy.a.b.c[2]).toThrowError()
    })
  })
})

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

  it('can set booby-traps on access paths', () => {
    const root = Spy('root', { boobyTraps: ['root.a.b.c.2'] })

    expect(() => root.a.b.c[2]).toThrowError()
  })
})
