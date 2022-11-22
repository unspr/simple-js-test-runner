import { workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';

export class ConfigurationProvider {
  public configuration: WorkspaceConfiguration = null;

  constructor(rootPath: WorkspaceFolder) {
    this.configuration = workspace.getConfiguration('javascript-test-runner', rootPath.uri);
  }

  get environmentVariables() {
    const envVars = this.configuration.get('envVars');
    envVars['NODE_ENV'] = 'test';
    return envVars;
  }

  get additionalArguments(): string {
    return this.configuration.get('additionalArgs');
  }
}
