#!/usr/bin/env node

'use strict'

if (!global.Promise) {
  global.Promise = require('lie')
}
var temp = require('temp')
var fs = require('fs')
var exec = require('child-process-promise').exec
var denodeify = require('denodeify')
var shellEscape = require('any-shell-escape')
var extend = require('js-extend').extend
var mkdir = denodeify(temp.mkdir)
var readFile = denodeify(fs.readFile)
var readdir = denodeify(fs.readdir)
var stat = denodeify(fs.stat)
var writeFile = denodeify(fs.writeFile)
var appendFile = denodeify(fs.appendFile)
var path = require('path')
var now = require('performance-now')
var ProgressBar = require('progress')
var getFolderSize = denodeify(require('get-folder-size'))
var prettierBytes = require('prettier-bytes')
var prettyMs = require('pretty-ms')
var tablify = require('tablify').tablify
var sum = require('math-sum')
var ncp = denodeify(require('ncp'))
temp.track()

function getDeps () {
  return readFile('package.json', 'utf8').then(function (str) {
    var json = JSON.parse(str)
    var deps = extend({}, json.dependencies, json.optionalDependencies)
    if (process.argv.indexOf('--production') === -1) {
      extend(deps, json.devDependencies)
    }
    console.log('Analyzing ' + Object.keys(deps).length + ' dependencies...')
    return deps
  }).catch(function () {
    throw new Error('No package.json in the current directory.')
  })
}

function createEmptyNpmrc (dir) {
  return writeFile(path.join(dir, '.npmrc'), '', 'utf8')
}

function setupNpmrc (toDir) {
  // copy .npmrc from current directory if possible
  return stat('.npmrc').then(function (file) {
    if (file.isFile()) {
      return ncp('.npmrc', path.join(toDir, '.npmrc'))
    }
    return createEmptyNpmrc(toDir)
  }).catch(function () {
    return createEmptyNpmrc(toDir)
  })
}

function doNpmInstalls (deps) {
  var promise = Promise.resolve()
  var bar = new ProgressBar('[:bar] :percent :etas', {
    total: Object.keys(deps).length,
    width: 20
  })
  var times = []

  function install (dep, version, dir) {
    var cache = path.join(dir, '.cache')
    var nodeModules = path.join(dir, 'node_modules')

    return setupNpmrc(dir).then(function () {
      // set the cache to a local cache directory
      return appendFile(path.join(dir, '.npmrc'), '\ncache=' + cache, 'utf8')
    }).then(function () {
      var start = now()
      return exec(shellEscape([ 'npm', 'install', dep + '@' + version ]), {
        cwd: dir,
        env: process.env
      }).then(function () {
        var totalTime = now() - start
        return getFolderSize(nodeModules).then(function (size) {
          return readdir(nodeModules).then(function (subDeps) {
            times.push({
              time: totalTime,
              size: size,
              dep: dep,
              subDeps: subDeps.length - 1
            })
            bar.tick()
          })
        })
      })
    })
  }

  Object.keys(deps).forEach(function (dep) {
    var version = deps[dep]
    promise = promise.then(function () {
      return mkdir('')
    }).then(function (dir) {
      return install(dep, version, dir)
    })
  })
  return promise.then(function () {
    return report(times)
  })
}

function report (times) {
  times = times.sort(function (a, b) {
    return b.time - a.time
  })
  var header = ['Dependency', 'Time', 'Size', '# Deps']
  var table = [header].concat(times.map(function (time) {
    return [
      time.dep,
      prettyMs(time.time),
      prettierBytes(time.size),
      time.subDeps
    ]
  }))
  console.log(tablify(table, {
    show_index: false,
    has_header: true
  }))
  console.log('Total time (non-deduped): ' + prettyMs(sum(times.map(function (time) {
    return time.time
  }))))
  console.log('Total size (non-deduped): ' + prettierBytes(sum(times.map(function (time) {
    return time.size
  }))))
}

Promise.resolve().then(function () {
  return getDeps()
}).then(function (deps) {
  return doNpmInstalls(deps)
}).then(function () {
  process.exit(0)
}).catch(function (err) {
  console.error(err)
  console.error(err.stack)
  process.exit(1)
})
