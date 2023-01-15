import { expect } from 'chai';
import TestRunnerCodeLensProvider from '../../providers/TestRunnerCodeLensProvider';
import * as vscode from 'vscode';
import _ from 'lodash';

describe('Test Runner Lens Provider', () => {
  it('tsx syntax', async () => {
    const testFileURI = vscode.Uri.file(`${__dirname}/../../../test_data/tsx-sample.tsx`);
    const textDoc = await vscode.workspace.openTextDocument(testFileURI);

    const settings = vscode.workspace.getConfiguration('javascript-test-runner');
    await Promise.all(['babel'].map(async (engine) => {
      await settings.update('parserEngine', engine, vscode.ConfigurationTarget.Global);

      const provider = new TestRunnerCodeLensProvider();
      const codeLenses = await provider.provideCodeLenses(textDoc);
      expect(codeLenses).have.lengthOf(12);
      const solvedCodeLenses = await Promise.all(codeLenses.map(o => provider.resolveCodeLens(o)));
      const codeLensCommands = _.map(solvedCodeLenses, 'command');

      expect(codeLensCommands[0].title).to.equal('Run All Test');
      expect(codeLensCommands[1].title).to.equal('Debug All Test');
      expect(solvedCodeLenses[0].range.start.line).to.equal(0);

      expect(codeLensCommands[3].title).to.equal('Debug Test');
      expect(codeLensCommands[3].command).to.equal('javascript-test-runner.debug.test');
      expect(codeLensCommands[3].arguments[2]).to.equal('JsonFormTextField ');
      expect(solvedCodeLenses[3].range.start.line).to.equal(3);

      expect(codeLensCommands[8].title).to.equal('Run Test');
      expect(codeLensCommands[8].command).to.equal('javascript-test-runner.run.test');
      expect(codeLensCommands[8].arguments[2]).to.equal('Json\\$FormTextField2 \\| Test render\'2$');
      expect(solvedCodeLenses[8].range.start.line).to.equal(21);
    }));
  });
});
