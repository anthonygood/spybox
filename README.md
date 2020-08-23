# SpyBox
#### A debugging utility for tracing object property access
This utility lets you trace how an object's properties are accessed by your program. It was created to help debug state selectors.

The default `Spy` returns a stub object which will record property access:

```js
const { Spy, inspect } = require('spybox')
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
```
