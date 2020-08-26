const BottomlessBox = require('./BottomlessBox')

describe('BottomlessBox', () => {
  it('can be stringified', () => {
    console.log(BottomlessBox().toJSON())
    expect(JSON.stringify(BottomlessBox())).toBe('"toJSON(BottomlessBox)"')
  })
})