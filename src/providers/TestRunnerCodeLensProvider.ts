import { CodeLens, CodeLensProvider, workspace } from 'vscode';
import RunnerCodeLens from '../codelens/RunnerCodeLens';
import { Parser } from '../parser/parser';

export default class TestRunnerCodeLensProvider implements CodeLensProvider {
  private codeLenses;
  private document;
  private line2TestName;

  public provideCodeLenses(document): CodeLens[] | Thenable<CodeLens[]> {
    return (async () => {
      this.document = document;
      const parser = new Parser();
      await parser.parseAST(document.getText());

      const testLines = await parser.parseTestLine();
      if (testLines.length === 0) {
        return [];
      }

      this.codeLenses = [];
      this.addCodeLens(1, 'test', 'Run All Test');
      this.addCodeLens(1, 'debug', 'Debug All Test');
      for (const line of testLines) {
        this.addCodeLens(line, 'test');
        this.addCodeLens(line, 'debug');
      }

      this.line2TestName = parser.parseTestLine2TestName();

      return this.codeLenses;
    })();
  }

  public resolveCodeLens(codeLens): CodeLens | Thenable<CodeLens> {
    const rootPath = workspace.getWorkspaceFolder(this.document.uri) || workspace;
    const lineNum = codeLens.range.start.line + 1;
    return (async () => {
      this.line2TestName = await this.line2TestName;
      const testName = this.line2TestName[lineNum];
      RunnerCodeLens.resolve(codeLens, rootPath, this.document.fileName, testName);
      return codeLens;
    })();
  }

  private addCodeLens(lineNumber: number, mode: 'test'|'debug', title?: string) {
    const position = this.document.lineAt(lineNumber - 1).range;
    this.codeLenses.push(RunnerCodeLens.get(position, title, mode));
  }
}
