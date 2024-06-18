module.exports = {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce only one TypeScript enum per file.",
        category: "TypeScript",
        recommended: true,
      },
      schema: [],
    },
  
    create: function(context) {
      let enumCount = 0;
  
      return {
        TSEnumDeclaration: function(node) {
          enumCount++;
  
          if (enumCount > 1) {
            context.report({
              node,
              message: "Only one TypeScript enum is allowed per file.",
            });
          }
        },
        "Program:exit": function() {
          enumCount = 0; // Reset the counters for the next file
        },
      };
    },
  };