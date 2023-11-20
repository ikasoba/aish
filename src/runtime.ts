import { Interpreter, Scope } from "@syuilo/aiscript/";
import { reprValue } from "@syuilo/aiscript/interpreter/util.js";
import { Variable } from "@syuilo/aiscript/interpreter/variable.js";
import { ShellProxy } from "./shellProxy.ts";
import { FakeModule } from "./lib/FakeModule.ts";
import dir from "dir/mod.ts";
import { join } from "path/join.ts";
import { loadRcFile } from "./rcfile.ts";

export async function createRuntime(mode: "repl" | "normal", basePath: string) {
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

  const fakeModule = new FakeModule(basePath, runtime);
  fakeModule.installFakeModule(scope);

  runtime.scope = scope;

  await loadRcFile(fakeModule);

  return runtime;
}
