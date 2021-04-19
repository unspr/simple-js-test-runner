import { parse } from "@babel/parser";
import * as _ from "lodash";

import escapeStringRegexp from "escape-string-regexp";

const testTokens = ["describe", "it", "test"];

function codeParser(sourceCode) {
  const ast = parse(sourceCode, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
    tokens: false
  });

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
      if (!callee) {
        return;
      }

      if (!_.includes(testTokens, callee.name)) {
        return;
      }

      const testName = escapeStringRegexp(
        `${prefixTestName}${expression.arguments[0].value} `
      );
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
            testName: testName.replace(/.$/, "$")
          }
        ];
      }
    })
    .filter(Boolean)
    .flatten()
    .value();
}

export { codeParser };
