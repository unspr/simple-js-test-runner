import { parse } from "@babel/parser";

export default class AST {
    static async parse(sourceCode) {
        return parse(sourceCode, {
            attachComment: false,
            plugins: ["jsx", "typescript"],
            sourceType: "module",
            tokens: false,
        })
    }

    static async nanoPass(ast, f) {
        const stats = ast.program.body;
        f(stats);
    }
}
