import { relative } from 'path';
import { WorkspaceFolder } from 'vscode';

import { getTestRunner } from '../runners/TestRunnerFactory';

async function runTest(rootPath: WorkspaceFolder, fileName: string, testName = '') {
  const relativeFilename = relative(rootPath.uri.path, fileName);
  const testRunner = getTestRunner(rootPath);

  testRunner.runTest(rootPath, relativeFilename, testName);
}

export default runTest;
