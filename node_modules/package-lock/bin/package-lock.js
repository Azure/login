#!/usr/bin/env node

const proc = require('..')
const cmd = require('commander')

cmd
  .option('-p, --package', 'force appending found packages to `optionalDependencies` in package.json')
  .option('-r, --resolve <string>', 'replace resolved repository')
  .option('-s, --shrink', 'write `npm-shrinkwrap.json` instead of `package-lock.json`')
  .parse(process.argv)

proc(cmd, (err) => {
  if (err) {
    console.error('' + err)
  }
})
