const _pick = require('lodash.pick')
const fs = require('fs')
const { relative, resolve, sep } = require('path')
const glob = require('glob')
const traverse = require('traverse')
const { eachLimit } = require('asyncc')

const DEPS = '__deps'

function nodeModulesDir (dirname, isRelative) {
  let path = resolve(dirname, 'node_modules')
  if (isRelative) {
    path = relative(process.cwd(), path)
  }
  return path
}

function readJson (filename, cb) {
  fs.readFile(filename, 'utf8', (err, data) => {
    let obj = null
    if (!err && data) {
      try {
        obj = JSON.parse(data)
      } catch (e) {
        err = e
      }
    }
    cb(err, obj)
  })
}

function writeJson (filename, obj, cb) {
  fs.writeFile(filename, JSON.stringify(obj, null, 2) + '\n', 'utf8', cb)
}

function writeJsonSync (filename, obj) {
  return fs.writeFileSync(filename, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

function readPackageJsonSync (dirname) {
  const file = resolve(dirname, 'package.json')
  try {
    const stats = fs.statSync(file)
    if (stats && stats.isFile()) {
      const str = fs.readFileSync(file, 'utf8')
      return JSON.parse(str)
    }
  } catch (e) {

  }
}

function findPackages (dirname, cb) {
  const modules = nodeModulesDir(dirname)
  glob(`${modules}/**/package.json`, cb)
}

function extract (path, cb) {
  readJson(path, (err, pckg) => {
    let obj = null
    if (!err && pckg) {
      obj = Object.assign(
        _pick(pckg, ['name', 'version', '_id', '_integrity', '_resolved', '_shasum', '_spec']),
        { path }
      )
      if (!obj._id) {
        obj._id = `${obj.name}@${obj.version}`
      }
      if (!obj._spec) {
        obj._spec = `${obj.name}@^${obj.version}`
      }
    }
    cb(err, obj)
  })
}

function packagePath (path) {
  const splt = path.split(sep)
  splt.pop() // strip-off package.json
  const arr = []
  let tmp = []

  const pushToArr = () => {
    const scoped = /^@/.test(tmp[0])
    if (
      (tmp.length > 1 && !scoped) ||
      (tmp.length > 2 && scoped)
    ) {
      tmp = []
    }
    if (tmp.length) {
      arr.push(tmp.join('/'))
    }
    tmp = []
  }

  while (splt.length) {
    const curr = splt.shift()
    if (curr === 'node_modules') {
      pushToArr()
    } else {
      tmp.push(curr)
    }
  }
  pushToArr()
  return arr
}

function _sanitizeTree (tree) {
  return traverse(tree).map(function () {
    // remove empty DEPS: {}
    if (this.key === DEPS && !Object.keys(this.node).length) {
      this.delete()
    }
    // remove nodes where name from path does not match package name
    if (this.key === 'name' && this.parent.key !== this.node) {
      this.parent.delete()
    }
  })
}

function buildTree (pckgfiles, dirname, cb) {
  const tree = {}

  const add = (path, info) => {
    let tmp = tree
    let last = {}
    path.forEach((p) => {
      if (!tmp[p]) {
        tmp[p] = {}
        tmp[p][DEPS] = {}
      }
      last = tmp[p]
      tmp = tmp[p][DEPS]
    })
    Object.assign(last, info)
  }

  eachLimit(25,
    pckgfiles,
    (path, cb) => {
      extract(path, (err, data) => {
        const modules = packagePath(relative(dirname, path))
        add(modules, data)
        cb(err)
      })
    },
    (err) => {
      if (err) {
        cb(err)
      } else {
        cb(null, _sanitizeTree(tree))
      }
    }
  )
}

module.exports = {
  DEPS,
  nodeModulesDir,
  readJson,
  writeJson,
  writeJsonSync,
  readPackageJsonSync,
  findPackages,
  extract,
  packagePath,
  _sanitizeTree,
  buildTree
}
