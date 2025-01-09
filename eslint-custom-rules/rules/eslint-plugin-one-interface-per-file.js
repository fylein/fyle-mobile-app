module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce only one TypeScript interface or type per file.",
      category: "TypeScript",
      recommended: true,
    },
    schema: [],
  },

  create: function(context) {
    let interfaceCount = 0;
    let typeCount = 0;

    return {
      TSInterfaceDeclaration: function(node) {
        interfaceCount++;

        if (interfaceCount > 1 || typeCount > 0) {
          context.report({
            node,
            message: "Only one TypeScript interface or type is allowed per file.",
          });
        }
      },

      TSTypeAliasDeclaration: function(node) {
        typeCount++;

        if (typeCount > 1 || interfaceCount > 0) {
          context.report({
            node,
            message: "Only one TypeScript interface or type is allowed per file.",
          });
        }
      },

      "Program:exit": function() {
        interfaceCount = 0; // Reset the counters for the next file
        typeCount = 0;
      },
    };
  },
};