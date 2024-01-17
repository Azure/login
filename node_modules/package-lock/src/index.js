const { compose } = require('asyncc')
const {
  findPackages,
  buildTree,
  writeJsonSync,
  readPackageJsonSync
} = require('./utils')
const {
  genPackageLock,
  genPackageJson
} = require('./generate')

/**
* @param {object} options
* @param {string} [options.resolve] - url to replace for all resolved package uris
* @param {boolean} [options.lock=true] - write new `package-lock.json` file
* @param {boolean} [options.package=false] - if `true` force appending `optionalDependencies` in `package.json`
* @param {function} cb - `(err, tree) => {}`
*/
function proc (options, cb) {
  options = Object.assign({
    lock: true,
    package: false
  }, options)

  const dirname = options.dirname || process.cwd()
  compose(
    (nul, cb) => findPackages(dirname, cb),
    (pckgfiles, cb) => buildTree(pckgfiles, dirname, cb)
  )(null, (err, tree) => {
    if (err) {
      cb(err)
      return
    }
    const pckg = readPackageJsonSync(dirname)
    const newLock = genPackageLock(tree, pckg, options)
    const newPckg = genPackageJson(tree, pckg)

    if (options.lock) {
      const file = options.shrink ? 'npm-shrinkwrap.json' : 'package-lock.json'
      writeJsonSync(file, newLock)
    }
    if (options.package || !pckg) {
      writeJsonSync('package.json', newPckg)
    }
    cb && cb(null, newLock)
  })
}

module.exports = proc
