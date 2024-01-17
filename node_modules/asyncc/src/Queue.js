import { _setImmediate } from './_setImmediate'
import PrioArray from './PrioArray'

/**
* Run queued `items` through an asynchronous `task`.
*
* Once finishing the `task` an optional callback is called.
* While pushing to the queue, you may define a priority for execution.
* Lower values means faster execution.
*
* @name Queue
* @methodOf: module:parallel
* @class
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Number} concurrency - max. number of tasks running in parallel
* @example <caption>Default usage</caption>
* var arr = []
* var q = new Queue((item, cb) => {
*   arr.push(item)
*   cb(null, item)
* })
* // push item "one" at end of queue
* q.push('one', (err, res) => {
*   console.log(res + ' finished')
* })
* // add item "two" at start of queue
* q.unshift('two', () => {
*   console.log('two finished')
* })
* // called when all items in queue where processed
* q.drain(() => {
*   console.log(arr)
*   //> arr = ['one', 'two']
* })
* @example <caption>Using priorities</caption>
* let arr = []
*
* let q = new Queue(function (item, cb) {
*   arr.push(item)
*   cb()
* }, 2)
*
* q.concat([100, 101, 102], 3) // priority = 3 - last (but 2 items already processed)
* q.concat([0, 1, 2], 1)       // priority = 1 - first
* q.concat([10, 11, 12], 2)    // priority = 2 - second
*
* q.drain(() => {
*   //> arr = [ 100, 101, 0, 1, 2, 10, 11, 12, 102 ])
* })
*/
export default function Queue (task, concurrency) {
  this._task = task
  this._concurrency = Math.abs(concurrency || 1)
  this._worker = 0
  this._paused = false
  this._items = new PrioArray()
}

Queue.prototype = {
  /**
  * process items in queue
  * @private
  */
  _run () {
    const { _items, _drain } = this
    this._worker -= 1
    if (_items.length === 0) {
      if (this._worker <= 0) {
        this._worker = 0
        _drain && _drain()
      }
    } else {
      this._worker += 1
      const [item, cb] = _items.shift()
      this._task(item, (err, res) => {
        cb && cb(err, res)
        _setImmediate(() => { // prevent RangeError: Maximum call stack size exceeded for sync tasks
          this._run()
        })
      })
    }
  },

  /**
  * start processing queue or add workers up to concurrency
  * @private
  */
  _start () {
    while (!this._paused && this._worker < Math.min(this._concurrency, this._items.length)) {
      this._worker += 1
      this._run()
    }
    return this
  },

  /**
  * Check if queue is paused
  * @return {Boolean} `true` if paused
  */
  get paused () {
    return this._paused
  },

  /**
  * Check if queue is idle - means no items in queue and no workers running
  * @return {Boolean} `true` if idle
  */
  get idle () {
    return !this.length && this._worker === 0
  },

  /**
  * Number of items waiting in the queue to get processed
  * @return {Number} number of items in queue
  */
  get length () {
    return this._items.length
  },

  /**
  * Pause processing
  * @return {this} for chaining
  */
  pause () {
    this._paused = true
    return this
  },

  /**
  * Resume processing
  * @return {this} for chaining
  */
  resume () {
    this._paused = false
    return this._start()
  },

  /**
  * Reset the queue by removing all pending items from the queue
  * @return {this} for chaining
  */
  reset () {
    this._items.reset()
    return this
  },

  /**
  * Number of items being processed
  * @return {Number} number of items processed
  */
  running () {
    return this._worker
  },

  /**
  * push `item` onto queue
  * @param {Any} item
  * @param {Function} [callback] - optional callback if item was processed
  * @param {Number} [priority] - priority `0 ... Infinity` of the item to process. Smaller values, faster processing
  * @return {this} for chaining
  */
  push (item, callback, priority) {
    return this.concat([item], callback, priority)
  },

  /**
  * concat `items` onto queue - fills the queue first with `items` before starting processing
  * @param {Any[]} items
  * @param {Function} [callback] - optional callback if single item was processed
  * @param {Number} [priority] - priority `0 ... Infinity` of the item to process. Smaller values, faster processing
  * @return {this} for chaining
  */
  concat (items, callback, priority) {
    if (typeof callback === 'number') {
      priority = callback
      callback = undefined
    }
    items.forEach((item) => {
      this._items.push([item, callback], priority)
    })
    return this._start()
  },

  /**
  * put `item` at the very beginnning of the queue
  * @param {Any} item
  * @param {Function} [callback] - optional callback if item was processed
  * @return {this} for chaining
  */
  unshift (item, callback) {
    this._items.unshift([item, callback])
    return this._start()
  },

  /**
  * @param {Function} [callback] - optional callback called if all queue items got processed
  * @return {this} for chaining
  */
  drain (callback) {
    this._drain = callback
    return this
  }
}

/**
* Run queued `items` through an asynchronous `task`.
*
* Once finishing the `task` an optional callback is called.
* While pushing to the queue, you may define a priority for execution.
* Lower values means faster execution.
*
* See full API here {@link Queue}.
*
* @name queue
* @memberOf module:parallel
* @static
* @method
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Number} concurrency - max. number of tasks running in parallel
* @return {Queue}
*/
export function queue (task, concurrency) {
  return new Queue(task, concurrency)
}
