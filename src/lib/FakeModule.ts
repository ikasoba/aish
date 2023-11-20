import { Interpreter, Parser, Scope, utils, values } from "@syuilo/aiscript/";
import dir from "dir/mod.ts";
import { dirname, extname, join, resolve, toFileUrl } from "path/mod.ts";

export class FakeModule {
  private cache = new Map<string, values.VObj>();

  constructor(public basePath: string, public runtime: Interpreter) {}

  installFakeModule(scope: Scope, basePath = this.basePath) {
    scope.add("FakeModule:root", {
      isMutable: false,
      value: values.STR(basePath),
    });

    scope.add("FakeModule:import", {
      isMutable: false,
      value: values.FN_NATIVE(async ([path]) => {
        utils.assertString(path);

        return await this.import(path.value, basePath);
      }),
    });
  }

  async import(
    path: string,
    basePath = this.basePath
  ): Promise<values.VObj | values.VNull> {
    let modulePath: string;

    if (path.startsWith("/")) {
      modulePath = resolve(join(dir("home")!, ".aish", path));
    } else {
      modulePath = resolve(join(basePath, path));
    }

    const moduleRoot = dirname(modulePath);
    if (this.cache.has(modulePath)) return this.cache.get(modulePath)!;

    switch (extname(modulePath)) {
      case ".aishrc":
      case ".is": {
        const scope = this.runtime.scope.createChildScope();
        this.installFakeModule(scope, moduleRoot);

        const moduleSource = await Deno.readTextFile(modulePath);

        const moduleAst = Parser.parse(moduleSource);

        let exports = await this.runtime.execFn(
          values.FN([], moduleAst, scope),
          []
        );

        if (exports.type === "null") {
          exports = values.OBJ(new Map());
        }

        utils.assertObject(exports);

        this.cache.set(modulePath, exports);

        return exports;
      }

      case ".js":
      case ".ts": {
        const mod: { default: (runtime: Interpreter) => values.VObj | void } =
          await import(toFileUrl(modulePath).toString());

        let exports = mod.default(this.runtime);
        if (exports === undefined) {
          exports = values.OBJ(new Map());
        }

        utils.assertObject(exports);

        this.cache.set(modulePath, exports);

        return exports;
      }
    }

    return values.NULL;
  }
}
