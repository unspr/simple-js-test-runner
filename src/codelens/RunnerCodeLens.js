import {CodeLens} from "vscode";

export default class RunnerCodeLens {
  static get(range, title, mode) {
    const codeLens = new CodeLens(range);
    codeLens.codeLensTitle = title;
    codeLens.mode = mode;
    return codeLens;
  }

  static resolve(codeLens, rootPath, fileName, testName) {
      let command;
      if (codeLens.mode === 'test') {
          command = 'javascript-test-runner.run.test';
      } else if (codeLens.mode === 'debug') {
          command = 'javascript-test-runner.debug.test';
      }

      const title = codeLens.codeLensTitle
          || ((codeLens.mode === 'test') ? 'Run Test' : 'Debug Test');

      codeLens.command = {
          title,
          command,
          arguments: [rootPath, fileName, testName],
      };
  }
}
