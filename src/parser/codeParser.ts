import { parse } from "@babel/parser";
import _ from "lodash";

const testTokens = ["describe", "it", "test"];

function codeParser(sourceCode) {
  const ast = parse(sourceCode, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
    tokens: false,
  });

  return getStatementsTestObjs(ast.program.body, "");
}

function getNameContainsPlusOp(binaryExpression) {
  if (binaryExpression.operator !== "+") {
    return binaryExpression.value;
  }

  return (
    getNameContainsPlusOp(binaryExpression.left) + binaryExpression.right.value
  );
}

function getStatementsTestObjs(stats, prefixTestName) {
  return _.chain(stats)
    .map((stat) => {
      const expression = stat.expression;
      const callee = expression?.callee;
      if (!callee) {
        return;
      }

      if (!testTokens.includes(callee.name)) {
        return;
      }

      let name = expression.arguments[0].value;
      if (!name) {
        name = getNameContainsPlusOp(expression.arguments[0]);
      }

      const thisTitle = _.escapeRegExp(name);
      const testName = `${prefixTestName}${thisTitle} `;
      if (callee.name === "describe") {
        return [
          {
            loc: callee.loc,
            testName,
          },
          ...getStatementsTestObjs(expression.arguments[1].body.body, testName),
        ];
      } else {
        return [
          {
            loc: callee.loc,
            testName: testName.replace(/.$/, "$"),
          },
        ];
      }
    })
    .filter(Boolean)
    .flatten()
    .value();
}

export { codeParser };
