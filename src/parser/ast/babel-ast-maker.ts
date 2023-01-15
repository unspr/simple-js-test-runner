import { parse } from '@babel/parser';
import { ASTMaker } from './ast-maker';

export default class BabelASTMaker implements ASTMaker{
  private ast: any;

  async parse(sourceCode) {
    const ast = parse(sourceCode, {
      attachComment: false,
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      tokens: false,
    });

    this.ast = ast;
  }

  nanoPass(f, beginWith) {
    const result = beginWith;
    const stats = this.ast.program.body;
    stats.forEach(stat => f(stat, result));
    return result;
  }

  getCallee(statement) {
    const expression = statement.expression;
    if (!expression?.callee) {
      return null;
    }

    const callee = expression.callee;
    return {
      name: callee.name,
      location: { line: callee.loc.start.line },
    };
  }

  getSpecName(statement): string {
    const expression = statement.expression;
    const name = expression.arguments[0].value
      || getNameContainsPlusOp(expression.arguments[0]);
    return name;
  }

  getSpecStmts(statement): unknown[] {
    return statement.expression.arguments[1].body.body;
  }
}

function getNameContainsPlusOp(binaryExpression) {
  if (binaryExpression.operator !== '+') {
    return binaryExpression.value;
  }

  return getNameContainsPlusOp(binaryExpression.left) + binaryExpression.right.value;
}
