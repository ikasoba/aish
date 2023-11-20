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

## Command#exec(): null
The `exec` method of the command outputs standard output and standard error as is and returns `null`.

## Command#read(): str | error
Command's `read` method is used to retrieve stdout and stderr.

Only in case of an error, the standard error is returned.
