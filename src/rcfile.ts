import { Scope } from "@syuilo/aiscript/";
import { FakeModule } from "./lib/FakeModule.ts";
import dir from "dir/mod.ts";
import { join } from "path/join.ts";
import { expandGlob } from "fs/mod.ts";

export async function loadRcFile(fakeModule: FakeModule) {
  const userHomePath = dir("home");
  if (userHomePath == null) return;

  try {
    await fakeModule.import(".aishrc", userHomePath);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      console.error(err);
    }

    console.log(
      "# Welcome to aish!\n" +
        "aiscript is available in this shell.\n" +
        "You can also use `<: help` to display the URL of the official aiscript documentation.\n"
    );
  }
}
