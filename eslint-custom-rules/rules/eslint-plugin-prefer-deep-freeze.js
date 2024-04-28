module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using deep-freeze-strict on all variables in *.data.ts files to avoid flaky tests',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
  },
  create: function(context) {
    return {
      VariableDeclarator(node) {
        const sourceCode = context.getSourceCode();
        const filename = context.getFilename();

        if (filename.endsWith('.data.ts')) {
          const { id, init } = node;

          if (id && init) {
            const fix = (fixer) => {
              const variableText = sourceCode.getText(init);
              const start = init.range[0];
              const end = init.range[1];

              const fixes = [];

              // Check if deepFreeze is already imported
              const importNodes = sourceCode.ast.body.filter(
                (node) => node.type === 'ImportDeclaration' && node.source.value === 'deep-freeze-strict'
              );
              if (importNodes.length === 0) {
                // Add import statement at the top if not imported
                fixes.push(
                  fixer.insertTextBeforeRange(
                    [sourceCode.ast.range[0], sourceCode.ast.range[0]],
                    "import deepFreeze from 'deep-freeze-strict';\n\n"
                  )
                );
              }

              // Wrap the object or array with deepFreeze method
              fixes.push(
                fixer.replaceTextRange(
                  [start, end],
                  `deepFreeze(${variableText})`
                )
              );

              return fixes;
            };

            if (init.type === 'ObjectExpression' || init.type === 'ArrayExpression') {
              context.report({
                node,
                message: `Use deep-freeze-strict function on variable "${id.name}" to avoid flaky tests`,
                fix,
              });
            }
          }
        }
      },
    };
  },
};
