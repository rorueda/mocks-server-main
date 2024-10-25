import { PROJECT_NAME } from "../constants.mjs";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { copyWorkspaceFileToProject } from "../../../../scripts/projects/utils.js";

async function copyDocs() {
  await Promise.all([
    copyWorkspaceFileToProject(PROJECT_NAME, "README.md"),
    copyWorkspaceFileToProject(PROJECT_NAME, "LICENSE"),
    copyWorkspaceFileToProject(PROJECT_NAME, "NOTICE"),
  ]);
}

copyDocs();
