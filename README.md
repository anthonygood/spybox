# SpyBox
#### A debugging utility for tracing object property access
This utility lets you trace how an object's properties are accessed by your program. It was created to help debug state selectors.

```js
const { Spy, inspect } = require('spybox')

// By default returns a stub object which will record property access
const spy = Spy()

spy.foo.bar[0]

console.log(inspect(spy))

/*
{
  foo: {
    bar: {
      0: {}
    }
  }
}
*/

// Or spy on property access to a defined object
const stateSpy = Spy(state)

doSomethingComplicatedWith(stateSpy)

console.log(inspect(stateSpy))

```
