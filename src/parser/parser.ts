import _ from 'lodash';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';

import BabelASTMaker from './ast/babel-ast-maker';

const suiteSpell = ['describe', 'suite'];
const specSpell = ['it', 'test'];
const spell = [
  ...suiteSpell,
  ...specSpell,
];
export class Parser {
  private astMaker;

  async parseAST(sourceCode) {
    const { parserEngine } = new ConfigurationProvider();
    const astMaker = parserEngine === 'babel' ? new BabelASTMaker()
      : null;
    this.astMaker = astMaker;
    await astMaker.parse(sourceCode);
  }

  async parseTestLine() {
    const locations = await this.astMaker
      .nanoPass(_.curry(Parser.parseLocation)(this.astMaker), []);
    return locations.map(l => l.line);
  }

  async parseTestLine2TestName() {
    const line2TestName = await this.astMaker
      .nanoPass(_.curry(Parser.parseTestName)(this.astMaker), {});
    return line2TestName;
  }

  static parseTestName(astMaker, statement, line2TestName, prefix = '') {
    const callee = astMaker.getCallee(statement);
    if (!spell.includes(callee?.name)) {
      return;
    }

    const specName = astMaker.getSpecName(statement);
    const thisTitle = _.escapeRegExp(specName);
    const testName = `${prefix}${thisTitle} `;
    if (suiteSpell.includes(callee.name)) {
      line2TestName[callee.location.line] = testName;
      const specStmts = astMaker.getSpecStmts(statement);
      specStmts.forEach(o => Parser.parseTestName(astMaker, o, line2TestName, testName));
    } else {
      line2TestName[callee.location.line] = testName.replace(/.$/, '$');
    }
  }

  static parseLocation(astMaker, statement, locations) {
    const callee = astMaker.getCallee(statement);
    if (!spell.includes(callee?.name)) {
      return;
    }

    locations.push(callee.location);
    if (suiteSpell.includes(callee.name)) {
      const specStmts = astMaker.getSpecStmts(statement);
      specStmts.forEach(o => Parser.parseLocation(astMaker, o, locations));
    }
  }
}
