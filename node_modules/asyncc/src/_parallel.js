import AsynccError from './AsynccError'

export default function parallel (limit, length, run, opts = {}, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  limit = Math.abs(limit || length)
  const errpos = []
  const errors = new Array(length).fill()
  const results = new Array(length).fill()
  let i = 0
  let l = length
  let done = 0

  if (l === 0) {
    final()
    return
  }

  if (opts.timeout) {
    setTimeout(() => {
      /* istanbul ignore else */
      if (l) final('err_timeout')
    }, opts.timeout)
  }
  limit = limit < length ? limit : length

  while (i < limit) {
    run(i++, cb)
  }

  function final (errMsg) {
    if (done++) return
    let err = null
    if (errpos.length || errMsg) {
      err = new AsynccError(errMsg || 'err', errors, errpos)
    }
    callback && callback(err, results)
  }

  function cb (j, err, res) {
    results[j] = res
    errors[j] = err
    if (err) {
      errpos.push(j)
      if (opts.bail) {
        final('err_bail')
        return
      }
    }
    l--
    if (i < length) {
      run(i++, cb)
    } else if (!l) {
      final()
    }
  }
}
