slow-deps
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
Combined time: 52.6s
Combined size: 29 MB
```

Details
----


Run this in a directory with a `package.json`, and it will take all the `dependencies`, 
`devDependencies`, and `optionalDependencies`, then `npm install` each one in a temporary 
directory with a temporary cache, then measure the install times. Each dependency is then listed out 
from slowest to fastest.

In additon to the install time, the size on disk and the total number of transitive dependencies are also printed.

Note that this doesn't measure the cost of npm de-duplicating the sub-dependencies; 
it only measures the time for installing each dependency independently. So the "combined time" and "combined size"
are both just rough estimates, as are the per-package times, because you may have packages with many common
dependencies that would therefore get de-duped.

It's also worth noting that because this tool creates a temporary npm cache while it works,
you'll be seeing the _uncached_ time for each package. Therefore your actual `npm install` should run a bit faster,
assuming everythign is cached.
