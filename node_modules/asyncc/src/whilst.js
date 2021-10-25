import until from './until'

/**
* Run `task` repeatedly until `test` returns `false`.
* Calls `callback` at the first error encountered.
*
* @name whilst
* @memberOf module:serial
* @static
* @method
* @param {Function} test - test function `function (index: number)`. If return value is `false` then `callback` gets called
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: Error, result: any)` from last callback.
*
* @example
* let arr = []
* whilst(
*   (index) => (index < 4), // test
*   (cb, index) => { // task
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => { // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function whilst (test, task, callback) {
  until((n) => (!test(n)), task, callback)
}
