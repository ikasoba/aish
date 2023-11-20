import { values } from "@syuilo/aiscript/";
import { MapProxy } from "./proxy.ts";
import { reprValue } from "@syuilo/aiscript/interpreter/util.js";
import { Variable } from "@syuilo/aiscript/interpreter/variable.js";
import { createCommand } from "./command.ts";

export class ShellProxy {
  public lastExitCode = 0;

  constructor(
    public environ = values.OBJ(
      new MapProxy({
        get: (name) => {
          const value = Deno.env.get(name);
          return value ? values.STR(value) : undefined;
        },
        set: (name, value) => {
          Deno.env.set(name, reprValue(value));
        },
        has: (name) => {
          return Deno.env.has(name);
        },
        entries: () => {
          return Object.entries(Deno.env.toObject())
            .map(([k, v]): [string, values.Value] => [k, values.STR(v)])
            .values();
        },
      })
    )
  ) {}

  createProxy() {
    return new MapProxy<string, Variable>({
      get: (name) => {
        switch (name) {
          case "Sh:exit_code":
            return Variable.const(values.NUM(this.lastExitCode ?? 0));

          case "Sh:environ":
            return Variable.const(this.environ);

          default:
            return Variable.const(
              values.FN_NATIVE(async (args) => {
                return createCommand(
                  this,
                  name,
                  args.map((x) => (x ? reprValue(x) : ""))
                );
              })
            );
        }
      },
      has() {
        return true;
      },
    });
  }
}
