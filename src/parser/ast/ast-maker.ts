export interface ASTMaker {
  parse: (sourceCode: string) => void;
  nanoPass: (func: any, beginWith) => unknown;
  getCallee: (statement) => { name: string, location: { line: number }};
  getSpecName: (statement) => string;
  getSpecStmts: (statement) => unknown[];
}
