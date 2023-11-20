import { Interpreter, Scope } from "npm:@syuilo/aiscript";
import { reprValue } from "npm:@syuilo/aiscript/interpreter/util.js";
import { Variable } from "npm:@syuilo/aiscript/interpreter/variable.js";
import { ShellProxy } from "./shellProxy.ts";

export function createRuntime(mode: "repl" | "normal") {
  const runtime = new Interpreter(
    {},
    {
      async in(q) {
        return prompt(q) ?? "";
      },
      out(value) {
        console.log(reprValue(value));
      },
      err(err) {
        console.error(err);
      },
      log(type, param) {
        if (type == "end" && mode === "repl") {
          console.log(reprValue(param.val, true));
        }
      },
    }
  );

  const scope = new Scope([
    runtime.scope.getAll(),
    new ShellProxy().createProxy(),
  ]);

  runtime.scope = scope;

  return runtime;
}
