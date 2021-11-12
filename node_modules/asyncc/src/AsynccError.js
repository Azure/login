export default class AsynccError extends Error {
  constructor (message, errors, errpos) {
    super(message)
    Object.assign(this, {
      name: 'AsynccError',
      message,
      errors,
      errpos,
      stack: this.stack || /* istanbul ignore next */ new Error().stack
    })
  }
}
