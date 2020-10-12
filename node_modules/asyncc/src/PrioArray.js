/**
* Creates an Array which adds items by priority
*/
export default function PrioArray () {
  this.reset()
}

PrioArray.prototype = {
  /**
  * length of Array
  */
  get length () {
    return this.items.length
  },

  /**
  * shift item from array
  * @return {Any} item
  */
  shift () {
    return (this.items.shift() || /* istanbul ignore next */ {}).item
  },

  /**
  * push `item` to Array using priority
  * @param {Any} item
  * @param {Number} [prio=Infinity] - priority `0 ... Infinity` - lower values have higher priority
  */
  push (item, prio) {
    const items = this.items
    if (typeof prio !== 'number') {
      prio = Infinity
      items.push({ prio, item })
    } else {
      let found
      prio = Math.abs(prio)
      for (let i = 0; i < items.length; i++) {
        if (prio < items[i].prio) {
          items.splice(i, 0, { prio, item })
          found = true
          break
        }
      }
      if (!found) {
        items.push({ prio, item })
      }
    }
    return this
  },

  /**
  * unshift `item` to Array using priority
  * @param {Any} item
  */
  unshift (item) {
    this.items.unshift({ prio: 0, item })
    return this
  },

  /**
  * removes all items in the Array
  */
  reset () {
    this.items = []
  }
}
