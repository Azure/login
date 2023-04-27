/**
* Serial execution patterns
* @module serial
*/
/**
* Parallel execution patterns
* @module parallel
*/

import { _setImmediate } from './_setImmediate'

import AsynccError from './AsynccError'
import compose from './compose'
import connect from './connect'
import doUntil from './doUntil'
import doWhilst from './doWhilst'
import each from './each'
import eachLimit from './eachLimit'
import eachSeries from './eachSeries'
import NoPromise, { noPromise } from './NoPromise'
import parallel from './parallel'
import parallelLimit from './parallelLimit'
import Queue, { queue } from './Queue'
import retry from './retry'
import series from './series'
import times from './times'
import until from './until'
import whilst from './whilst'

export default {
  _setImmediate,
  AsynccError,
  compose,
  connect,
  doUntil,
  doWhilst,
  each,
  eachLimit,
  eachSeries,
  noPromise,
  NoPromise,
  parallel,
  parallelLimit,
  queue,
  Queue,
  retry,
  series,
  times,
  until,
  whilst
}

export {
  _setImmediate,
  AsynccError,
  compose,
  connect,
  doUntil,
  doWhilst,
  each,
  eachLimit,
  eachSeries,
  noPromise,
  NoPromise,
  parallel,
  parallelLimit,
  queue,
  Queue,
  retry,
  series,
  times,
  until,
  whilst
}
