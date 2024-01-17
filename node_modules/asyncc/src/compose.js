/**
 * Run composed `tasks` callback functions in series.
 * Results from a task are passed no the next task.
 * Stops on errors and immediatelly calls optional `callback` in this case.
 *
 * @name compose
 * @memberOf module:serial
 * @static
 * @method
 * @param {...Function|Array} tasks - Arguments or Array of callback functions of type
 * `function (arg: any, cb: function)`
 * `arg` - an argument which is passed from one task to the other
 * `cb` - the callback function which needs to be called on completion
 * @return {Function} composed function of `function (arg: any, cb: function)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[callback]` - optional callback `function(err: <Error>, res: any)`
 * @example
 * var c = compose(
 *   (res, cb) => { cb(null, res + 1) },
 *   (res, cb) => { cb('error', res * 2) }, // breaks here on first error
 *   (res, cb) => { cb(null, res + 3) },
 * )
 * c(2, function (err, res) {
 *   //> err = 'error'
 *   //> res = 6
 * })
 */
export default function compose (...tasks) {
  if (tasks.length === 1 && Array.isArray(tasks[0])) {
    tasks = tasks[0]
  }

  return function (arg, callback) {
    let i = 0

    function run (err, res) {
      const fn = tasks[i++]
      if (err || !fn) {
        callback && callback(err, res)
      } else {
        fn(res, run)
      }
    }

    run(null, arg)
  }
}
