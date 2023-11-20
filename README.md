# aish - aiscript shell

* This software is unofficial and not related to [aiscript-dev](https://github.com/aiscript-dev/).

```plain
$ aish -h

Usage:   aish
Version: 0.1.0

Options:

  -h, --help     - Show this help.
  -V, --version  - Show the version number for this program.

Commands:

  run   <path>  - execute script file.
  repl          - run repl.

$ aish repl
> Core:ai
"kawaii"
```

# Installation

```sh
deno install -A -n aish --import-map https://raw.githubusercontent.com/ikasoba/aish/main/import_map.json https://raw.githubusercontent.com/ikasoba/aish/main/cli.ts
```

# About

aish automatically turns undeclared variables into helpers for executing commands.

You can also declare variables in the same way as in regular aiscript.
```plain
> echo("Hello, world!").exec()
Hello, world!
null
> echo(1).pipe(xargs("expr", 1, "+")).exec()
2
null
```

# API Reference

## Command#exec(): null
The `exec` method of the command outputs standard output and standard error as is and returns `null`.

## Command#read(): str | error
Command's `read` method is used to retrieve stdout and stderr.

Only in case of an error, the standard error is returned.

## FakeModule:import(path: str): obj

- This feature is experimental.

This feature can be used to load external aiscript code.

As a precaution, some features such as namespaces will not be available.

This is because aish internally executes the contents of the code as a function.

Module loading is performed according to the following rules

- If the `path` starts with `/`, then

  Load from `<home>/.aish/`.

- Otherwise.

  Import from the same hierarchy as the running script file.

Also, JavaScript can be loaded.

### example

```js
// ./hoge.is

@add(x, y) {
  return x + y
}

return {
  add: add
}
```


```js
// ./hoge.js

import { values, utils } from "@syuilo/aiscript/";

export default () => (
  values.OBJ(new Map([
    ["add", values.FN_NATIVE(([x, y]) => {
      utils.assertNumber(x);
      utils.assertNumber(y);

      return values.NUM(x.value + y.value);
    })]
  ]))
)
```

```js
let Hoge = FakeModule:import("./hoge.is")

<: Hoge.add(1, 2)

// or

let Hoge = FakeModule:import("./hoge.js")

<: Hoge.add(1, 2)
```

# .aishrc

`aish` has a `.bashrc` like feature called `.aishrc`.

It must be placed as valid AiScript code directly under the user's home directory (such as `/home/user/.aishrc`).
