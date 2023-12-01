# package-lock

> (Re-)Build package-lock.json or npm-shrinkwrap.json file from node_modules folder

## `npm@5` Creating `package-lock.json`

Copying `node_modules` folders and trying to install additional packages leads to
a complete removal of all copied packages with `npm@>=5.0`.

A `package.json` file would solve this issue but nonetheless you would need to
create one with all it's dependencies.

Running `package-lock` on the folder which contains `node_modules` creates the
missing `package-lock.json` file and in case the `package.json` is missing, it
will be created as well. With this you are now save to install additional
packages with `npm i ...`

## `npm@4`, `npm@3` Creating `npm-shrinkwrap.json`

For `npm@<=4.x` you can also use this package to create a `npm-shrinkwrap.json`
file for fixing you dependencies. For me running `npm shrink` is mostly a mess
as there is always an `extraneous` dependency showing up (especially after a dedup).

1. Make a fresh install with    
   ```
   rimraf node_modules npm-shrinkwrap.json
   npm i --production
   ```
2. Now create the `npm-shrinkwrap.json` file with
   ```
   package-lock -s
   ```

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install -g package-lock
```

## Usage

```sh
$ package-lock
```
```
Usage: package-lock [options]

Options:

  -p, --package           force appending found packages to `optionalDependencies` in package.json
  -r, --resolve <string>  replace resolved repository
  -s, --shrink            write `npm-shrinkwrap.json` instead of `package-lock.json`
  -h, --help              output usage information
```



## Tests

```sh
$ npm test
```

## License

Unlicense http://unlicense.org
