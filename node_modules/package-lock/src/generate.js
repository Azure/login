const _get = require('lodash.get')
const { DEPS } = require('./utils')

const PRIVATE = '@private/private'

function toPackageName (name) {
  return name.replace(/^@/, '').replace(/[/]/g, '-')
}

function genPackageLock (tree, pckg, options) {
  pckg = Object.assign({ name: PRIVATE, version: '1.0.0' }, pckg)
  options = options || {}

  const convert = (o, level, opts) => {
    level++
    const t = {}
    if (o.version) {
      t.version = o.version
    }
    if (o._resolved) {
      if (options.resolve) {
        const pn = toPackageName(o.name)
        t.resolved = `${options.resolve}/${pn}/-/${pn}-${o.version}.tgz`
      } else {
        t.resolved = o._resolved
      }
    }
    if (o._integrity) {
      t.integrity = o._integrity
    }
    /* === t.dev disabled as we would need the full tree from a package.json
    if (o.name) {
      if (level === 2) {
        if (pckg && pckg.dependencies) {
          if (typeof pckg.dependencies[o.name] === 'undefined') {
            t.dev = true
          }
        } else {
          t.dev = true
        }
        if (t.dev) opts.dev = true
      } else if (opts.dev) {
        t.dev = true
      }
    }
    */
    if (o[DEPS]) {
      t.requires = {}
      Object.keys(o[DEPS]).sort().forEach((k) => {
        const { name, version } = o[DEPS][k]
        if (k === name) {
          t.requires[name] = version
        }
      })
      Object.keys(o[DEPS]).sort().forEach((k) => {
        if (o[DEPS][k][DEPS]) {
          if (!t.dependencies) t.dependencies = {}
          t.dependencies[k] = convert(o[DEPS][k], level, opts)
        }
      })
    } else {
      Object.keys(o).sort().forEach((k) => {
        if (k === o[k].name) {
          t[k] = convert(o[k], level, opts)
        }
      })
    }
    return t
  }

  const obj = {
    name: pckg.name,
    version: pckg.version,
    lockfileVersion: 1,
    requires: true,
    dependencies: convert(tree, 0, {})
  }

  return obj
}

function genPackageJson (tree, pckg) {
  pckg = Object.assign({ name: PRIVATE, version: '1.0.0' }, pckg)

  Object.keys(tree).forEach((name) => {
    const hasDep = _get(pckg, ['dependencies', name]) ||
      _get(pckg, ['devDependencies', name])
    const version = _get(tree, [name, 'version'])
    if (!hasDep && version) {
      if (!pckg.optionalDependencies) pckg.optionalDependencies = {}
      pckg.optionalDependencies[name] = `^${version}`
    }
  })

  return pckg
}

module.exports = {
  toPackageName,
  genPackageLock,
  genPackageJson
}
