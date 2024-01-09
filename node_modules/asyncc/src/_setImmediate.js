/**
* setImmediate wrapper for different environments
* @method _setImmediate
* @static
*/
export const _setImmediate = (function () {
  /* istanbul ignore next */
  if (typeof process === 'object' && typeof process.nextTick === 'function') {
    // nodejs
    return process.nextTick
  } else if (typeof setImmediate === 'function') {
    // supporting browsers
    return setImmediate
  } else {
    // fallback
    return function (fn) {
      setTimeout(fn, 0)
    }
  }
})()
