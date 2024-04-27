module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a space before each `it` block in spec.ts files',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
  },
  create: function(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        if (callee.type === 'Identifier' && callee.name === 'it') {
          // Access the line number of the `it` block
          const lineNumber = node.loc.start.line;

          // Access the entire file content
          const fileContent = context.getSourceCode().getText();

          // Split the content by lines
          const lines = fileContent.split('\n');

          // Get the line before the `it` block
          const lineBeforeIt = lines[lineNumber - 2];

          // Check if there is a space before the `it` block
          if (!/^\s*$/.test(lineBeforeIt)) {
            context.report({
              node,
              loc: node.loc,
              message: 'Expected a space before `it` block',
              fix: function(fixer) {
                // Preserve the existing indentation when inserting the space
                const indent = lineBeforeIt.match(/^\s*/)[0];
                return fixer.insertTextBefore(node, `\n${indent}`);
              }
            });
          }
        }
      },
    };
  },
};