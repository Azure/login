import { _setImmediate } from './_setImmediate'

/**
* Run `task` repeatedly until `test` returns `true`.
* Calls `callback` at the first error encountered.
*
* @name until
* @memberOf module:serial
* @static
* @method
* @param {Function} test - test function `function (index: number)`. If return value is `true` then `callback` gets called
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
*
* @example
* let arr = []
* until(
*   (index) => {        // test
*     return index >= 4
*   }, (cb, index) => { // task
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function until (test, task, callback) {
  let i = 0

  function cb (err, res) {
    if (err || test(i)) {
      callback && callback(err, res)
    } else {
      _setImmediate(() => { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run()
      })
    }
  }

  function run () {
    task(cb, i++)
  }

  if (!test(i)) {
    run()
  } else {
    callback && callback()
  }
}
