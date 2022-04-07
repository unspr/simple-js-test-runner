import _ from 'lodash';
const testTokens = ['describe', 'it', 'test'];

export default class Parser {
  static getLocationParser(codeLensLocations) {
    return function f(stats) {
      stats.forEach((stat) => {
        const expression = stat.expression;
        const callee = expression?.callee;
        if (!testTokens.includes(callee?.name)) {
          return;
        }

        codeLensLocations.push({ loc: callee.loc });
        if (callee.name === 'describe') {
          f(expression.arguments[1].body.body);
        }
      });
    };
  }

  static getTestNameParser(line2TestName) {
    return function f(stats, prefix = '') {
      stats.forEach((stat) => {
        const expression = stat.expression;
        const callee = expression?.callee;
        if (!testTokens.includes(callee?.name)) {
          return;
        }

        const name = expression.arguments[0].value
         || getNameContainsPlusOp(expression.arguments[0]);

        const thisTitle = _.escapeRegExp(name);
        const testName = `${prefix}${thisTitle} `;

        if (callee.name === 'describe') {
          line2TestName[callee.loc.start.line] = testName;
          f(expression.arguments[1].body.body, testName);
        } else {
          line2TestName[callee.loc.start.line] = testName.replace(/.$/, '$');
        }
      });
    };
  }
}

function getNameContainsPlusOp(binaryExpression) {
  if (binaryExpression.operator !== '+') {
    return binaryExpression.value;
  }

  return getNameContainsPlusOp(binaryExpression.left) + binaryExpression.right.value;
}
