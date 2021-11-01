import doUntil from './doUntil'

/**
* Run `task` one or more times until `test` returns `false`.
* Calls `callback` at the first error encountered.
*
* @name doWhilst
* @memberOf module:serial
* @static
* @method
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} test - test function `function (index: number)`. If return value is `false` then `callback` gets called
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* let arr = []
* doWhilst(
*   (cb, index) => {    // task
*     arr.push(index)
*     cb(null, index)
*   }, (index) => {     // test
*     return index < 4
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function doWhilst (task, test, callback) {
  doUntil(task, (n) => !test(n), callback)
}
