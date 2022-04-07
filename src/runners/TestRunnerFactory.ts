import { existsSync } from 'fs';
import { join } from 'path';
import { WorkspaceFolder, window, workspace } from 'vscode';

import { ITestRunnerInterface } from '../interfaces/ITestRunnerInterface';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { TerminalProvider } from '../providers/TerminalProvider';
import { JestTestRunner } from './JestTestRunner';
import { MochaTestRunner } from './MochaTestRunner';

const terminalProvider = new TerminalProvider();

let testRunnerLog;
function getAvailableTestRunner(testRunners: ITestRunnerInterface[]): ITestRunnerInterface {
  for (const runner of testRunners) {
    const doesRunnerExist = existsSync(join(workspace.rootPath, runner.binPath));

    if (doesRunnerExist) {
      return runner;
    }
  }

  if (!testRunnerLog) {
    testRunnerLog = window.createOutputChannel('Test Runner');
  }

  testRunnerLog.appendLine(`Project root path ${workspace.rootPath}`);
  throw new Error('No test runner in your project. Please install one.');
}

export function getTestRunner(rootPath: WorkspaceFolder): ITestRunnerInterface {
  const provideObj = {
    configurationProvider: new ConfigurationProvider(rootPath),
    terminalProvider,
  };

  const jestTestRunner = new JestTestRunner(provideObj);
  const mochaTestRunner = new MochaTestRunner(provideObj);

  return getAvailableTestRunner([jestTestRunner, mochaTestRunner]);
}
