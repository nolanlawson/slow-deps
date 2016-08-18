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
| browserify           | 20.5s | 14 MB  | 94     |
| promises-aplus-tests | 7.7s  | 2.4 MB | 24     |
| jshint               | 6.9s  | 4.6 MB | 26     |
| istanbul             | 6.2s  | 5.1 MB | 27     |
| mocha                | 4.6s  | 924 KB | 16     |
| uglify-js            | 3.9s  | 1.7 MB | 18     |
| immediate            | 1.3s  | 24 KB  | 0      |
--------------------------------------------------
Total time: 51s
Total size: 29 MB
```

Details
----


Run this in a directory with a `package.json`, and it will analyze all the `dependencies`, 
`devDependencies`, and `optionalDependencies`, then `npm install` each one in a temporary 
directory with a temporary cache, then measure the install times, as well as the size on disk and the total number of transitive dependencies.

Note that this doesn't measure the cost of npm de-duplicating the sub-dependencies; 
it only measures the time for installing each dependency independently.

It's also worth noting that because this tool creates a temporary npm cache while it works,
you'll be seeing the _uncached_ time for each package. Therefore your actual `npm install` should run a bit faster,
assuming everythign is cached.
