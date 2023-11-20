import eachLimit from './eachLimit'

/**
* Run `items` on async `task` function in parallel.
*
* Does not stop parallel execution on errors. *All tasks get executed.*
*
* @name each
* @memberOf module:parallel
* @static
* @method
* @param {Array} items - Array of items `any[]`
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Object} [options]
* @param {Number} [options.timeout] - timeout in ms which throwing `AsynccError` in case that `tasks` are still running
* @param {Boolean} [options.bail] - bail-out on first error
* @param {Function} [callback] - optional callback function called by last
* terminating function from `tasks`, needs to be of type
* `function (err: AsynccError, result: Array<any>)`
* where `err.errors` is an Array containing the errors in the same
* order as the `res` results array. `err.errpos` gives the positions of errors in
* order as they occur.
* @example
* each([1, 2, 3],
*   (item, cb, index) => {
*     cb(index % 2 ? null : 'error', item + index)
*   }, (err, res) => {
*     //> err.errors = [null, 'error', null]
*     //> err.errpos = [1]
*     //> res = [1, 4, 5]
*   }
* )
*/
export default function each (items, task, opts, callback) {
  eachLimit(0, items, task, opts, callback)
}
