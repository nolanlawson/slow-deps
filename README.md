slow-deps [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
====

CLI to measure which dependencies in a project are the slowest to `npm install`.

Usage
----

    npm install -g slow-deps
    slow-deps

Example output
----

```
Analyzing 7 dependencies...
[====================] 100% 0.0s
--------------------------------------------------
| Dependency           | Time  | Size   | # Deps |
--------------------------------------------------
| browserify           | 22.2s | 14 MB  | 94     |
| jshint               | 7.9s  | 4.6 MB | 26     |
| istanbul             | 7s    | 5.1 MB | 27     |
| promises-aplus-tests | 5.4s  | 2.4 MB | 24     |
| uglify-js            | 4.4s  | 1.7 MB | 18     |
| mocha                | 4.3s  | 924 KB | 16     |
| immediate            | 1.3s  | 24 KB  | 0      |
--------------------------------------------------
Total time (non-deduped): 52.6s
Total size (non-deduped): 29 MB
```

Details
----


Run this in a directory with a `package.json`, and it will take all the `dependencies`, 
`devDependencies`, and `optionalDependencies`, then `npm install` each one in a temporary 
directory with a temporary cache, then measure the install times. Each dependency is then listed out 
from slowest to fastest.

In additon to the install time, the size on disk and the total number of transitive dependencies are also printed.

Note that this doesn't measure the cost of npm de-duplicating the sub-dependencies; 
it only measures the time for installing each dependency independently. So the "total time" and "total size"
are both just rough estimates, as are the per-package times, because you may have packages with many common
dependencies that would therefore get de-duped.

It's also worth noting that because this tool creates a temporary npm cache while it works,
you'll be seeing the _uncached_ time for each package. Therefore your actual `npm install` should run a bit faster,
assuming everything is cached.

Options
----

    slow-deps --production

Tells slow-deps to skip over devDependencies.

Credits
---

Huge shout-out to [Michael Hart](https://twitter.com/hichaelmart) for the inspiration for this tool!

Related
----

- [pkgfiles](https://www.npmjs.com/package/pkgfiles) - see your project's npm package size before publishing
- ["files" in package.json](https://docs.npmjs.com/files/package.json#files)
- ["bundledDependencies" in package.json](https://docs.npmjs.com/files/package.json#bundleddependencies)
