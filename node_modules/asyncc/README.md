# asyncc

> Just async patterns

[![NPM version](https://badge.fury.io/js/asyncc.svg)](https://www.npmjs.com/package/asyncc/)
[![Build Status](https://travis-ci.org/commenthol/asyncc.svg?branch=master)](https://travis-ci.org/commenthol/asyncc)

Asynchronous patterns, no dependencies, no bloat, more isn't needed.

Runs in the browser and on node. Less than 6kB in size.

- [Latest Documentation](https://commenthol.github.io/asyncc)
- [Documentation for v1](https://commenthol.github.io/asyncc/docs_v1)
- [Migrating to v2](https://github.com/commenthol/asyncc/blob/master/doc/migrate-to-v2.md)

# Serial execution patterns

- [compose](https://commenthol.github.io/asyncc/module-serial.html#.compose)
- [connect](https://commenthol.github.io/asyncc/module-serial.html#.connect)
- [doUntil](https://commenthol.github.io/asyncc/module-serial.html#.doUntil)
- [doWhilst](https://commenthol.github.io/asyncc/module-serial.html#.doWhilst)
- [eachSeries](https://commenthol.github.io/asyncc/module-serial.html#.eachSeries)
- [NoPromise](https://commenthol.github.io/asyncc/NoPromise.html)
- [series](https://commenthol.github.io/asyncc/module-serial.html#.series)
- [times](https://commenthol.github.io/asyncc/module-serial.html#.times)
- [until](https://commenthol.github.io/asyncc/module-serial.html#.until)
- [whilst](https://commenthol.github.io/asyncc/module-serial.html#.whilst)

# Parallel execution patterns

- [each](https://commenthol.github.io/asyncc/module-parallel.html#.each)
- [eachLimit](https://commenthol.github.io/asyncc/module-parallel.html#.eachLimit)
- [parallel](https://commenthol.github.io/asyncc/module-parallel.html#.parallel)
- [parallelLimit](https://commenthol.github.io/asyncc/module-parallel.html#.parallelLimit)
- [Queue](https://commenthol.github.io/asyncc/Queue.html)

# Installation

    npm install --save asyncc

# Usage

As ES6 Modules

```js
import {NoPromise, connect} from 'asyncc'
```

As CommonJS Modules

```js
const {NoPromise, connect} = require('asyncc')
```

or picking individual methods

```js
const connect = require('asyncc/lib/connect')
```

# References

<!-- !ref -->

* [LICENSE][LICENSE]

<!-- ref! -->

[LICENSE]: ./LICENSE.txt
