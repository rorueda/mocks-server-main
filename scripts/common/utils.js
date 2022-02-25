import fsExtra from "fs-extra";

const READ_WRITE_FILE_OPTIONS = {
  encoding: "utf8",
};

export function dirName(importMetaUrl) {
  return new URL(".", importMetaUrl).pathname;
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

export function catchCommandError(command) {
  return command.catch((error) => {
    console.log(error);
    process.exit(1);
  });
}

export function readFile(filePath) {
  return fsExtra.readFile(filePath, READ_WRITE_FILE_OPTIONS);
}
