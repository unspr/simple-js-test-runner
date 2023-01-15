import { CodeLens } from 'vscode';

export default class RunnerCodeLens {
  static get(range, title, mode) {
    const codeLens = new CodeLens(range);
    codeLens.codeLensTitle = title;
    codeLens.mode = mode;
    return codeLens;
  }

  static resolve(codeLens, rootPath, fileName, testName) {
    codeLens.command = {
      title: codeLens.codeLensTitle
        || (codeLens.mode === 'test' ? 'Run Test' : 'Debug Test'),

      command: codeLens.mode === 'test' ? 'javascript-test-runner.run.test'
        : codeLens.mode === 'debug' ? 'javascript-test-runner.debug.test'
          : null,
      arguments: [rootPath, fileName, testName],
    };
  }
}
