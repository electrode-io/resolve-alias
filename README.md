# resolve alias

In some `lib/subdir1/subdir2/subdir3/foo.js` file:

Instead of:

```js
const blah = require("../../../bar.js");
```

you can do:

```js
const blah = require("$lib/bar.js");
```

By registering an alias `$lib` that points to the lib directory.

For example, you might do that in `lib/index.js`:

```js
const resolveAlias = require("@xarc/resolve-alias");
resolveAlias.add("$lib", __dirname); // make $lib an alias that point to the lib directory
```

- alias convention:

  1. cannot start with `.` or be an absolute path.
  2. cannot contain `/` except if it starts with `@`, then it can contain one `/` (ie: npm scope).
  3. cannot contain any space.

- default alias `_cwd` points to `process.cwd()`

- alias can provide a function:

```js
resolveAlias.add("_woo", (alias, requestPath, fullRequest) => {
  return "lib";
});
```

For example: `require("@alias/blah/lib/api.js")` would call the function with:

1. `alias`: `"@alias/blah"`
2. `requestPath`: `"lib/api.js"`
3. `fullRequest`: `"@alias/blah/lib/api.js"`

## enable/disable

```js
resolveAlias.enable = false;
```

## remove

```js
resolveAlias.remove("@foo");
```

# License

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

---
