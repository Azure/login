import { _setImmediate } from './_setImmediate'

/**
* @private
*/
export function _times (num, opts) {
  opts = opts || {}
  let fn = _setImmediate
  let lag = 0
  let times = num
  if (typeof num !== 'number') {
    times = num.times
    lag = num.lag || 0
  }
  times = times || opts.times || 0
  if (lag) fn = setTimeout
  return { times, lag, fn }
}
