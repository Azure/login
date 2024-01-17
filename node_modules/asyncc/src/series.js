import { _setImmediate } from './_setImmediate'

/**
* Run `tasks` callback functions in series
* The function breaks after the first error encountered and calls optional
* `callback` function
*
* @name series
* @memberOf module:serial
* @static
* @method
* @param {Array} tasks - Array of callback functions of type `function (cb: Function)`
* @param {Function} [callback] - optional callback function called by last
* terminating function from `tasks`, needs to be of type
* `function (err: Error, res: Array<any>)`
*
* @example
* series([
*   (cb) => { cb(null, 1) },
*   (cb) => { cb('error', 2) }, // breaks on first error
*   (cb) => { cb(null, 3) },
* ], (err, res) => {
*   //> err = 'error'
*   //> res = [1, 2]
* })
*/
export default function series (tasks, callback) {
  const length = tasks.length
  const results = []
  let i = 0

  if (length === 0) {
    callback(null, [])
    return
  }

  run()

  function run () {
    tasks[i++](cb)
  }

  function cb (err, res) {
    results.push(res)
    /* istanbul ignore else */
    if (err || length === i) {
      callback && callback(err, results)
    } else if (i < length) {
      _setImmediate(() => { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run()
      })
    }
  }
}
