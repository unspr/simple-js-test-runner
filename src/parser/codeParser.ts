import { parse } from "@babel/parser";
import * as _ from "lodash";

const testTokens = ["describe", "it", "test"];

function codeParser(sourceCode) {
  const parserOptions = {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
    tokens: true
  };
  const ast = parse(sourceCode, parserOptions);

  return getStatementsTestObjs(ast.program.body, "");
}

function getStatementsTestObjs(stats, prefixTestName) {
  return _.chain(stats)
    .map(stat => {
      const expression = stat.expression;
      if (!expression) {
        return;
      }

      const callee = expression.callee;
      if (!_.includes(testTokens, callee.name)) {
        return;
      }

      const testName = prefixTestName
        ? `${prefixTestName} ${expression.arguments[0].value}`
        : expression.arguments[0].value;
      if (callee.name === "describe") {
        return [
          {
            loc: callee.loc,
            testName
          },
          ...getStatementsTestObjs(expression.arguments[1].body.body, testName)
        ];
      } else {
        return [
          {
            loc: callee.loc,
            testName
          }
        ];
      }
    })
    .filter(Boolean)
    .flatten()
    .value();
}

export { codeParser };
