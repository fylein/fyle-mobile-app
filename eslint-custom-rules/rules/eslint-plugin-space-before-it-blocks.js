var suiteRegexp = /^(f|x)?describe$/;

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
  create: function (context) {
    return {
      CallExpression: function (node) {
        var declWithoutPadding = null;
        if (suiteRegexp.test(node.callee.name)) {
          var declarations = getDescribeDeclarationsContent(node);
          declarations.forEach((decl, i) => {
            var next = declarations[i + 1];
            if (next && !(next.loc.start.line - decl.loc.end.line >= 2)) {
              declWithoutPadding = decl;
            }
          })
        }
        if (declWithoutPadding) {
          context.report({
            message: 'Use new line between declarations for more readability',
            node,
            loc: node.loc,
            fix (fixer) {
              return fixer.insertTextAfter(declWithoutPadding, '\n');
            },
          })
        }
      }
    }
  }
}

function getDescribeDeclarationsContent (describe) {
  var declartionsRegexp = /^(((before|after)(Each|All))|^(f|x)?(it|describe))$/;
  var declarations = [];
  if (describe.arguments && describe.arguments[1] && describe.arguments[1].body && describe.arguments[1].body.body) {
    var content = describe.arguments[1].body.body;
    content.forEach(node => {
      if (node.type === 'ExpressionStatement' && node.expression.callee && declartionsRegexp.test(node.expression.callee.name)) {
        declarations.push(node);
      }
    })
  }
  return declarations;
}