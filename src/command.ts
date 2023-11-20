import { Command } from "command/mod.ts";
import { utils, values } from "npm:@syuilo/aiscript";
import { ShellProxy } from "./shellProxy.ts";

export interface CommandOption {
  name: string;
  args: string[];
  stdout?: "piped";
  stderr?: "piped";
  stdin?: "piped";

  onCreated?: (proc: Deno.ChildProcess) => void;
}

const commandOptions: Record<number, CommandOption> = {};
let processId = 0;

export function createCommandFromOption(opt: CommandOption) {
  return new Deno.Command(opt.name, {
    args: opt.args,
    stdout: opt.stdout,
    stderr: opt.stderr,
    stdin: opt.stdin ? "piped" : undefined,
  });
}

export function createCommand(shell: ShellProxy, name: string, args: string[]) {
  const id = processId++;

  const option: CommandOption = {
    name: name,
    args: args,
  };

  commandOptions[id] = option;

  return values.OBJ(
    new Map<string, values.Value>([
      ["id", values.NUM(id)],
      [
        "pipe",
        values.FN_NATIVE(async ([obj]) => {
          utils.assertObject(obj);

          const outputHandle = obj.value.get("id");
          utils.assertNumber(outputHandle);

          const destOption = commandOptions[outputHandle.value];

          option.stdout = "piped";
          destOption.stdin = "piped";

          destOption.onCreated = async (proc) => {
            const writer = proc.stdin.getWriter();

            const cmd = createCommandFromOption(option);
            const me = cmd.spawn();
            option.onCreated?.(me);

            const reader = me.stdout.getReader();

            let closed = false;
            writer.closed.then(() => (closed = true));
            reader.closed.then(() => (closed = true));

            await writer.ready;

            while (true) {
              const chunk = await reader.read();
              if (closed || chunk.done) {
                writer.close();
                reader.cancel();
                break;
              }

              await writer.write(chunk.value);
            }
          };

          return obj;
        }),
      ],
      [
        "exec",
        values.FN_NATIVE(async () => {
          delete commandOptions[id];

          const cmd = createCommandFromOption(option);

          const proc = cmd.spawn();
          option.onCreated?.(proc);

          const status = await proc.status;

          shell.lastExitCode = status.code;

          return values.NULL;
        }),
      ],
      [
        "read",
        values.FN_NATIVE(async () => {
          delete commandOptions[id];

          option.stderr = "piped";
          option.stdout = "piped";

          const cmd = createCommandFromOption(option);

          const proc = cmd.spawn();
          option.onCreated?.(proc);

          const output = await proc.output();

          shell.lastExitCode = output.code;
          if (!output.success) {
            return values.ERROR(
              "failed_to_execute",
              values.STR(new TextDecoder().decode(output.stderr))
            );
          }

          return values.STR(new TextDecoder().decode(output.stdout));
        }),
      ],
    ])
  );
}
