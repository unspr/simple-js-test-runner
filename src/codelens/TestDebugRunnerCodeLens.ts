import { CodeLens, Range, WorkspaceFolder } from "vscode";

export default class TestDebugRunnerCodeLens extends CodeLens {
  constructor(
    rootPath: WorkspaceFolder,
    fileName: string,
    testName: string,
    range: Range,
    title: string = "Debug Test"
  ) {
    super(range, {
      arguments: [rootPath, fileName, testName],
      command: "javascript-test-runner.debug.test",
      title
    });
  }
}
