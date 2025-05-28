// jest-ts-import-meta-env-transformer.js
const ts = require('typescript');

module.exports = {
  factory: (cs) => {
    return (ctx) => {
      const visitor = (node) => {
        if (
          ts.isPropertyAccessExpression(node) &&
          ts.isMetaProperty(node.expression) &&
          node.expression.keywordToken === ts.SyntaxKind.ImportKeyword &&
          node.expression.name.escapedText === 'meta' &&
          node.name.escapedText === 'env'
        ) {
          // Replace import.meta.env with global.__JEST_IMPORT_META_ENV__
          return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('globalThis'),
            ts.factory.createIdentifier('__JEST_IMPORT_META_ENV__')
          );
        }
        return ts.visitEachChild(node, visitor, ctx);
      };
      return (sf) => ts.visitNode(sf, visitor);
    };
  },
};
