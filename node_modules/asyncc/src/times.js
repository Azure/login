import { _times } from './_utils'

/**
* Run `task` repeatedly until number `times` is reached.
*
* Stops at the first error encountered.
* An optional `lag` between retries may be used.
*
* @name times
* @memberOf module:serial
* @static
* @method
* @param {Number|Object} times - runs `times` times. If `times < 0` then "times" cycles endlessly until an error occurs.
* @param {Number} [times.times=0] - max. number of retries
* @param {Number} [times.lag=0] - time-lag in ms between retries
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: Error, result: Array<any>)`
*
* @example
* let arr = []
* times({times: 4, lag: 100}, // 4 times with 100ms time-lag between retries
*   (cb, index) => {
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function times (num, task, callback) {
  let i = 0
  const { times, lag, fn } = _times(num)

  if (times) {
    run()
  } else {
    callback && callback()
  }

  function cb (err, res) {
    if (err || (times > 0 && i >= times)) {
      callback && callback(err, res)
    } else {
      fn(() => {
        run()
      }, lag)
    }
  }

  function run () {
    task(cb, i++)
  }
}
