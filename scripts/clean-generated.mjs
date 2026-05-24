import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const generatedDirs = [".wxt", ".output"];

await Promise.all(
  generatedDirs.map((dir) =>
    rm(resolve(root, dir), {
      force: true,
      recursive: true
    })
  )
);
