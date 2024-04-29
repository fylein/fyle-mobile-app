// Use toBeNull() instead of toBe(null) or toEqual(null)
// Use toBeUndefined() instead of toBe(undefined) or toEqual(undefined)
// Use toBeTrue() instead of toBe(true) or toEqual(true)
// Use toBeFalse() instead of toBe(false) or toEqual(false)
// Use toBeNaN() instead of toBe(NaN) or toEqual(NaN)

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using toBeTrue(), toBeFalse(), toBeNull(), and toBeUndefined() instead of toBe() or toEqual() with true, false, null, or undefined",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create: function (context) {
    return {
      CallExpression(node) {
        const isToBe = node.callee.property && node.callee.property.name === "toBe";
        const isToEqual = node.callee.property && node.callee.property.name === "toEqual";

        if ((isToBe || isToEqual) && node.arguments.length === 1) {
          const argValue = node.arguments[0].value;
          if (argValue === true) {
            context.report({
              node,
              message: "Prefer using toBeTrue() instead of toBe(true) or toEqual(true)",
              fix: function (fixer) {
                const replacementText = 'toBeTrue()';
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
            
                // Find the correct part of the code to replace
                const match = nodeText.match(/\.toBe\((true)\)|\.toEqual\((true)\)/);
                if (match) {
                    const start = node.callee.property.range[0];
                    const end = node.callee.property.range[1] + 6; // Adjust end position
                    return fixer.replaceTextRange([start, end], replacementText);
                }
            
                return null; // No match found, no fix needed
              }
            });
          } else if (argValue === false) {
            context.report({
              node,
              message: "Prefer using toBeFalse() instead of toBe(false) or toEqual(false)",
              fix: function (fixer) {
                const replacementText = 'toBeFalse()';
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
            
                // Find the correct part of the code to replace
                const match = nodeText.match(/\.toBe\((false)\)|\.toEqual\((false)\)/);
                if (match) {
                    const start = node.callee.property.range[0];
                    const end = node.callee.property.range[1] + 7; // Adjust end position
                    return fixer.replaceTextRange([start, end], replacementText);
                }
            
                return null; // No match found, no fix needed
              }
            });
          } else if (argValue === null) {
            context.report({
              node,
              message: "Prefer using toBeNull() instead of toBe(null) or toEqual(null)",
              fix: function (fixer) {
                const replacementText = 'toBeNull()';
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
            
                // Find the correct part of the code to replace
                const match = nodeText.match(/\.toBe\((null)\)|\.toEqual\((null)\)/);
                if (match) {
                    const start = node.callee.property.range[0];
                    const end = node.callee.property.range[1] + 5; // Adjust end position
                    return fixer.replaceTextRange([start, end], replacementText);
                }
            
                return null; // No match found, no fix needed
              }
            });
          } else if (argValue === undefined && node.arguments[0].name === 'undefined') {
            // Comparing the name of the argument to undefined since every variable is undefined by default in AST
            context.report({
              node,
              message: "Prefer using toBeUndefined() instead of toBe(undefined) or toEqual(undefined)",
              fix: function (fixer) {
                const replacementText = 'toBeUndefined()';
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
            
                // Find the correct part of the code to replace
                const match = nodeText.match(/\.toBe\((undefined)\)|\.toEqual\((undefined)\)/);
                if (match) {
                    const start = node.callee.property.range[0];
                    const end = node.callee.property.range[1] + 11; // Adjust end position
                    return fixer.replaceTextRange([start, end], replacementText);
                }
            
                return null; // No match found, no fix needed
              }
            });
          } else if (node.arguments[0].name === 'NaN') {
            // Since NaN === NaN returns false, we are comparing the name of the argument to NaN
            context.report({
              node,
              message: "Prefer using toBeNaN() instead of toBe(NaN) or toEqual(NaN)",
              fix: function (fixer) {
                const replacementText = 'toBeNaN()';
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
            
                // Find the correct part of the code to replace
                const match = nodeText.match(/\.toBe\((NaN)\)|\.toEqual\((NaN)\)/);
                if (match) {
                    const start = node.callee.property.range[0];
                    const end = node.callee.property.range[1] + 6; // Adjust end position
                    return fixer.replaceTextRange([start, end], replacementText);
                }
            
                return null; // No match found, no fix needed
              }
            });
          }
        }
      }
    };
  }
};
