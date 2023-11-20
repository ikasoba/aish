import { Command } from "command/mod.ts";
import { createRuntime } from "./src/runtime.ts";
import { Parser } from "npm:@syuilo/aiscript";

const program = new Command()
  .name("aish")
  .version("0.1.0")
  .action(async () => {
    if (!Deno.isatty(Deno.stdin.rid)) {
      const runtime = createRuntime("normal");
      const decoder = new TextDecoder();
      let src = "";

      for await (const chunk of Deno.stdin.readable) {
        src += decoder.decode(chunk);
      }

      await runtime.exec(Parser.parse(src));
    } else {
      await program.parse(["repl"]);
    }
  });

program
  .command("run", "execute script file.")
  .arguments("<path:string>")
  .action(async (_, path) => {
    const runtime = createRuntime("normal");
    const src = await Deno.readTextFile(path);

    await runtime.exec(Parser.parse(src));
  });

program.command("repl", "run repl.").action(async () => {
  const runtime = createRuntime("repl");
  let code = "";
  let msg = ">";

  console.log(
    "# Welcome to aish!\n" +
      "aiscript is available in this shell.\n" +
      "You can also use `<: help` to display the URL of the official aiscript documentation.\n"
  );

  while (true) {
    const line = prompt(msg);
    if (line?.endsWith("\\")) {
      code += line.slice(0, -1) + "\n";

      msg = ".";
    } else {
      code += line ?? "";

      try {
        await runtime.exec(Parser.parse(code));
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.constructor.name + ":", err.message);
        } else {
          console.error(err);
        }
      }

      code = "";

      msg = ">";
    }
  }
});

program.parse(Deno.args);
