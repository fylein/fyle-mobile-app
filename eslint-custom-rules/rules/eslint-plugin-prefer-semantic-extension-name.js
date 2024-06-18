module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce enums to be defined only in .enum.ts files',
            category: 'Best Practices',
            recommended: true
        },
        schema: [],
    },
    create: function(context) {
        return {
            TSEnumDeclaration: function(node) {
                const fileName = context.getFilename();
                if (!fileName.endsWith('.enum.ts')) {
                    context.report({
                        node,
                        message: 'Enums should be defined only in files with .enum.ts extension',
                    });
                }
            },
            TSInterfaceDeclaration: function(node) {
                const fileName = context.getFilename();
                if (!fileName.endsWith('.model.ts')) {
                    context.report({
                        node,
                        message: 'Interfaces should be defined only in files with .model.ts extension',
                    });
                }
            },
            TSTypeAliasDeclaration: function(node) {
                const fileName = context.getFilename();
                if (!fileName.endsWith('.model.ts')) {
                    context.report({
                        node,
                        message: 'Type aliases should be defined only in files with .model.ts extension',
                    });
                }
            }
        };
    },
};