import { Terminal, TerminalOptions, window, workspace } from 'vscode';

export class TerminalProvider {
  private activeTerminal: Terminal = null;

  public get(terminalOptions: TerminalOptions): Terminal {
    if (this.activeTerminal) {
      this.activeTerminal.dispose();
    }

    this.activeTerminal = window.createTerminal(terminalOptions);
    this.activeTerminal.sendText(`cd ${workspace.rootPath}`, true);

    return this.activeTerminal;
  }
}
