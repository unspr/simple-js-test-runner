import { CodeLens, CodeLensProvider, workspace } from 'vscode';
import RunnerCodeLens from '../codelens/RunnerCodeLens';
import AST from '../parser/ast';
import Parser from '../parser/parser';

function getRootPath({ uri }) {
  const activeWorkspace = workspace.getWorkspaceFolder(uri);

  if (activeWorkspace) {
    return activeWorkspace;
  }

  return workspace;
}

export default class TestRunnerCodeLensProvider implements CodeLensProvider {
  private codeLenses;
  private document;
  private ast;
  private line2TestName;

  public provideCodeLenses(document): CodeLens[] | Thenable<CodeLens[]> {
    return (async () => {
      this.document = document;
      this.ast = await AST.parse(document.getText());

      const codeLensLocations = [];
      await AST.nanoPass(this.ast, Parser.getLocationParser(codeLensLocations));

      if (codeLensLocations.length === 0) {
        return [];
      }

      this.codeLenses = [];
      this.addCodeLens(createRangeObject(document, { line: 1 }), {
        debugTitle: 'Debug All Test',
        testTitle: 'Run All Test',
      });

      for (const { loc } of codeLensLocations) {
        this.addCodeLens(createRangeObject(document, loc.start));
      }

      const line2TestName = {};
      this.line2TestName = line2TestName;
      AST.nanoPass(this.ast, Parser.getTestNameParser(line2TestName));

      return this.codeLenses;
    })();
  }

  public resolveCodeLens(codeLens): CodeLens | Thenable<CodeLens> {
    const rootPath = getRootPath(this.document);
    const lineNum = codeLens.range.start.line + 1;
    const testName = this.line2TestName[lineNum];
    RunnerCodeLens.resolve(codeLens, rootPath, this.document.fileName, testName);
    return codeLens;
  }

  private addCodeLens(startPosition, titleObj?) {
    const { testTitle, debugTitle } = titleObj || {};
    this.codeLenses.push(
      RunnerCodeLens.get(startPosition, testTitle, 'test'),
      RunnerCodeLens.get(startPosition, debugTitle, 'debug')
    );
  }
}

function createRangeObject(document, { line }) {
  return document.lineAt(line - 1).range;
}
