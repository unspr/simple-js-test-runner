import { CodeLens, CodeLensProvider, TextDocument, workspace } from "vscode";

import _ from "lodash";
import TestRunnerDebugCodeLens from "../codelens/TestDebugRunnerCodeLens";
import TestRunnerCodeLens from "../codelens/TestRunnerCodeLens";
import { codeParser } from "../parser/codeParser";

function getRootPath({ uri }) {
  const activeWorkspace = workspace.getWorkspaceFolder(uri);

  if (activeWorkspace) {
    return activeWorkspace;
  }

  return workspace;
}

function getCodeLens(
  rootPath,
  fileName,
  testName,
  startPosition,
  { testTitle, debugTitle }
) {
  const testRunnerCodeLens = new TestRunnerCodeLens(
    rootPath,
    fileName,
    testName,
    startPosition,
    testTitle
  );

  const debugRunnerCodeLens = new TestRunnerDebugCodeLens(
    rootPath,
    fileName,
    testName,
    startPosition,
    debugTitle
  );

  return [testRunnerCodeLens, debugRunnerCodeLens];
}

export default class TestRunnerCodeLensProvider implements CodeLensProvider {
  public provideCodeLenses(
    document: TextDocument
  ): CodeLens[] | Thenable<CodeLens[]> {
    const rootPath = getRootPath(document);
    const testInfos = codeParser(document.getText());
    const testCodeLens = _.chain(testInfos)
      .map(({ loc, testName }) =>
        getCodeLens(
          rootPath,
          document.fileName,
          testName,
          createRangeObject(document, loc.start),
          // @ts-ignore
          {}
        )
      )
      .flatten()
      .value();

    let fileCodeLens = [];
    if (!_.isEmpty(testInfos)) {
      fileCodeLens = getCodeLens(
        rootPath,
        document.fileName,
        undefined,
        createRangeObject(document, { line: 1 }),
        { testTitle: "Run All Test", debugTitle: "Debug All Test" }
      );
    }

    return [...fileCodeLens, ...testCodeLens];
  }

  public resolveCodeLens?(): CodeLens | Thenable<CodeLens> {
    return;
  }
}

function createRangeObject(document, { line }) {
  return document.lineAt(line - 1).range;
}
