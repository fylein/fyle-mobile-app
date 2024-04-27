// Use toBeNull() instead of toBe(null)
// Use toBeUndefined() instead of toBe(undefined)
// Use toBeTrue() instead of toBe(true)
// Use toBeFalse() instead of toBe(false)
// Use toBeNaN() instead of toBe(NaN)

module.exports = {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce using toBeTrue() instead of toBe(true) or toEqual(true)",
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
                    return fixer.replaceText(node.callee, "toBeTrue()");
                }
              });
            }
          }
        }
      };
    }
  };
  