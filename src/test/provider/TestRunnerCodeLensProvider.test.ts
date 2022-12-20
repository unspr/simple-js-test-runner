import { expect } from 'chai';
import TestRunnerCodeLensProvider from '../../providers/TestRunnerCodeLensProvider';
import * as vscode from 'vscode';
import _ from 'lodash';

describe('Test Runner Lens Provider', () => {
  it('tsx syntax', async () => {
    const textDoc = await vscode.workspace.openTextDocument(
      vscode.Uri.file(`${__dirname}/../../../test_data/tsx-sample.tsx`)
    );
    const provider = new TestRunnerCodeLensProvider();
    const codeLenses = await provider.provideCodeLenses(textDoc);
    expect(codeLenses).have.lengthOf(10);
    const solvedCodeLenses = await Promise.all(codeLenses.map((o) => provider.resolveCodeLens(o)));
    const codeLensCommands = _.map(solvedCodeLenses, 'command');
    expect(codeLensCommands[3].title).to.equal('Debug Test');
    expect(codeLensCommands[3].arguments[2]).to.equal('JsonFormTextField ');
    expect(codeLensCommands[8].title).to.equal('Run Test');
    expect(codeLensCommands[8].arguments[2]).to.equal('Json\\$FormTextField2 \\| Test render\'2$');
  });
});
