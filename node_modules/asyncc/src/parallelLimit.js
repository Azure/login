import parallel from './_parallel'

/**
* Run `tasks` callback functions in parallel limited to `limit` parallel
* running tasks.
*
* Does not stop parallel execution on errors. *All tasks get executed.*
* The optional `callback` gets called after the longest running task finishes.
*
* @name parallelLimit
* @memberOf module:parallel
* @static
* @method
* @param {Number} limit - number of tasks running in parallel
* @param {Array} tasks - Array of callback functions of type `function (cb: Function)`
* @param {Object} [options]
* @param {Number} [options.timeout] - timeout in ms which throwing `AsynccError` in case that `tasks` are still running
* @param {Boolean} [options.bail] - bail-out on first error
* @param {Function} [callback] - optional callback function called by last
* terminating function from `tasks`, needs to be of type
* `function (err: AsynccError, result: Array<any>)`
* where `err.errors` is an Array containing the errors in the same
* order as the `res` results array. `err.errpos` gives the positions of errors in
* order as they occur.
*
* @example
* // runs 2 tasks in parallel
* parallelLimit(2, [
*   (cb) => { cb(null, 1) },
*   (cb) => { cb('error', 2) },
*   (cb) => { cb(null, 3) }
* ], (err, res) => {
*   //> err.errors = [null, 'error', null]
*   //> err.errorpos = [1]
*   //> res = [1, 2, 3]
* })
*/
export default function parallelLimit (limit, tasks, opts, callback) {
  function run (j, cb) {
    tasks[j]((err, res) => {
      cb(j, err, res)
    })
  }
  parallel(limit, tasks.length, run, opts, callback)
}
