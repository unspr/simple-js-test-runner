import _ from 'lodash';
const testTokens = ["describe", "it", "test"];

export default class Parser {
    static getLocationParser(codeLensLocations) {
        return function f(stats) {
            stats.forEach(stat => {
                const expression = stat.expression;
                const callee = expression?.callee;
                if (!testTokens.includes(callee?.name)) {
                    return;
                }

                if (callee.name === "describe") {
                    codeLensLocations.push({ loc: callee.loc });
                    f(expression.arguments[1].body.body);
                } else {
                    codeLensLocations.push({ loc: callee.loc });
                }
            });
        }
    }

    static getTestNameParser(line2TestName) {
        return function f(stats, prefix = '') {
            stats.forEach(stat => {
                const expression = stat.expression;
                const callee = expression?.callee;
                if (!testTokens.includes(callee?.name)) {
                    return;
                }

                let name = expression.arguments[0].value;
                if (!name) {
                    name = getNameContainsPlusOp(expression.arguments[0]);
                }

                const thisTitle = _.escapeRegExp(name);
                const testName = `${prefix}${thisTitle} `;

                if (callee.name === "describe") {
                    line2TestName[callee.loc.start.line] = testName;
                    f(expression.arguments[1].body.body, testName);
                } else {
                    line2TestName[callee.loc.start.line] = testName.replace(/.$/, "$");
                }
            });
        }
    }
}

function getNameContainsPlusOp(binaryExpression) {
    if (binaryExpression.operator !== "+") {
        return binaryExpression.value;
    }

    return getNameContainsPlusOp(binaryExpression.left) + binaryExpression.right.value;
}
