import parallel from './_parallel'

/**
* Run `items` on async `task` function in parallel limited to `limit` parallel.
*
* Does not stop parallel execution on errors. *All tasks get executed.*
*
* @name eachLimit
* @memberOf module:parallel
* @static
* @method
* @param {Number} limit - number of tasks running in parallel
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
* eachLimit(2, [1, 2, 3, 4],
*   (item, cb, index) => {
*     cb(index % 2 ? null : 'error', item + index)
*   }, (err, res) => {
*     //> err.errors = [null, 'error', null, 'error']
*     //> err.errpos = [1, 3]
*     //> res = [1, 4, 5, 7]
*   }
* )
*/
export default function eachLimit (limit, items, task, opts, callback) {
  function run (j, cb) {
    task(items[j], (err, res) => {
      cb(j, err, res)
    }, j)
  }
  parallel(limit, items.length, run, opts, callback)
}
